import { db } from '@/db';
import { rateLimits } from '@/db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { logSecurityEvent } from './security-log.ts';
import { isSensitiveEndpoint } from './security/client-ip.ts';
export { getClientIp, trustProxyHeaders, isSensitiveEndpoint } from './security/client-ip.ts';

/**
 * Database-backed rate limiting (works across application instances).
 *
 * Atomicity: each check runs in a transaction that first takes a
 * PostgreSQL advisory lock keyed by (key, endpoint), then deletes expired
 * rows, counts the live window, and inserts the new hit. Concurrent
 * requests for the same key are serialized by the lock, so they cannot
 * all observe "below limit" and slip through together.
 *
 * Failure mode: sensitive endpoints (login, registration, password reset,
 * ...) FAIL CLOSED when the limiter backend is unavailable — an outage of
 * the rate-limit table must not disable brute-force protection. Non-
 * sensitive endpoints fail open for availability.
 *
 * Client IP: `X-Forwarded-For` / `X-Real-IP` are only trusted when the
 * deployment declares a trusted proxy (`TRUST_PROXY_HEADERS=true`, e.g.
 * behind Vercel/the platform load balancer). Otherwise the headers are
 * attacker-controlled and are ignored.
 */

const LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  login: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  register: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  forgot_password: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  password_reset: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  leads: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per min
  ai_analysis: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per min
  file_upload: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 per 5 min
  era_process: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per min
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export async function checkRateLimit(
  key: string,
  endpoint: string
): Promise<RateLimitResult> {
  const config = LIMITS[endpoint] || LIMITS.api;
  const now = new Date();

  try {
    return await db.transaction(async (tx) => {
      // Serialize concurrent checks for the same (key, endpoint).
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${key}:${endpoint}`}, 0))`
      );

      await tx
        .delete(rateLimits)
        .where(
          and(
            eq(rateLimits.key, key),
            eq(rateLimits.endpoint, endpoint),
            sql`${rateLimits.expiresAt} < ${now}`
          )
        );

      const [current] = await tx
        .select({ total: sql<number>`COALESCE(SUM(count), 0)::int` })
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.key, key),
            eq(rateLimits.endpoint, endpoint),
            gt(rateLimits.expiresAt, now)
          )
        );

      const currentCount = current?.total || 0;

      if (currentCount >= config.maxRequests) {
        logSecurityEvent('ratelimit.blocked', { endpoint, key });
        return { allowed: false, remaining: 0, retryAfterMs: config.windowMs };
      }

      const expiresAt = new Date(now.getTime() + config.windowMs);
      await tx
        .insert(rateLimits)
        .values({ key, endpoint, count: 1, windowStart: now, expiresAt });

      return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        retryAfterMs: 0,
      };
    });
  } catch (error) {
    if (isSensitiveEndpoint(endpoint)) {
      logSecurityEvent('ratelimit.backend_unavailable', { endpoint, mode: 'fail_closed' });
      console.error(`Rate limiter unavailable for sensitive endpoint "${endpoint}"; failing closed.`, error);
      return { allowed: false, remaining: 0, retryAfterMs: 60_000 };
    }
    console.error(`Rate limiter error for "${endpoint}"; failing open.`, error);
    return { allowed: true, remaining: config.maxRequests, retryAfterMs: 0 };
  }
}

