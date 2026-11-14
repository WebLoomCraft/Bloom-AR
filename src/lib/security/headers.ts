/**
 * HTTP security headers applied to every response by `src/proxy.ts`.
 * Pure/edge-safe (no Node APIs) so it can be unit-tested and used at the edge.
 *
 * The CSP is deliberately compatible with how this app is actually built:
 * Next.js inline bootstrap scripts, Google Fonts, and Vercel Speed Insights.
 * It still blocks plugins, foreign scripts/frames, and form posts off-site.
 */
export function contentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    // Next.js injects small inline bootstrap scripts; external script CDNs are denied.
    "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // The app is legitimately embedded in hosted preview frames; anything
    // else framing it (clickjacking) is denied.
    "frame-ancestors 'self' https://*.e2b.app https://*.vercel.app",
  ].join('; ');
}

export function buildSecurityHeaders(proto?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': contentSecurityPolicy(),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.stripe.com"), usb=(), magnetometer=(), gyroscope=()',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  };
  // HSTS only makes sense over HTTPS (local http previews ignore it anyway,
  // but sending it there can pin a dev host — so gate on the real protocol).
  if (proto === 'https') {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  }
  return headers;
}
