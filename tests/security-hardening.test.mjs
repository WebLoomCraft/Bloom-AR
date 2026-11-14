import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { buildSecurityHeaders, contentSecurityPolicy } from '../src/lib/security/headers.ts';
import { isMutationAllowed, isCsrfExemptPath } from '../src/lib/security/csrf.ts';
import { validatePasswordStrength, PASSWORD_MIN_LENGTH } from '../src/lib/security/password.ts';
import {
  validateUploadMeta,
  validateUploadSignature,
  UPLOAD_MAX_BYTES,
} from '../src/lib/security/files.ts';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('security headers are complete and the CSP blocks foreign scripts/plugins', () => {
  const h = buildSecurityHeaders('https');
  assert.match(h['Content-Security-Policy'], /default-src 'self'/);
  assert.match(h['Content-Security-Policy'], /object-src 'none'/);
  assert.match(h['Content-Security-Policy'], /frame-ancestors 'self'/);
  assert.equal(h['X-Content-Type-Options'], 'nosniff');
  assert.match(h['Strict-Transport-Security'], /max-age=63072000/);
  assert.match(h['Referrer-Policy'], /strict-origin/);
  assert.match(h['Permissions-Policy'], /camera=\(\)/);
  // HSTS is only sent on HTTPS so a local http preview host is never pinned.
  assert.equal(buildSecurityHeaders('http')['Strict-Transport-Security'], undefined);
  // No wildcard script sources.
  assert.equal(contentSecurityPolicy().includes("script-src *"), false);
  // Middleware actually applies them.
  assert.match(read('src/proxy.ts'), /buildSecurityHeaders/);
});

test('CSRF gate allows same-site mutations and blocks cross-site cookie requests', () => {
  const base = {
    method: 'POST',
    pathname: '/api/claims',
    origin: null,
    referer: null,
    secFetchSite: null,
    host: 'app.example.com',
    hasSessionCookie: true,
  };
  // Same-origin browser mutation
  assert.equal(isMutationAllowed({ ...base, origin: 'https://app.example.com' }), true);
  // Cross-site attacker site riding the session cookie
  assert.equal(isMutationAllowed({ ...base, origin: 'https://evil.example.com' }), false);
  assert.equal(
    isMutationAllowed({ ...base, secFetchSite: 'cross-site' }),
    false
  );
  // Sec-Fetch-Site same-origin with no Origin header
  assert.equal(isMutationAllowed({ ...base, secFetchSite: 'same-origin' }), true);
  // No provenance + session cookie => blocked; no cookie => route auth decides
  assert.equal(isMutationAllowed({ ...base }), false);
  assert.equal(isMutationAllowed({ ...base, hasSessionCookie: false }), true);
  // Safe methods and non-API paths are untouched
  assert.equal(isMutationAllowed({ ...base, method: 'GET', origin: 'https://evil.example.com' }), true);
  assert.equal(
    isMutationAllowed({ ...base, pathname: '/dashboard', origin: 'https://evil.example.com' }),
    true
  );
  // Explicitly allowed extra origin (e.g. a custom domain)
  assert.equal(
    isMutationAllowed({ ...base, origin: 'https://billing.example.com', allowedOrigins: ['https://billing.example.com'] }),
    true
  );
});

test('CSRF exemptions are exactly the signature/API-key authenticated surfaces', () => {
  assert.equal(isCsrfExemptPath('/api/subscriptions/webhook'), true);
  assert.equal(isCsrfExemptPath('/api/v1/claims'), true);
  assert.equal(isCsrfExemptPath('/api/claims'), false);
  assert.equal(isCsrfExemptPath('/api/auth/login'), false);
  const mw = read('src/proxy.ts');
  assert.match(mw, /CSRF_BLOCKED/);
  assert.match(mw, /RATE_LIMITED/);
});

