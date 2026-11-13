import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { plans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { requireMembership } from '@/lib/tenant';
import { appUrl, ensureDefaultPlans } from '@/lib/saas';
import { cleanUuid } from '@/lib/sanitize';

/**
 * Stripe Checkout — created server-side. If Stripe is not configured we return
 * an honest 503 (never fake a successful payment). Set STRIPE_SECRET_KEY and
 * per-plan stripe price ids (platform admin → Plans) to enable.
 *
 * Disclosures: Stripe Checkout renders the plan name, amount, currency, interval,
 * trial length and renewal cadence from the Price object itself. This route adds
 * the items that are ours to declare — the terms-of-service consent checkbox, the
 * legal-policy links, and plain-language renewal/cancellation text that matches
 * the Subscription, Billing, Refund and Cancellation Policy.
 *
 * OPERATOR PREREQUISITE (cannot be set from code): in the Stripe Dashboard go to
 * Settings → Business → Public details and set the Terms of Service URL to
 * /legal/terms, the Privacy Policy URL to /legal/privacy, and the refund policy
 * URL to /legal/subscription. Stripe refuses to create a session with
 * consent_collection.terms_of_service=required until a terms URL is on file.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const reqBody = await req.json();
  const organizationId = cleanUuid(reqBody.organizationId);
  const { planSlug, interval } = reqBody;
  if (!organizationId)
    return NextResponse.json({ error: 'Valid organizationId required' }, { status: 400 });
  if (!(await requireMembership(user.id, organizationId, ['owner', 'super_admin'])))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await ensureDefaultPlans();
  const [plan] = await db.select().from(plans).where(eq(plans.slug, planSlug)).limit(1);
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  if (!process.env.STRIPE_SECRET_KEY)
    return NextResponse.json(
      {
        error:
          'Payments are not configured yet. Add STRIPE_SECRET_KEY (and Stripe price IDs on the plan) — see docs/SAAS_SETUP.md. Your trial remains active; no charge was made.',
        code: 'payments_not_configured',
      },
      { status: 503 }
    );
  const billingInterval = interval === 'annual' ? 'annual' : 'monthly';
  const priceId = billingInterval === 'annual' ? plan.stripeAnnualPriceId : plan.stripeMonthlyPriceId;
  if (!priceId)
    return NextResponse.json(
      { error: 'This plan has no Stripe price configured yet.', code: 'price_not_configured' },
      { status: 503 }
    );

  const base = appUrl();
  const cadence = billingInterval === 'annual' ? 'year' : 'month';

  const body = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${base}/settings/billing?checkout=success`,
    cancel_url: `${base}/pricing?checkout=cancelled`,
    'metadata[organizationId]': organizationId,
    'metadata[planId]': plan.id,
    'metadata[billingInterval]': billingInterval,
    customer_email: user.email,

    // Require an affirmative agreement to the Terms before payment. Stripe shows
    // a mandatory checkbox and records the result on session.consent.terms_of_service.
    'consent_collection[terms_of_service]': 'required',

    // Renewal + cancellation disclosure shown next to the pay button, in the same
    // terms language as /legal/subscription. Stripe's own generated text still
    // states the amount, interval and renewal cadence.
    'custom_text[terms_of_service_acceptance][message]':
      `I agree to the Terms of Service (${base}/legal/terms) and the Subscription, Billing, Refund and Cancellation Policy (${base}/legal/subscription). ` +
      `My subscription renews automatically every ${cadence} until I cancel, and I can cancel anytime in Settings → Billing.`,
    'custom_text[after_submit][message]':
      `You can cancel at any time from Settings → Billing. Cancelling stops future renewals; access continues to the end of the period you paid for. See ${base}/legal/subscription for refund terms.`,
  });

  // Subscription description surfaces on the invoice and receipt.
  body.set(
    'subscription_data[description]',
    `BloomAR Manager — ${plan.name} (billed ${billingInterval})`
  );
  if (plan.trialDays) body.set('subscription_data[trial_period_days]', String(plan.trialDays));

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await r.json();
  if (!r.ok) {
    // Surface the operator-actionable cause (usually a missing Dashboard terms URL)
    // instead of a generic failure, without leaking keys.
    const detail = data?.error?.message || 'Stripe checkout failed';
    if (/terms of service|public details|business profile/i.test(detail)) {
      return NextResponse.json(
        {
          error:
            'Checkout is unavailable because this Stripe account has no Terms of Service URL configured. An administrator must set the Terms of Service URL to /legal/terms, the Privacy Policy URL to /legal/privacy, and the refund policy URL to /legal/subscription in Stripe Dashboard → Settings → Business → Public details. No charge was made.',
          code: 'stripe_legal_urls_missing',
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: detail, code: 'stripe_session_failed' }, { status: 502 });
  }
  return NextResponse.json({ url: data.url });
}
