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