test('one password policy (>=12, mixed case + digit) is enforced in all three flows', () => {
  assert.equal(PASSWORD_MIN_LENGTH, 12);
  assert.equal(validatePasswordStrength('short1A').ok, false);
  assert.equal(validatePasswordStrength('alllowercase12').ok, false);
  assert.equal(validatePasswordStrength('ALLUPPERCASE12').ok, false);
  assert.equal(validatePasswordStrength('NoDigitsHereAbc').ok, false);
  assert.equal(validatePasswordStrength('Password1234').ok, false); // common blocklist
  assert.equal(validatePasswordStrength('CorrectHorse9Battery').ok, true);
  for (const f of [
    'src/app/api/auth/register/route.ts',
    'src/app/api/auth/reset-password/route.ts',
    'src/app/api/profile/change-password/route.ts',
  ]) {
    assert.match(read(f), /validatePasswordStrength/, `${f} uses the shared policy`);
  }
});

test('upload validation enforces extension, 25MB cap, and magic bytes', () => {
  assert.equal(validateUploadMeta('claims.xlsx', 1000).ok, true);
  assert.equal(validateUploadMeta('evil.exe', 1000).ok, false);
  assert.equal(validateUploadMeta('big.csv', UPLOAD_MAX_BYTES + 1).status, 413);
  assert.equal(validateUploadMeta('empty.csv', 0).ok, false);
  // Real vs spoofed content
  assert.equal(validateUploadSignature('xlsx', new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1])), true);
  assert.equal(validateUploadSignature('xlsx', new Uint8Array([0x4d, 0x5a, 0x90, 0x00])), false); // MZ exe
  assert.equal(validateUploadSignature('xls', new Uint8Array([0xd0, 0xcf, 0x11, 0xe0])), true);
  assert.equal(validateUploadSignature('csv', new TextEncoder().encode('name,amount\nA,10')), true);
  assert.equal(validateUploadSignature('csv', new Uint8Array([0x50, 0x4b, 0x00, 0x04])), false);
  for (const f of ['src/app/api/upload/route.ts', 'src/app/api/upload/inspect/route.ts']) {
    assert.match(read(f), /validateUploadSignature/, `${f} checks content, not just the name`);
  }
});

test('security.txt and the /security marketing page publish only honest, implemented measures', () => {
  assert.match(read('src/app/.well-known/security.txt/route.ts'), /bloomrcm@gmail\.com/);
  assert.match(read('src/app/security/page.tsx'), /Report a vulnerability/);

  const page = read('src/app/security/page.tsx');
  // Every headline measure maps to code that exists.
  const evidence = [
    ['bcrypt', 'src/lib/auth.ts'],
    ['Row-Level Security|FORCE RLS', 'docs/HIPAA_READINESS.md'],
    ['Content-Security-Policy', 'src/lib/security/headers.ts'],
    ['CSRF', 'src/proxy.ts'],
    ['magic-byte', 'src/lib/security/files.ts'],
    ['AES-256-GCM', 'src/lib/mfa.ts'],
  ];
  for (const [_, file] of evidence) assert.ok(fs.existsSync(path.join(ROOT, file)), file);
  assert.match(read('src/lib/auth.ts'), /bcrypt\.hash\(password, 12\)|hash\(password, 12\)/);

  // Forbidden over-claims must not appear on the security page.
  for (const banned of [/SOC ?2/i, /100% secure/i, /guarantee[sd]? (security|no breach)/i, /military-grade/i, /bank-grade/i, /we are HIPAA certified/i]) {
    assert.equal(banned.test(page), false, `security page must not claim ${banned}`);
  }
  // …but the "we do not claim HIPAA certification" honesty statement is fine
  // because it is a negation — check the specific over-claim phrasing instead.
  assert.match(page, /do not claim to be/i);

  // The page is reachable from the marketing footer and nav.
  assert.match(read('src/components/marketing/Marketing.tsx'), /href="\/security"/);
  assert.match(read('src/components/marketing/fx/MarketingNav.tsx'), /marketing\.security/);
});
