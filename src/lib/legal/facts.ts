/**
 * Live product facts injected into legal documents so pricing and billing terms
 * never drift from what /pricing and Stripe Checkout actually show.
 */
import { DEFAULT_PLAN_CATALOG, annualSavingsPct, money, type PlanCatalogItem } from '../plans-shared.ts';

export interface LegalFacts {
  plans: PlanCatalogItem[];
  currency: string;
  /** e.g. "Starter is $99 per month, or $950 per year (about 20% less than 12 monthly payments)." */
  pricingSentences: string[];
  trialSentence: string;
  annualSavingsSentence: string;
}

export const CURRENCY = 'USD';

/**
 * `plans` may come from the database (live, platform-admin edited). The catalog
 * is the fallback. Never hard-code a price in a legal document — derive it here.
 */
export function buildLegalFacts(plans?: PlanCatalogItem[]): LegalFacts {
  const source = plans && plans.length ? plans : DEFAULT_PLAN_CATALOG;
  const priced = source.filter((p) => p.monthlyPriceCents > 0);

  const pricingSentences = priced.map((p) => {
    const pct = annualSavingsPct(p);
    return (
      `${p.name}: ${money(p.monthlyPriceCents)} per month, billed monthly, or ` +
      `${money(p.annualPriceCents)} per year, billed annually` +
      (pct > 0 ? ` (about ${pct}% less than twelve monthly payments)` : '') +
      `, with a ${p.trialDays}-day free trial.`
    );
  });

  const custom = source.filter((p) => p.monthlyPriceCents === 0);
  for (const p of custom) {
    pricingSentences.push(
      `${p.name}: custom pricing agreed in a written order form or subscription agreement, with a ${p.trialDays}-day free trial.`
    );
  }

  const monthly = priced[0];
  const annualPct = monthly ? annualSavingsPct(monthly) : 0;

  return {
    plans: source,
    currency: CURRENCY,
    pricingSentences,
    trialSentence: `${monthly?.trialDays ?? 14} days for Starter and Professional, and ${
      source.find((p) => p.monthlyPriceCents === 0)?.trialDays ?? 30
    } days for Enterprise.`,
    annualSavingsSentence: monthly
      ? `Annual billing is charged once per year at ${money(
          monthly.annualPriceCents
        )} for ${monthly.name} (the same roughly ${annualPct}% saving applies to the other annual plans).`
      : '',
  };
}

/** Non-price commercial terms that are implemented in code and must not be misstated. */
export const BILLING_IMPLEMENTATION = {
  /** `subscription_data[trial_period_days]` is sent to Stripe at checkout. */
  cardRequiredForTrial: false,
  /** `invoice.payment_failed` sets status=past_due and gracePeriodEndsAt = now + 7 days. */
  gracePeriodDays: 7,
  /** subscriptions are only activated by webhook, never by the success redirect. */
  activatesOnWebhookOnly: true,
  /** cancel sets cancelAtPeriodEnd so access continues through the paid period. */
  cancelAtPeriodEnd: true,
  /** manage route calls Stripe to set cancel_at_period_end, and reports honestly if it fails. */
  cancelPropagatesToStripe: true,
  /** After grace expiry the workspace becomes read-only; data is NOT deleted. */
  readOnlyAfterGrace: true,
  /** No archival purge job exists in the codebase. */
  automaticDataDeletionJob: false,
} as const;
