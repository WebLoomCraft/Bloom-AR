import { db } from '@/db';
import { plans as plansTable } from '@/db/schema';
import { DEFAULT_PLAN_CATALOG, type PlanCatalogItem } from '@/lib/plans-shared';

/**
 * Loads the plans that /pricing and Stripe checkout use, so that prices quoted
 * inside the legal agreements cannot drift from what a customer is charged.
 * Falls back to the shipped catalog if the database is unavailable (for example
 * before migrations run) — the same behavior /pricing uses.
 */
export async function loadLegalPlans(): Promise<PlanCatalogItem[]> {
  try {
    const rows = (await db.select().from(plansTable))
      .filter((r) => r.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    if (!rows.length) return DEFAULT_PLAN_CATALOG;
    return rows.map((r) => {
      const base = DEFAULT_PLAN_CATALOG.find((c) => c.slug === r.slug);
      return {
        slug: r.slug,
        name: r.name,
        description: r.description || base?.description || '',
        bestFor: base?.bestFor || '',
        monthlyPriceCents: r.monthlyPriceCents,
        annualPriceCents: r.annualPriceCents,
        trialDays: r.trialDays,
        features:
          Array.isArray(r.features) && r.features.length ? (r.features as string[]) : base?.features || [],
        limits: (r.limits as PlanCatalogItem['limits']) || base?.limits || { seats: 5, claimsPerMonth: 1000 },
        highlight: r.slug === 'professional',
        cta: base?.cta || 'Start free trial',
      } satisfies PlanCatalogItem;
    });
  } catch {
    return DEFAULT_PLAN_CATALOG;
  }
}
