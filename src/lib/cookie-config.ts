import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export function getSessionCookieOptions(): Partial<ResponseCookie> {
  // 'none' is required when the app is embedded in a permitted cross-origin
  // frame (hosted previews). CSRF origin validation in src/proxy.ts is
  // the compensating control. In a normal first-party production deployment,
  // set SESSION_COOKIE_SAMESITE=lax for the stricter default.
  const sameSite = (process.env.SESSION_COOKIE_SAMESITE || 'none').toLowerCase();
  return {
    httpOnly: true,
    secure: true,
    sameSite: (sameSite === 'lax' || sameSite === 'strict' ? sameSite : 'none') as
      | 'none'
      | 'lax'
      | 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  };
}
