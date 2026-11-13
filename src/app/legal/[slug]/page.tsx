import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { buildLegalDocuments, LEGAL_SLUGS, isLegalSlug } from '@/lib/legal';
import { loadLegalPlans } from '@/lib/legal/load-plans';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return { title: 'Not found — BloomAR Manager' };
  const doc = buildLegalDocuments()[slug];
  return {
    title: `${doc.title} — BloomAR Manager`,
    description: doc.summary,
    alternates: { canonical: `/legal/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const [content, plans] = await Promise.all([getSiteContent(), loadLegalPlans()]);
  const docs = buildLegalDocuments(plans);
  const doc = docs[slug];
  if (!doc) notFound();

  const relatedTitles = Object.fromEntries(
    LEGAL_SLUGS.map((s) => [s, docs[s].shortTitle])
  ) as Record<string, string>;
  const allDocs = LEGAL_SLUGS.map((s) => ({
    slug: s,
    title: docs[s].title,
    shortTitle: docs[s].shortTitle,
  }));

  return (
    <MarketingShell content={content}>
      <LegalDocumentView doc={doc} relatedTitles={relatedTitles} allDocs={allDocs} />
    </MarketingShell>
  );
}
