import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import Reveal from '@/components/marketing/fx/Reveal';
import TiltCard from '@/components/marketing/fx/TiltCard';
import { T } from '@/components/i18n/Mk';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Features — BloomAR Manager', description: 'Claims, work queues, denial management, authorizations, payments, reporting and team collaboration for medical billing teams.' };

const MODULES = Array.from({length:10},(_,i)=>({ icon: ['🧾','📥','🛡️','📊','✅','💳','📈','💬','🏢','🔐'][i], n: i+1 }));
const JOURNEY = [1,2,3,4,5];

export default async function Page() {
  const c = await getSiteContent();
  return <MarketingShell content={c}>
    <section className="mkt-hero-bg"><div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700"><T k="mk.features.eyebrow" /></p>
      <div className="mt-2 max-w-3xl"><H1><T k="mk.features.h1" /></H1></div>
      <p className="mt-4 max-w-2xl text-lg text-slate-600"><T k="mk.features.intro" /></p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/register" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"><T k="mk.cms.startTrial" /></Link><Link href="/pricing" className="rounded-xl border bg-white px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:shadow-md"><T k="mk.pricing" /></Link></div>
    </div></section>

    <section aria-labelledby="journey-h" className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><h2 id="journey-h" className="text-2xl font-extrabold text-[#0F2D52]"><T k="mk.features.journeyH" vars={{brand:c.brandName}} /></h2></Reveal>
      <ol className="mt-6 grid gap-4 md:grid-cols-5">{JOURNEY.map((n, i) => <Reveal key={n} delay={i * 80}><li className="relative h-full rounded-2xl border bg-white p-4 shadow-sm"><p className="font-extrabold text-[#0F2D52]"><T k={`mk.features.j${n}t`} /></p><p className="mt-1 text-sm text-slate-600"><T k={`mk.features.j${n}d`} /></p>{i < 4 && <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-blue-400 md:block">→</span>}</li></Reveal>)}</ol>
    </section>

    <section aria-labelledby="modules-h" className="mx-auto max-w-6xl px-5 py-6">
      <Reveal><h2 id="modules-h" className="text-2xl font-extrabold text-[#0F2D52]"><T k="mk.features.modulesH" /></h2></Reveal>
      <div className="mt-6 grid gap-5 md:grid-cols-3" style={{ perspective: '1200px' }}>
        {MODULES.map((m, i) => <Reveal key={m.n} delay={(i % 3) * 80}><TiltCard max={4} className="h-full"><article className="mkt-card-shadow flex h-full flex-col rounded-3xl border bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl" aria-hidden="true">{m.icon}</div>
          <h3 className="mt-3 font-bold text-[#0F2D52]"><T k={`mk.features.m${m.n}t`} /></h3>
          <ul className="mt-2 flex-1 space-y-1.5 text-sm text-slate-600">{[1,2,3].map(pt => <li key={pt} className="flex gap-2"><span aria-hidden="true" className="text-emerald-600">✓</span><T k={`mk.features.m${m.n}p${pt}`} /></li>)}</ul>
          <p className="mt-3 border-t pt-3 text-sm font-medium text-blue-800"><T k={`mk.features.m${m.n}o`} /></p>
        </article></TiltCard></Reveal>)}
      </div>
    </section>

    <section aria-labelledby="plans-h" className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><div className="rounded-3xl bg-[#0F2D52] p-6 text-white md:p-8"><h2 id="plans-h" className="text-2xl font-extrabold"><T k="mk.features.plansH" /></h2>
      <p className="mt-2 max-w-2xl text-white/75"><T k="mk.features.plansD" /></p>
      <div className="mt-5 flex flex-wrap gap-3"><Link href="/pricing" className="rounded-xl bg-white px-5 py-2.5 font-semibold text-[#0F2D52] transition hover:-translate-y-0.5"><T k="mk.features.compare" /></Link><Link href="/contact?type=demo" className="rounded-xl border border-white/40 px-5 py-2.5 font-semibold transition hover:bg-white/10"><T k="mk.cms.bookDemo" /></Link></div></div></Reveal>
      <Reveal><div className="mt-6 rounded-2xl border bg-amber-50 p-5 text-sm text-amber-900"><T k="mk.features.setupNote" /></div></Reveal>
    </section>
  </MarketingShell>;
}
