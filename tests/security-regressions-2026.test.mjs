import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  evaluateGenericClaimStatusTransition,
  findProtectedClaimFields,
  REVIEW_ONLY_STATUSES,
} from '../src/lib/claims-authz.ts';
import {
  validateDocumentUpload,
  validateDocumentSignature,
  sanitizeFileName,
  safeDownloadContentType,
  safeDownloadHeaders,
  DOCUMENT_MAX_BYTES,
} from '../src/lib/security/files.ts';
import {
  DEMO_ACCOUNT_EMAILS,
  isDemoAccountEmail,
  isDemoLoginBlocked,
  assertNoDemoModeInProduction,
} from '../src/lib/demo-guard.ts';
import { getClientIp, trustProxyHeaders, isSensitiveEndpoint } from '../src/lib/security/client-ip.ts';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ

/* ---------------- 1. Claim approval bypass via generic PATCH ---------------- */

test('generic claim updates cannot produce review outcomes (self-approval bypass)', () => {
  for (const to of REVIEW_ONLY_STATUSES) {
    const v = evaluateGenericClaimStatusTransition('submitted_for_review', to);
    assert.equal(v.allowed, false, `submitted_for_review -> ${to} must be denied`);
    assert.equal(v.status, 403, `${to} is a review-only outcome`);
  }
  // The exact reported bypass: assigned worker marks their own claim approved.
  const selfApprove = evaluateGenericClaimStatusTransition('in_progress', 'approved');
  assert.equal(selfApprove.allowed, false);
  assert.equal(selfApprove.status, 403);
  // Terminal states cannot be reopened through the generic endpoint either.
  assert.equal(evaluateGenericClaimStatusTransition('approved', 'in_progress').allowed, false);
  assert.equal(evaluateGenericClaimStatusTransition('submitted_for_review', 'in_progress').allowed, false);
});

test('generic claim transitions validate status values and allowed moves', () => {
  assert.equal(evaluateGenericClaimStatusTransition('new', 'in_progress').allowed, true);
  assert.equal(evaluateGenericClaimStatusTransition('in_progress', 'submitted_for_review').allowed, true);
  assert.equal(evaluateGenericClaimStatusTransition('rework_required', 'in_progress').allowed, true);
  assert.equal(evaluateGenericClaimStatusTransition('new', 'new').allowed, true); // no-op edit
  const bad = evaluateGenericClaimStatusTransition('new', 'hacked_status');
  assert.equal(bad.allowed, false);
  assert.equal(bad.status, 400);
  assert.equal(evaluateGenericClaimStatusTransition('new', 42).allowed, false);
  assert.equal(evaluateGenericClaimStatusTransition('paid', 'pending').allowed, false);
});

test('protected claim fields are detected and rejected by the PATCH route', () => {
  assert.deepEqual(
    findProtectedClaimFields({ approvedBy: 'x', organizationId: 'y', patientName: 'ok' }),
    ['approvedBy', 'organizationId']
  );
  assert.deepEqual(findProtectedClaimFields({ patientName: 'ok' }), []);
  const route = read('src/app/api/claims/[id]/route.ts');
  assert.match(route, /evaluateGenericClaimStatusTransition/);
  assert.match(route, /findProtectedClaimFields/);
  assert.equal(/updateData\.approvedBy/.test(route), false, 'PATCH must never stamp approvedBy');
  // Dedicated review endpoints still own approval and block self-approval.
  assert.match(read('src/app/api/claims/[id]/review/route.ts'), /You cannot approve your own work/);
  assert.match(read('src/app/api/claims/[id]/workflow/route.ts'), /You cannot approve your own work/);
});

/* ---------------- 2. Read-only visibility ---------------- */

test('read-only status never widens visibility anywhere in the API', () => {
  const apiRoot = path.join(ROOT, 'src/app/api');
  const offenders = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name === 'route.ts') {
        const src = fs.readFileSync(full, 'utf8');
        if (/!ctx\.isReadOnly|isReadOnly \|\||\|\| ctx\.isReadOnly|\|\| isReadOnly/.test(src)) {
          offenders.push(path.relative(ROOT, full));
        }
      }
    }
  };
  walk(apiRoot);
  assert.deepEqual(offenders, [], `read-only bypass remains in: ${offenders.join(', ')}`);
  // Writes are still blocked centrally for read-only members.
  assert.match(read('src/lib/tenant-context.ts'), /READ_ONLY_ROLE/);
});

/* ---------------- 3. Chat & document uploads ---------------- */

