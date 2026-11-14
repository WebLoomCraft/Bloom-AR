import { NextRequest, NextResponse } from 'next/server';
import { buildSecurityHeaders } from '@/lib/security/headers';
import { isMutationAllowed } from '@/lib/security/csrf';

/**
 * Edge security layer for the whole application (Next.js proxy):
 *  1. Security headers (CSP, HSTS, nosniff, referrer/permissions policy) on
 *     every response.
 *  2. CSRF origin validation for cookie-authenticated API mutations (the
 *     session cookie is SameSite=None for permitted preview embedding, so
 *     this is the compensating control — see src/lib/security/csrf.ts).
 *  3. A coarse per-IP rate limit as a first line of defence in front of the
 *     durable, per-endpoint database rate limiter (src/lib/rate-limit.ts).
 *
 * The limiter here is per-instance memory: best-effort burst protection, not
 * the system of record. Auth endpoints keep their stricter DB-backed limits.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

function burstLimit(req: NextRequest): number | null {
  const path = req.nextUrl.pathname;
  if (!path.startsWith('/api/')) return null;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const isAuth = path.startsWith('/api/auth/');
  const limit = isAuth ? 60 : 600; // per minute per IP; DB limiter is stricter per endpoint
  const key = `${ip}:${isAuth ? 'auth' : 'api'}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) return Math.ceil((bucket.resetAt - now) / 1000);
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) CSRF gate (API mutations only; logic in lib/security/csrf.ts).
  if (pathname.startsWith('/api/')) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ok = isMutationAllowed({
      method: req.method,
      pathname,
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer'),
      secFetchSite: req.headers.get('sec-fetch-site'),
      host: req.headers.get('host'),
      hasSessionCookie: Boolean(req.cookies.get('session')),
      allowedOrigins,
    });
    if (!ok) {
      return withHeaders(
        NextResponse.json(
          { error: 'Cross-site request blocked.', code: 'CSRF_BLOCKED' },
          { status: 403 }
        ),
        req
      );
    }

    // 2) Burst rate limit.
    const retryAfter = burstLimit(req);
    if (retryAfter !== null) {
      return withHeaders(
        NextResponse.json(
          { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        ),
        req
      );
    }
  }

  return withHeaders(NextResponse.next(), req);
}

function withHeaders(res: NextResponse, req: NextRequest): NextResponse {
  const proto =
    req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');
  for (const [k, v] of Object.entries(buildSecurityHeaders(proto))) {
    res.headers.set(k, v);
  }
  return res;
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|logo-mark.svg).*)'],
};
