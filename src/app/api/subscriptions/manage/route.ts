import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subscriptions, plans, organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireTenantContext } from '@/lib/tenant-context';
import { getEntitlements, ensureDefaultPlans } from '@/lib/saas';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await requireTenantContext({
    requiredOrgRoles: ['owner', 'admin'],
  });
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');

  await ensureDefaultPlans();
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, ctx.organizationId))
    .limit(1);

  if (action === 'cancel_at_period_end' || action === 'cancel') {
    if (!existingSub) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existingSub.id));

    // Propagate to Stripe. Without this the provider keeps billing the customer even
    // though our records say "cancelled" — which would make the published cancellation
    // policy untrue. If Stripe cannot be reached we report it honestly rather than
    // claiming the cancellation is complete.
    let stripePropagated = false;
    let stripeWarning: string | undefined;
    if (process.env.STRIPE_SECRET_KEY && existingSub.externalSubscriptionId) {
      try {
        const r = await fetch(
          `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(existingSub.externalSubscriptionId)}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ cancel_at_period_end: 'true' }),
          }
        );
        stripePropagated = r.ok;
        if (!r.ok) {
          const d = await r.json().catch(() => null);
          stripeWarning =
            d?.error?.message ||
            'Cancellation was recorded but the payment provider did not confirm it. Contact support to be certain billing stops.';
        }
      } catch {
        stripeWarning =
          'Cancellation was recorded but the payment provider could not be reached. Contact support to be certain billing stops.';
      }
    } else if (existingSub.billingProvider === 'stripe') {
      stripeWarning =
        'No payment-provider subscription is linked to this workspace, so only our records were updated. Contact support if you see further charges.';
    }

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.user.id,
      actorRole: ctx.orgRole,
      action: 'subscription_cancel_scheduled',
      entityType: 'subscription',
      entityId: existingSub.id,
      newValue: { cancelAtPeriodEnd: true, stripePropagated },
    });

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      stripePropagated,
      message: stripeWarning
        ? stripeWarning
        : 'Cancelled. Your subscription will not renew; access continues to the end of the current billing period.',
      entitlements: await getEntitlements(ctx.organizationId),
    });
  }

  if (action === 'resume') {
    if (!existingSub) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existingSub.id));

    if (process.env.STRIPE_SECRET_KEY && existingSub.externalSubscriptionId) {
      try {
        await fetch(
          `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(existingSub.externalSubscriptionId)}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ cancel_at_period_end: 'false' }),
          }
        );
      } catch {
        // Non-fatal: the local flag is already cleared and the next webhook reconciles state.
      }
    }

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.user.id,
      actorRole: ctx.orgRole,
      action: 'subscription_resumed',
      entityType: 'subscription',
      entityId: existingSub.id,
    });

    return NextResponse.json({
      success: true,
      entitlements: await getEntitlements(ctx.organizationId),
    });
  }

  if (action === 'change_plan') {
    const planSlug = String(body.planSlug || '');
    const [targetPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.slug, planSlug))
      .limit(1);
    if (!targetPlan) {
      return NextResponse.json({ error: 'Target plan not found' }, { status: 404 });
    }

    const ent = await getEntitlements(ctx.organizationId);
    const targetLimits = (targetPlan.limits as { seats?: number; claimsPerMonth?: number }) || {};
    if (targetLimits.seats && ent && ent.usage.seatsUsed > targetLimits.seats) {
      return NextResponse.json(
        {
          error: `Cannot downgrade to ${targetPlan.name}: workspace currently has ${ent.usage.seatsUsed} active members (plan limit: ${targetLimits.seats}).`,
          code: 'DOWNGRADE_EXCEEDS_SEATS',
        },
        { status: 400 }
      );
    }

    // Paid upgrades when Stripe is configured must go through Stripe Checkout (`/api/subscriptions/checkout`)
    if (
      process.env.STRIPE_SECRET_KEY &&
      targetPlan.monthlyPriceCents > 0 &&
      existingSub?.status !== 'trialing'
    ) {
      return NextResponse.json(
        {
          error: 'Use Stripe Checkout to switch paid plans when Stripe billing is enabled.',
          code: 'USE_CHECKOUT',
        },
        { status: 400 }
      );
    }

    if (existingSub) {
      await db
        .update(subscriptions)
        .set({
          planId: targetPlan.id,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSub.id));
    } else {
      const now = new Date();
      await db.insert(subscriptions).values({
        organizationId: ctx.organizationId,
        planId: targetPlan.id,
        status: 'trialing',
        trialStart: now,
        trialEnd: new Date(Date.now() + (targetPlan.trialDays || 14) * 864e5),
      });
    }

    await db
      .update(organizations)
      .set({ subscriptionTier: targetPlan.slug, updatedAt: new Date() })
      .where(eq(organizations.id, ctx.organizationId));

    await createAuditLog({
      organizationId: ctx.organizationId,
      userId: ctx.user.id,
      actorRole: ctx.orgRole,
      action: 'subscription_plan_changed',
      entityType: 'subscription',
      entityId: existingSub?.id || ctx.organizationId,
      newValue: { planSlug: targetPlan.slug },
    });

    return NextResponse.json({
      success: true,
      entitlements: await getEntitlements(ctx.organizationId),
    });
  }

  return NextResponse.json({ error: 'Unsupported subscription management action' }, { status: 400 });
}
