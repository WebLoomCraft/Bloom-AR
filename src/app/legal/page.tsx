import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import { buildLegalDocuments, LEGAL_SLUGS } from '@/lib/legal';
import { loadLegalPlans } from '@/lib/legal/load-plans';
import { entityFullName, postalAddressOneLine, missingBusinessInfo } from '@/lib/legal/entity';
import { findPlaceholders } from '@/lib/legal/types';
import { T } from '@/components/i18n/Mk';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Legal — BloomAR Manager',
  description:
    'Terms of Service, Privacy Policy, subscription and cancellation terms, cookie policy, Data Processing Agreement and HIPAA Business Associate Agreement for BloomAR Manager.',
  alternates: { canonical: '/legal' },
};

export default async function Page() {
  const [content, plans] = await Promise.all([getSiteContent(), loadLegalPlans()]);
  const docs = buildLegalDocuments(plans);
  const missing = missingBusinessInfo();
  const pending = LEGAL_SLUGS.reduce<Record<string, number>>((acc, slug) => {
    acc[slug] = findPlaceholders(docs[slug]).length;
    return acc;
  }, {});

  return (
    <MarketingShell content={content}>
      <section className="mkt-hero-bg">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700"><T k="mk.legal.eyebrow" /></p>
          <div className="mt-2 max-w-2xl">
            <H1><T k="mk.legal.h1" /></H1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-slate-600"><T k="mk.legal.intro" vars={{brand:content.brandName}} /></p>
          <p className="mt-3 max-w-2xl rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900 ring-1 ring-blue-100"><T k="mk.legal.englishNotice" /></p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        {missing.length > 0 && (
          <div className="legal-no-print mt-2 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-950">
              Operator notice: business details still required before publication
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900">
              The documents below are complete, but {missing.length} business-identity{' '}
              {missing.length === 1 ? 'value has' : 'values have'} not been supplied and appear as
              highlighted placeholders: {missing.join(', ')}. Set the corresponding environment
              variables (<code className="rounded bg-white/70 px-1">LEGAL_ADDRESS_LINE1</code>,{' '}
              <code className="rounded bg-white/70 px-1">LEGAL_GOVERNING_STATE</code>,{' '}
              <code className="rounded bg-white/70 px-1">LEGAL_VENUE</code>, and so on) and redeploy.
              Business name (BloomRCM) and contact email (bloomrcm@gmail.com) are already supplied. This notice is visible only while placeholders remain.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_SLUGS.map((slug) => {
            const doc = docs[slug];
            return (
              <Link
                key={slug}
                href={`/legal/${slug}`}
                className="group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-[#0F2D52] group-hover:text-blue-700">
                    {doc.shortTitle}
                  </h2>
                  {doc.executable && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-200">
                      <T k="mk.legal.signature" />
                    </span>
                  )}
                </div>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{doc.summary}</p>
                <p className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <span><T k="mk.legal.version" vars={{version:doc.version}} /></span>
                  <span className="text-blue-600 group-hover:underline"><T k="mk.legal.read" /></span>
                </p>
                {pending[slug] > 0 && (
                  <p className="legal-no-print mt-2 text-[11px] font-medium text-amber-700">
                    <T k="mk.legal.awaiting" vars={{count:pending[slug]}} />
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-base font-bold text-[#0F2D52]"><T k="mk.legal.whereH" /></h2>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
              <li>
                <strong className="font-semibold text-slate-800"><T k="mk.legal.evaluating" /></strong>{' '}
                <T k="mk.legal.evaluatingD" />{' '}
                <Link href="/legal/terms" className="text-blue-700 underline"><T k="mk.legal.termsLink" /></Link>{' · '}
                <Link href="/legal/subscription" className="text-blue-700 underline"><T k="mk.legal.subLink" /></Link>
              </li>
              <li>
                <strong className="font-semibold text-slate-800"><T k="mk.legal.patientH" /></strong>{' '}
                <T k="mk.legal.patientD1" />{' '}
                <Link href="/legal/baa" className="text-blue-700 underline"><T k="mk.legal.baaLink" /></Link>{' · '}
                <Link href="/legal/dpa" className="text-blue-700 underline"><T k="mk.legal.dpaLink" /></Link>{' '}
                <T k="mk.legal.patientD2" />
              </li>
              <li>
                <strong className="font-semibold text-slate-800"><T k="mk.legal.privacyReqH" /></strong>{' '}
                <T k="mk.legal.privacyReqD" />{' '}
                <Link href="/legal/privacy" className="text-blue-700 underline"><T k="mk.legal.privacyLink" /></Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-base font-bold text-[#0F2D52]"><T k="mk.legal.whoH" /></h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {entityFullName()}
              <br />
              {postalAddressOneLine()}
            </p>
            <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700"><T k="mk.legal.business" /></dt>
                <dd>{content.businessName} — <a href={content.businessWebsite} target="_blank" rel="noreferrer" className="text-blue-700 underline">bloomrcm.vercel.app</a></dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700"><T k="mk.legal.support" /></dt>
                <dd>
                  {content.supportEmail ? (
                    <a href={`mailto:${content.supportEmail}`} className="text-blue-700 underline">
                      {content.supportEmail}
                    </a>
                  ) : (
                    <span className="text-amber-700">bloomrcm@gmail.com</span>
                  )}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700"><T k="mk.legal.contactForm" /></dt>
                <dd>
                  <Link href="/contact" className="text-blue-700 underline">
                    /contact
                  </Link>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500"><T k="mk.legal.notAdvice" /></p>
          </section>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          <T k="mk.legal.generatedNote" />{' '}
          <Link href="/pricing" className="text-blue-700 underline"><T k="mk.legal.currentPricing" /></Link>.
        </p>
      </section>
    </MarketingShell>
  );
}
