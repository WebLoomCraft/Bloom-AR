/**
 * Demo-account separation.
 *
 * The README publishes demo credentials on purpose (for local evaluation).
 * Those accounts must never be able to authenticate against a production
 * deployment, never hold production data, and never be platform admins.
 *
 * Enforcement points:
 *  - No seeding code creates these accounts anymore (`/api/seed` only
 *    initializes reference catalogs); the only way they can exist is if an
 *    operator manually creates them — exactly what this guard neutralizes.
 *  - `isDemoLoginBlocked()` is consulted at login: in production the demo
 *    emails are rejected before any password comparison, unless the whole
 *    deployment is an explicitly isolated demo (`DEMO_ENVIRONMENT=true`,
 *    intended for a throwaway database with no customer data).
 *  - `assertNoDemoModeInProduction()` fails startup checks when demo mode
 *    flags are set in a production deployment.
 */

/** Demo accounts published in the README (kept intentionally, demo-only). */
export const DEMO_ACCOUNT_EMAILS = [
  'ali.mukhtar@medicalbilling.com',
  'admin@medicalbilling.com',
  'supervisor@medicalbilling.com',
  'manager@medicalbilling.com',
  'teamlead@medicalbilling.com',
  'executive@medicalbilling.com',
  'billing@medicalbilling.com',
] as const;

export function isDemoAccountEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (DEMO_ACCOUNT_EMAILS as readonly string[]).includes(
    String(email).toLowerCase().trim()
  );
}

export function isProductionEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'production';
}

/** True only for an explicitly isolated demo deployment (throwaway data). */
export function isIsolatedDemoEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DEMO_ENVIRONMENT === 'true';
}

/**
 * Demo logins are blocked in production unless the deployment is explicitly
 * flagged as an isolated demo environment.
 */
export function isDemoLoginBlocked(
  email: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (!isDemoAccountEmail(email)) return false;
  if (!isProductionEnv(env)) return false;
  return !isIsolatedDemoEnv(env);
}

/**
 * Fail-safe startup assertion: enabling demo accounts/seeding in a
 * production deployment (without the isolated-demo flag) is a
 * misconfiguration that must stop the deployment, not silently proceed.
 */
export function assertNoDemoModeInProduction(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProductionEnv(env)) return;
  if (isIsolatedDemoEnv(env)) return;
  const offenders = ['ENABLE_DEMO_ACCOUNTS', 'SEED_DEMO_USERS', 'ALLOW_DEMO_LOGIN'].filter(
    (k) => env[k] === 'true'
  );
  if (offenders.length > 0) {
    throw new Error(
      `Demo accounts are enabled in production via ${offenders.join(', ')}. ` +
        'Refusing to start: demo credentials must never authenticate against production. ' +
        'Unset these variables, or run an explicitly isolated demo with DEMO_ENVIRONMENT=true on a throwaway database.'
    );
  }
}