test('document upload validation: allow-list, size (413), and signatures', () => {
  assert.equal(validateDocumentUpload('eob.pdf', PDF.length, PDF).ok, true);
  assert.equal(validateDocumentUpload('scan.png', PNG.length, PNG).ok, true);
  // Spoofed MIME/extension: an EXE renamed to .pdf is rejected by signature.
  const spoof = validateDocumentUpload('eob.pdf', EXE.length, EXE);
  assert.equal(spoof.ok, false);
  // Active content types are not on the allow-list at all.
  assert.equal(validateDocumentUpload('evil.svg', 100, PDF).ok, false);
  assert.equal(validateDocumentUpload('evil.html', 100, PDF).ok, false);
  assert.equal(validateDocumentUpload('evil.exe', 100, EXE).ok, false);
  // Oversized → 413, empty → 400.
  const big = validateDocumentUpload('eob.pdf', DOCUMENT_MAX_BYTES + 1, PDF);
  assert.equal(big.ok, false);
  assert.equal(big.status, 413);
  assert.equal(validateDocumentUpload('eob.pdf', 0, new Uint8Array(0)).status, 400);
  assert.equal(validateDocumentSignature('xlsx', EXE), false);
});

test('filenames are sanitized against traversal and header injection', () => {
  assert.equal(sanitizeFileName('../../etc/passwd'), 'passwd');
  assert.equal(sanitizeFileName('..\\..\\windows\\evil.pdf'), 'evil.pdf');
  assert.equal(sanitizeFileName('a"\r\nSet-Cookie: x.pdf'), 'a___Set-Cookie: x.pdf');
  assert.equal(/[\r\n"]/.test(sanitizeFileName('a"\r\nSet-Cookie: x.pdf')), false);
  assert.equal(sanitizeFileName(''), 'file');
});

test('downloads never serve stored/client MIME types (no inline active content)', () => {
  assert.equal(safeDownloadContentType('report.pdf'), 'application/pdf');
  assert.equal(safeDownloadContentType('evil.html'), 'application/octet-stream');
  assert.equal(safeDownloadContentType('evil.svg'), 'application/octet-stream');
  const h = safeDownloadHeaders('../../evil.html');
  assert.match(h['Content-Disposition'], /^attachment;/);
  assert.equal(h['X-Content-Type-Options'], 'nosniff');
  // All download routes use the safe headers.
  for (const f of [
    'src/app/api/chat/files/[id]/route.ts',
    'src/app/api/claims/[id]/documents/[docId]/route.ts',
    'src/app/api/authorizations/[id]/documents/[docId]/route.ts',
    'src/app/api/tasks/[id]/documents/[docId]/route.ts',
  ]) {
    assert.match(read(f), /safeDownloadHeaders/, f);
  }
  // Upload routes validate content, not declared MIME types.
  for (const f of [
    'src/app/api/chat/channels/[id]/messages/route.ts',
    'src/app/api/claims/[id]/documents/route.ts',
    'src/app/api/authorizations/[id]/documents/route.ts',
    'src/app/api/tasks/[id]/documents/route.ts',
  ]) {
    assert.match(read(f), /validateDocumentUpload/, f);
  }
  assert.match(read('src/app/api/chat/channels/[id]/messages/route.ts'), /status: 413/);
});

/* ---------------- 4. Password reset atomicity ---------------- */

test('password reset consumes the token atomically in one transaction', () => {
  const route = read('src/app/api/auth/reset-password/route.ts');
  assert.match(route, /db\.transaction/);
  // Conditional claim: only an unused, unexpired token can transition usedAt.
  assert.match(route, /isNull\(authTokens\.usedAt\)/);
  assert.match(route, /gt\(authTokens\.expiresAt/);
  assert.match(route, /\.returning\(\{ id: authTokens\.id, userId: authTokens\.userId \}\)/);
  // Password change + session revocation happen inside the same transaction.
  assert.match(route, /tx\.delete\(sessions\)/);
  // Same password policy as registration/change.
  assert.match(route, /validatePasswordStrength/);
  assert.match(read('src/app/api/auth/register/route.ts'), /validatePasswordStrength/);
});

/* ---------------- 5. Rate limiting ---------------- */

test('rate limiter is atomic, fails closed for auth, and does not trust spoofed XFF', () => {
  const src = read('src/lib/rate-limit.ts');
  assert.match(src, /pg_advisory_xact_lock/);
  assert.match(src, /isSensitiveEndpoint/);
  assert.equal(isSensitiveEndpoint('login'), true);
  assert.equal(isSensitiveEndpoint('password_reset'), true);
  assert.equal(isSensitiveEndpoint('api'), false);
  // XFF ignored unless a trusted proxy is declared.
  const req = new Request('http://localhost/api/auth/login', {
    headers: { 'x-forwarded-for': '1.2.3.4' },
  });
  assert.equal(trustProxyHeaders({}), false);
  assert.equal(getClientIp(req), 'unknown');
  assert.equal(trustProxyHeaders({ TRUST_PROXY_HEADERS: 'true' }), true);
  // Proxy burst limiter applies the same trust rule and returns 429 + Retry-After.
  const proxy = read('src/proxy.ts');
  assert.match(proxy, /TRUST_PROXY_HEADERS/);
  assert.match(proxy, /'Retry-After'/);
  assert.match(proxy, /status: 429/);
});

/* ---------------- 6. Demo account separation ---------------- */

test('demo credentials cannot authenticate in production', () => {
  for (const email of DEMO_ACCOUNT_EMAILS) {
    assert.equal(isDemoLoginBlocked(email, { NODE_ENV: 'production' }), true, email);
    assert.equal(isDemoLoginBlocked(email, { NODE_ENV: 'development' }), false, email);
    // Only an explicitly isolated demo deployment may use them in production mode.
    assert.equal(
      isDemoLoginBlocked(email, { NODE_ENV: 'production', DEMO_ENVIRONMENT: 'true' }),
      false,
      email
    );
  }
  assert.equal(isDemoLoginBlocked('real@customer.com', { NODE_ENV: 'production' }), false);
  assert.equal(isDemoAccountEmail(' ADMIN@medicalbilling.com '), true);
  // Login consults the guard before any password work.
  const login = read('src/app/api/auth/login/route.ts');
  assert.ok(login.indexOf('isDemoLoginBlocked') < login.indexOf('verifyPassword(rawPassword'), 'guard runs first');
  // Production startup fails safely when demo mode is enabled.
  assert.throws(
    () => assertNoDemoModeInProduction({ NODE_ENV: 'production', ENABLE_DEMO_ACCOUNTS: 'true' }),
    /Refusing to start/
  );
  assert.doesNotThrow(() => assertNoDemoModeInProduction({ NODE_ENV: 'production' }));
  assert.doesNotThrow(() =>
    assertNoDemoModeInProduction({ NODE_ENV: 'production', DEMO_ENVIRONMENT: 'true', ENABLE_DEMO_ACCOUNTS: 'true' })
  );
  assert.match(read('src/app/api/health/route.ts'), /assertNoDemoModeInProduction/);
});

test('demo accounts cannot become platform administrators; README labels them demo-only', () => {
  assert.match(read('src/app/api/platform/users/route.ts'), /Demo accounts cannot be granted platform administrator/);
  assert.match(read('scripts/bootstrap-platform-admin.mjs'), /Refusing to bootstrap a demo account/);
  const readme = read('README.md');
  assert.match(readme, /DEMO ONLY/);
  // The intentional demo credentials themselves are preserved.
  for (const email of DEMO_ACCOUNT_EMAILS) assert.ok(readme.includes(email), `README keeps ${email}`);
  // No seeding endpoint creates demo users.
  assert.equal(/medicalbilling\.com|SEED_USERS/.test(read('src/app/api/seed/route.ts')), false);
});

/* ---------------- 7. Sessions / JWT ---------------- */

test('JWTs are issuer/audience/algorithm pinned and production secrets fail safely', () => {
  const auth = read('src/lib/auth.ts');
  assert.match(auth, /setIssuer\(JWT_ISSUER\)/);
  assert.match(auth, /setAudience\(JWT_AUDIENCE\)/);
  assert.match(auth, /issuer: JWT_ISSUER, audience: JWT_AUDIENCE, algorithms: \['HS256'\]/);
  assert.match(auth, /JWT_SECRET \(>=16 characters\) is required in production/);
  // Session revocation deletes the server-side session row (logout is real).
  assert.match(auth, /export async function logout\(token: string\) \{\s*await db\.delete\(sessions\)/);
  assert.match(read('src/app/api/health/route.ts'), /JWT_SECRET/);
});

/* ---------------- 8. Security logging hygiene ---------------- */

test('security logging exists and never logs secrets', () => {
  const log = read('src/lib/security-log.ts');
  assert.match(log, /auth\.login_failure/);
  assert.match(log, /ratelimit\.blocked/);
  assert.match(log, /authz\.claim_review_bypass_blocked/);
  for (const banned of [/password.*:.*fields/i, /console\.log\(.*password/]) {
    assert.equal(banned.test(log), false);
  }
  assert.match(read('src/lib/rate-limit.ts'), /logSecurityEvent\('ratelimit\.blocked'/);
  assert.match(read('src/app/api/claims/[id]/route.ts'), /claim_review_bypass_blocked/);
});
