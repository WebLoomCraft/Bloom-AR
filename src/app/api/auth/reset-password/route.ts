import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { authTokens, users, sessions } from '@/db/schema';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { hashToken } from '@/lib/saas';
import { hashPassword } from '@/lib/auth';
import { validatePasswordStrength } from '@/lib/security/password';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security-log';

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(getClientIp(req), 'password_reset');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!token || !password) {
    return NextResponse.json(
      { error: 'A valid token and a new password are required' },
      { status: 400 }
    );
  }
  const pwCheck = validatePasswordStrength(password);
  if (!pwCheck.ok) return NextResponse.json({ error: pwCheck.error }, { status: 400 });

  const passwordHash = await hashPassword(password);

  // Atomic single-use consumption: the token is claimed with a conditional
  // UPDATE (usedAt IS NULL and not expired) inside the same transaction that
  // changes the password and revokes every existing session. Two concurrent
  // requests cannot both claim the token — only one UPDATE can transition
  // usedAt from NULL, the other affects zero rows and is rejected.
  const consumed = await db.transaction(async (tx) => {
    const claimed = await tx
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(authTokens.tokenHash, hashToken(token)),
          eq(authTokens.type, 'password_reset'),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, new Date())
        )
      )
      .returning({ id: authTokens.id, userId: authTokens.userId });

    if (claimed.length === 0) return false;

    await tx.update(users).set({ passwordHash }).where(eq(users.id, claimed[0].userId));
    await tx.delete(sessions).where(eq(sessions.userId, claimed[0].userId));
    return true;
  });

  if (!consumed) {
    logSecurityEvent('auth.password_reset_rejected', { ip: getClientIp(req), reason: 'invalid_expired_or_used' });
    return NextResponse.json(
      { error: 'This reset link is invalid, expired, or already used.' },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true });
}
