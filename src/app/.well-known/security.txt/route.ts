/**
 * RFC 9116 security.txt — machine-readable vulnerability-disclosure policy.
 * Contact is BloomRCM's public business inbox (owner-supplied).
 */
export function GET() {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const body = [
    'Contact: mailto:bloomrcm@gmail.com',
    'Contact: https://bloomrcm.vercel.app',
    `Expires: ${expires}`,
    'Preferred-Languages: en, ur, hi, es, ar',
    'Canonical: /.well-known/security.txt',
    'Policy: /security',
    '',
    '# Please do not access another organization\'s data while testing, and',
    '# allow a reasonable fix window before publishing details.',
    '',
  ].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
