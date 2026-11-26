/**
 * Client-IP derivation and rate-limit endpoint classification (pure).
 *
 * `X-Forwarded-For` / `X-Real-IP` are only trusted when the deployment
 * declares a trusted proxy (`TRUST_PROXY_HEADERS=true`, e.g. behind
 * Vercel/the platform load balancer). Otherwise those headers are
 * attacker-controlled and must not steer rate limiting or audit logs.
 */

const SENSITIVE_ENDPOINTS = new Set([
  'login',
  'register',
  'forgot_password',
  'password_reset',
  'mfa',
]);

export function isSensitiveEndpoint(endpoint: string): boolean {
  return SENSITIVE_ENDPOINTS.has(endpoint);
}

export function trustProxyHeaders(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.TRUST_PROXY_HEADERS === 'true' || Boolean(env.VERCEL);
}

export function getClientIp(request: Request): string {
  if (trustProxyHeaders()) {
    const forwarded = request.headers.get('x-forwarded-for');
    const first = forwarded?.split(',')[0]?.trim();
    if (first) return first;
    const real = request.headers.get('x-real-ip')?.trim();
    if (real) return real;
  }
  return 'unknown';
}
