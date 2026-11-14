/**
 * CSRF protection for cookie-authenticated API mutations.
 *
 * The session cookie is `SameSite=None` (the app runs inside permitted
 * cross-origin preview frames), so the browser alone does not stop a
 * cross-site form/fetch from riding a signed-in session. This check is the
 * compensating control: for state-changing API requests we require the
 * `Origin` (or `Sec-Fetch-Site`) to prove the request came from this app.
 *
 * Exempt by design:
 *  - Stripe webhook (`/api/subscriptions/webhook`) — authenticated by Stripe's
 *    HMAC signature, not cookies.
 *  - `/api/v1/*` — authenticated by hashed API keys, no session cookie.
 *  - Requests with no session cookie and no Origin (server-to-server/curl):
 *    they carry no ambient authority, and the route itself will 401.
 */

export const CSRF_EXEMPT_PREFIXES = ['/api/subscriptions/webhook', '/api/v1/'] as const;

export function isCsrfExemptPath(pathname: string): boolean {
  return CSRF_EXEMPT_PREFIXES.some((p) => pathname === p.replace(/\/$/, '') || pathname.startsWith(p));
}

export interface CsrfInput {
  method: string;
  pathname: string;
  /** Value of the Origin header, if sent */
  origin: string | null;
  /** Value of the Referer header, if sent */
  referer: string | null;
  /** Sec-Fetch-Site header, if sent */
  secFetchSite: string | null;
  /** Host header of this request (e.g. "app.example.com") */
  host: string | null;
  /** Whether the request carries the `session` cookie */
  hasSessionCookie: boolean;
  /** Extra trusted origins from env (comma-separated in the proxy) */
  allowedOrigins?: string[];
}

function originHost(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

/** True when a request is allowed to proceed past the CSRF gate. */
export function isMutationAllowed(input: CsrfInput): boolean {
  const method = input.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;
  if (!input.pathname.startsWith('/api/')) return true;
  if (isCsrfExemptPath(input.pathname)) return true;

  const allowed = new Set<string>();
  if (input.host) allowed.add(input.host);
  for (const o of input.allowedOrigins ?? []) {
    const h = originHost(o) ?? o;
    if (h) allowed.add(h);
  }

  // A browser same-origin mutation always sends Origin — trust it if it
  // points back at us (or an explicitly allowed origin).
  const oh = originHost(input.origin);
  if (oh) return allowed.has(oh);

  // No Origin: fall back to Referer, then Sec-Fetch-Site.
  const rh = originHost(input.referer);
  if (rh) return allowed.has(rh);
  if (input.secFetchSite) {
    return input.secFetchSite === 'same-origin' || input.secFetchSite === 'same-site' || input.secFetchSite === 'none';
  }

  // No provenance headers at all: only a cookie-carrying request is a CSRF
  // risk (ambient authority). Cookie-less calls fall through to route auth.
  return !input.hasSessionCookie;
}
