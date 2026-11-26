/**
 * Structured security-event logging.
 *
 * Emits one JSON line per event to stdout (captured by the hosting
 * platform's log pipeline). Never log passwords, raw tokens, session
 * cookies, PHI, or file contents — callers pass identifiers only
 * (user/org/claim ids, emails for auth events, IPs, user agents).
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'session',
  'cookie',
  'filedata',
  'secret',
  'mfasecret',
  'recoverycode',
]);

export type SecurityEventType =
  | 'auth.login_failure'
  | 'auth.login_success'
  | 'auth.mfa_failure'
  | 'auth.demo_login_blocked'
  | 'auth.password_reset_rejected'
  | 'authz.claim_review_bypass_blocked'
  | 'authz.forbidden'
  | 'upload.rejected'
  | 'ratelimit.blocked'
  | 'ratelimit.backend_unavailable';

export function logSecurityEvent(
  type: SecurityEventType,
  fields: Record<string, unknown> = {}
): void {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) continue;
    safe[k] = typeof v === 'string' ? v.slice(0, 300) : v;
  }
  console.warn(
    JSON.stringify({ level: 'security', type, at: new Date().toISOString(), ...safe })
  );
}
