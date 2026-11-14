/**
 * One password policy, enforced identically at registration, password reset,
 * and password change (previously these disagreed: 10 vs 8 characters).
 *
 * Policy: at least 12 characters, with upper-case, lower-case, and a digit,
 * and not on a small blocklist of very common passwords. Length matters more
 * than symbol theatre, so symbols are allowed but not required.
 */
export const PASSWORD_MIN_LENGTH = 12;

const COMMON_PASSWORDS = new Set([
  'password1234',
  'password12345',
  'qwertyuiop123',
  '123456789012',
  'letmein12345',
  'admin1234567',
  'welcome12345',
  'bloomar12345',
  'changeme1234',
  'iloveyou1234',
]);

export function validatePasswordStrength(password: unknown): { ok: boolean; error?: string } {
  const pw = typeof password === 'string' ? password : '';
  if (pw.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.` };
  }
  if (pw.length > 256) {
    return { ok: false, error: 'Password is too long.' };
  }
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) {
    return {
      ok: false,
      error: 'Password must include an upper-case letter, a lower-case letter, and a number.',
    };
  }
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
    return { ok: false, error: 'That password is too common. Choose a less predictable one.' };
  }
  return { ok: true };
}
