# BloomAR Manager — Security Architecture

Defense in depth: hosting/database controls **and** application controls, so a
single misconfiguration does not expose a workspace. This document lists only
controls that exist in this repository; the public summary is `/security`,
and responsible disclosure is `/.well-known/security.txt`
(bloomrcm@gmail.com).

## Server / edge layer (`src/proxy.ts`, `src/lib/security/`)
- **Security headers on every response**: CSP (`default-src 'self'`,
  `object-src 'none'`, restricted `frame-ancestors`), HSTS on HTTPS,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **CSRF origin validation** for every state-changing `/api/*` request
  (`src/lib/security/csrf.ts`). The session cookie is `SameSite=None` (needed
  for permitted cross-origin preview embedding), so this check — not the
  cookie attribute — stops cross-site request forgery. Exempt: the Stripe
  webhook (HMAC-signature authenticated) and `/api/v1/*` (hashed API keys).
  Extra trusted origins can be allow-listed with `ALLOWED_ORIGINS`.
  For a normal first-party deployment, `SESSION_COOKIE_SAMESITE=lax` adds the
  stricter cookie default on top.
- **Burst rate limiting** per IP at the edge, in front of the durable
  per-endpoint database limiter (`src/lib/rate-limit.ts`: login, register,
  reset, leads, uploads, ERA).

## Application layer
- **Tenant isolation**: server-bound `active_organization_id` per session,
  ownership predicates on every operational query, PostgreSQL FORCE RLS
  (migration `0006_multi_tenant_isolation.sql`) as a database backstop, and
  platform-admin separation from tenant PHI.
- **Authentication**: bcrypt cost 12; one password policy everywhere
  (`src/lib/security/password.ts`: 12+ chars, upper/lower/digit, common-
  password blocklist) enforced at register, reset, and change; TOTP MFA with
  AES-256-GCM-encrypted secrets and hashed recovery codes; email verification
  before first sign-in.
- **Sessions**: unique `jti` per session, Secure + HttpOnly cookies, 8-hour
  server idle timeout, 7-day absolute lifetime, per-device revocation
  (`/api/account/sessions`), optional inactivity auto-logoff.
- **Uploads** (`src/lib/security/files.ts`): extension allow-list, 25MB cap,
  and magic-byte signature checks (ZIP for .xlsx, OLE for .xls, text for
  .csv) on both AR-import routes.
- **Audit**: organization-scoped audit logs with credentials/SSNs redacted
  before storage (`src/lib/audit.ts`); scoped API keys stored SHA-256 hashed.
- **Payments**: card data handled only by Stripe; the app never stores PANs.
- **Translation**: interface translation is on-device only — no PHI or user
  text is sent to any translation service (`src/lib/i18n/`).

## Honest limits (also stated on `/security`)
- No system is "unbreachable"; we publish controls and a disclosure channel
  instead of absolutes.
- HIPAA has no software certification; technical controls here do not by
  themselves make any organization HIPAA compliant. BAAs, a documented
  security risk analysis, workforce training, and contingency/incident plans
  remain operator duties (see `docs/HIPAA_READINESS.md` §2).
- The edge rate limiter is per-instance memory (burst control); the database
  limiter is the durable control.

## 2026 security-hardening pass

- **Claim review integrity** (`src/lib/claims-authz.ts`): the generic
  `PATCH /api/claims/[id]` can no longer produce review outcomes. Statuses
  `approved`, `rework_required`, `paid`, `closed`, and coding outcomes return
  403 and must go through `/review` or `/workflow`, which enforce reviewer
  roles and the no-self-approval rule. Generic transitions are validated
  against an explicit transition table; protected fields (`approvedBy`,
  `approvedAt`, `reviewedBy`, `organizationId`, ...) are rejected (400).
