'use client';
import { useState } from 'react';
import Link from 'next/link';
import Reveal from './fx/Reveal';
import TiltCard from './fx/TiltCard';
import { money, annualSavingsPct, INCLUDED_IN_EVERY_PLAN, type PlanCatalogItem } from '@/lib/plans-shared';
import { useI18n } from '@/components/i18n/I18nProvider';
import { translateKnownText } from '@/lib/i18n/translate';

const ROW_KEYS = ['mk.pricing.r1','mk.pricing.r2','mk.pricing.r3','mk.pricing.r4','mk.pricing.r5','mk.pricing.r6','mk.pricing.r7','mk.pricing.r8','mk.pricing.r9','mk.pricing.r10'];
const FAQ_KEYS = [1,2,3,4,5];

export default function PricingClient({ plans, source }: { plans: PlanCatalogItem[]; source: 'live' | 'catalog' }) {
  const [annual, setAnnual] = useState(false);
  const { t, locale } = useI18n();
  const known = (text?: string | null) => translateKnownText(locale, text);
  const rowValue = (idx: number, p: PlanCatalogItem): string => { switch(idx){ case 0: return p.limits.seats >= 9999 ? t('mk.pricing.customFairUse') : t('mk.pricing.upTo',{count:p.limits.seats}); case 1: return p.limits.claimsPerMonth.toLocaleString(locale); case 2: return t('mk.pricing.included'); case 3: return p.slug==='starter' ? t('mk.pricing.libraryOnly') : t('mk.pricing.included'); case 4: case 5: case 6: return p.slug==='starter' ? '—' : t('mk.pricing.included'); case 7: return p.slug==='enterprise' ? t('mk.pricing.yourDomain') : p.slug==='professional' ? t('mk.pricing.subdomain') : '—'; case 8: return p.slug==='enterprise' ? t('mk.pricing.included') : '—'; default: return p.slug==='starter' ? t('mk.pricing.emailSupport') : p.slug==='professional' ? t('mk.pricing.prioritySupport') : t('mk.pricing.dedicated'); } };
  return <div>
    <div className="mt-8 inline-flex rounded-full border bg-white p-1 shadow-sm" role="group" aria-label={t('mk.pricing.billingPeriod')}>
      {([[t('mk.pricing.monthly'), false], [t('mk.pricing.annual'), true]] as const).map(([label, val]) => (
        <button key={label} onClick={() => setAnnual(val)} aria-pressed={annual === val}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-blue-600 ${annual === val ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}>
          {label}{val && <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{t('mk.pricing.saveBadge')}</span>}
        </button>))}
    </div>
    {source === 'catalog' && <p className="mt-3 text-xs text-slate-600" role="note">{t('mk.pricing.catalogNote')}</p>}

    <div className="mt-8 grid gap-5 md:grid-cols-3" style={{ perspective: '1200px' }}>
      {plans.map((p, i) => { const cents = annual ? p.annualPriceCents : p.monthlyPriceCents; const perMonth = annual && cents ? Math.round(cents / 12) : cents; const save = annualSavingsPct(p);
        return <Reveal key={p.slug} delay={i * 90}><TiltCard max={4} className="h-full">
          <article aria-label={`${p.name} plan`} className={`mkt-card-shadow relative flex h-full flex-col rounded-3xl border bg-white p-6 ${p.highlight ? 'ring-2 ring-blue-600 md:-translate-y-3' : ''}`}>
            {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow">{t('mk.pricing.mostPopular')}</span>}
            <h2 className="text-xl font-extrabold text-[#0F2D52]">{p.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{known(p.description)}</p>
            <p className="mt-1 text-xs font-semibold text-blue-700">{known(p.bestFor)}</p>
            <div className="mt-5" aria-live="polite">
              {cents ? <>
                <p><span className="text-4xl font-extrabold text-[#0F2D52]">{money(perMonth)}</span><span className="text-sm text-slate-600"> {t('mk.pricing.perMonth')}</span></p>
                <p className="mt-1 text-xs text-slate-600">{annual ? `${t('mk.pricing.billedYear',{amount:money(cents)})}${save ? ` · ${t('mk.pricing.saveVs',{pct:save})}` : ''}` : `${t('mk.pricing.billedMonth',{amount:money(cents)})} · ${t('mk.pricing.switchSave',{pct:save})}`}</p>
              </> : <><p className="text-4xl font-extrabold text-[#0F2D52]">{t('mk.pricing.custom')}</p><p className="mt-1 text-xs text-slate-600">{t('mk.pricing.customD')}</p></>}
              <p className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">{t('mk.pricing.trial',{days:p.trialDays})}</p>
            </div>
            <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">{t('mk.pricing.whatYouGet')}</h3>
            <ul className="mt-2 flex-1 space-y-1.5 text-sm text-slate-700">{p.features.map(f => <li key={f} className="flex gap-2"><span aria-hidden="true" className="text-emerald-600">✓</span><span>{known(f)}</span></li>)}</ul>
            <Link href={p.slug === 'enterprise' ? '/contact?type=sales' : `/register?plan=${p.slug}`}
              className={`mt-6 rounded-xl px-4 py-3 text-center font-semibold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${p.highlight ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700' : 'border hover:shadow-md'}`}>{known(p.cta)}</Link>
          </article></TiltCard></Reveal>; })}
    </div>

    <Reveal><section aria-labelledby="compare-h" className="mt-14 overflow-x-auto rounded-3xl border bg-white shadow-sm">
      <h2 id="compare-h" className="px-6 pt-6 text-xl font-extrabold text-[#0F2D52]">{t('mk.pricing.compareH')}</h2>
      <table className="mt-4 w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{t('mk.pricing.compareCaption')}</caption>
        <thead><tr className="border-y bg-slate-50 text-slate-700"><th scope="col" className="px-6 py-3">{t('mk.pricing.featureCol')}</th>{plans.map(p => <th key={p.slug} scope="col" className="px-4 py-3">{p.name}</th>)}</tr></thead>
        <tbody>{ROW_KEYS.map((rk, ri) => <tr key={rk} className="border-b last:border-0"><th scope="row" className="px-6 py-3 font-medium text-slate-700">{t(rk)}</th>{plans.map(p => <td key={p.slug} className="px-4 py-3 text-slate-700">{rowValue(ri, p)}</td>)}</tr>)}</tbody>
      </table>
    </section></Reveal>

    <Reveal><section aria-labelledby="included-h" className="mt-10 rounded-3xl bg-[#0F2D52] p-6 text-white md:p-8">
      <h2 id="included-h" className="text-xl font-extrabold">{t('mk.pricing.includedH')}</h2>
      <ul className="mt-4 grid gap-3 text-sm md:grid-cols-2">{INCLUDED_IN_EVERY_PLAN.map(x => <li key={x} className="flex gap-2"><span aria-hidden="true" className="text-emerald-300">✓</span>{known(x)}</li>)}</ul>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/register" className="rounded-xl bg-white px-5 py-2.5 font-semibold text-[#0F2D52] transition hover:-translate-y-0.5">{t('mk.pricing.startTrial')}</Link><Link href="/features" className="rounded-xl border border-white/40 px-5 py-2.5 font-semibold transition hover:bg-white/10">{t('mk.pricing.exploreFeatures')}</Link></div>
    </section></Reveal>

    <section aria-labelledby="pricing-faq-h" className="mt-12"><h2 id="pricing-faq-h" className="text-2xl font-extrabold text-[#0F2D52]">{t('mk.pricing.faqH')}</h2>
      <div className="mt-4 space-y-3">{FAQ_KEYS.map(n => <details key={n} className="group rounded-2xl border bg-white p-5"><summary className="cursor-pointer font-semibold marker:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600">{t(`mk.pricing.pfaq${n}q`)}</summary><p className="mt-2 text-sm text-slate-600">{t(`mk.pricing.pfaq${n}a`)}</p></details>)}</div>
    </section>
    <p className="mt-8 text-sm text-slate-600">{t('mk.pricing.footerNote')} <Link className="text-blue-700 underline" href="/legal/subscription">{t('mk.pricing.policyLink')}</Link>. {t('mk.pricing.footerNote2')}</p>
  </div>;
}
