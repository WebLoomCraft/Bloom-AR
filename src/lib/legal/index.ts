import type { LegalDocument } from './types.ts';
import { resolveDeep } from './resolve.ts';
import { termsDocument } from './terms.ts';
import { privacyDocument } from './privacy.ts';
import { subscriptionDocument } from './subscription.ts';
import { cookiesDocument } from './cookies.ts';
import { dpaDocument } from './dpa.ts';
import { baaDocument } from './baa.ts';
import type { PlanCatalogItem } from '@/lib/plans-shared';

export const LEGAL_SLUGS = ['terms', 'privacy', 'subscription', 'cookies', 'dpa', 'baa'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export const isLegalSlug = (value: string): value is LegalSlug =>
  (LEGAL_SLUGS as readonly string[]).includes(value);

/**
 * Builds every legal document from one source of truth.
 *
 * `plans` should be the live plan rows (with catalog fallback). Passing them in
 * guarantees that prices quoted inside the agreements match the public pricing
 * page and what Stripe Checkout charges.
 */
export function buildLegalDocuments(plans?: PlanCatalogItem[]): Record<LegalSlug, LegalDocument> {
  const docs = {
    terms: termsDocument(plans),
    privacy: privacyDocument(),
    subscription: subscriptionDocument(plans),
    cookies: cookiesDocument(),
    dpa: dpaDocument(),
    baa: baaDocument(),
  } satisfies Record<LegalSlug, LegalDocument>;

  const resolved = {} as Record<LegalSlug, LegalDocument>;
  for (const slug of LEGAL_SLUGS) resolved[slug] = resolveDeep(docs[slug]);
  return resolved;
}

export function getLegalDocument(slug: string, plans?: PlanCatalogItem[]): LegalDocument | null {
  if (!isLegalSlug(slug)) return null;
  return buildLegalDocuments(plans)[slug];
}

export * from './types.ts';
export * from './entity.ts';
export * from './facts.ts';
export { resolveEntityTokens, resolveDeep } from './resolve.ts';