- **Read-only means read-only**: the previous `!ctx.isReadOnly` shortcut let
  read-only members (effective role `ar_executive`) see *all* claims,
  documents, exports and reports in the organization. Visibility scoping now
  applies by role regardless of read-only status across claims, counts,
  documents, authorizations, coding, tasks, signoffs, ERA, exports, reports,
  dashboard and `/api/v1`.
- **Document & chat uploads** (`validateDocumentUpload` in
  `src/lib/security/files.ts`): extension allow-list (PDF/images/text/office),
  10MB cap enforced before reading content, oversized → **413**, magic-byte
  signature verification, signature-derived stored MIME type (client-declared
  MIME is never trusted), sanitized filenames. Downloads serve
  `safeDownloadHeaders()`: attachment disposition, extension-derived content
  type, `nosniff`, and a sandbox CSP — stored/legacy rows cannot be served
  as inline HTML/SVG. Authorization and task document uploads now also check
  per-resource access before accepting files.
- **Password reset**: token claim, password update, and session revocation
  now happen in a single DB transaction with a conditional
  `UPDATE ... WHERE usedAt IS NULL AND expiresAt > now` — a reset token is
  single-use even under concurrent requests.
- **Rate limiting** (`src/lib/rate-limit.ts`): PostgreSQL advisory-lock
  serialization makes check-and-increment atomic across instances;
  sensitive endpoints (login/register/forgot/reset) **fail closed** when the
  limiter backend is unavailable. `X-Forwarded-For`/`X-Real-IP` are honored
  only with `TRUST_PROXY_HEADERS=true` or on Vercel (`src/lib/security/client-ip.ts`).
- **Sessions/JWT**: tokens now carry `iss`/`aud` and verification pins
  issuer, audience, and HS256. Note: this invalidates pre-existing sessions
  once (users sign in again). `JWT_SECRET` (>=16 chars) is required in
  production; `/api/health` fails (500) when it — or demo-mode flags — are
  misconfigured.
- **Demo separation** (`src/lib/demo-guard.ts`): README demo credentials are
  intentional and kept, but demo emails are blocked at login in production
  (checked before password comparison) unless the deployment is explicitly
  an isolated demo (`DEMO_ENVIRONMENT=true`, throwaway database). Enabling
  `ENABLE_DEMO_ACCOUNTS`/`SEED_DEMO_USERS`/`ALLOW_DEMO_LOGIN` in production
  makes `/api/health` fail. Demo accounts cannot be promoted to platform
  admin (platform users API and `scripts/bootstrap-platform-admin.mjs`).
- **Security logging** (`src/lib/security-log.ts`): structured JSON events
  for login/MFA failures, blocked demo logins, rejected reset tokens,
  claim-review bypass attempts, and rate-limit events — identifiers only,
  never passwords/tokens/PHI/file contents.
- **Malware scanning**: uploads are constrained to inert document types with
  signature verification. If object storage / AV scanning is introduced
  (e.g. ClamAV sidecar or a cloud scanner), hook it at the
  `validateDocumentUpload` call sites in the four document upload routes
  before the DB insert; until then, treat all downloads as untrusted files.

### Dependency audit (npm audit)
After this pass: **0 critical**, 1 high, 4 moderate.
- Fixed: Next.js 16.2.6 → 16.4.6 (critical middleware/proxy bypass +
  postcss/sharp transitives), nodemailer 9 → 10, postcss → 8.5.33;
  `npm audit fix` for the remaining patchable transitives.
- Remaining high: `xlsx` (SheetJS prototype pollution / ReDoS) has **no
  patched npm release**; risk is mitigated by extension+signature validation
  and server-side-only parsing of size-capped files. Replacing SheetJS with
  a maintained parser is recommended as a follow-up.
- Remaining moderate: `esbuild` via `drizzle-kit` (dev-only tooling; the
  advisory concerns the esbuild dev server, which is not run in production).
- Dependabot (`.github/dependabot.yml`) and a security workflow
  (`.github/workflows/security.yml`: audit + typecheck + tests) are enabled.
