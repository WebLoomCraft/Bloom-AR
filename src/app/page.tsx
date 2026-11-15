import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import Reveal from '@/components/marketing/fx/Reveal';
import TiltCard from '@/components/marketing/fx/TiltCard';
import HeroDashboard from '@/components/marketing/fx/HeroDashboard';
import HeroScene from '@/components/marketing/fx/HeroScene';
import { T, Known } from '@/components/i18n/Mk';
export const dynamic = 'force-dynamic';
export default async function Home() { const c = await getSiteContent(); return <MarketingShell content={c}>
  <section className="mkt-hero-bg relative overflow-hidden">
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] opacity-70 lg:block" aria-hidden="true"><HeroScene /></div>
    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
      <Reveal><div><p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">✦ <T k="mk.home.badge" /></p>
      <div className="mt-5"><H1><span className="mkt-gradient-text"><Known text={c.heroHeadline} /></span></H1></div>
      <p className="mt-5 text-lg text-slate-600"><Known text={c.heroSubtext} /></p>
      <div className="mt-7 flex flex-wrap gap-3"><Link href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"><Known text={c.heroPrimaryCta} /></Link><Link href="/contact?type=demo" className="px-6 py-3 border rounded-xl font-semibold bg-white/70 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"><Known text={c.heroSecondaryCta} /></Link></div>
      <p className="mt-3 text-xs text-slate-500"><T k="mk.home.trialNote" /></p></div></Reveal>
      <Reveal delay={150}><HeroDashboard /></Reveal>
    </div>
  </section>
  <section id="features" className="max-w-6xl mx-auto px-5 py-14 scroll-mt-24"><Reveal><h2 className="text-3xl font-extrabold text-[#0F2D52]"><Known text={c.featuresHeading} /></h2><p className="mt-2 text-slate-600"><T k="mk.home.featuresSub" /></p></Reveal>
    <div className="grid md:grid-cols-3 gap-5 mt-8">{c.features.map((f, i) => <Reveal key={f.title} delay={i * 80}><TiltCard className="h-full"><article className="mkt-card-shadow h-full border rounded-2xl bg-white p-6 transition-shadow" style={{ transform: 'translateZ(24px)' }}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-lg" aria-hidden="true">{['🧾','🔎','🛡️','📊','✅','💬'][i % 6]}</div><h3 className="font-bold mt-3"><Known text={f.title} /></h3><p className="text-sm text-slate-600 mt-2"><Known text={f.description} /></p></article></TiltCard></Reveal>)}</div></section>
  <section className="mx-auto max-w-6xl px-5 py-8">
    <Reveal><div className="mkt-scene overflow-hidden rounded-3xl bg-[#0F2D52] px-6 py-10 text-white md:px-10"><div className="mkt-preserve grid items-center gap-8 md:grid-cols-3">
      {[['mk.home.flow1t','mk.home.flow1d'],['mk.home.flow2t','mk.home.flow2d'],['mk.home.flow3t','mk.home.flow3d']].map(([tk, dk], i) => <div key={tk} className="rounded-2xl bg-white/[.07] p-5 ring-1 ring-white/10" style={{ transform: `translateZ(${30 + i * 18}px)` }}><p className="text-sm font-bold text-sky-300">0{i + 1}</p><h3 className="mt-1 font-bold"><T k={tk} /></h3><p className="mt-1 text-sm text-white/70"><T k={dk} /></p></div>)}
    </div></div></Reveal>
  </section>
  <section className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-2 gap-6">
    <Reveal><TiltCard max={4} className="h-full"><div className="bg-slate-50 rounded-2xl p-6 h-full"><h2 className="font-bold text-lg"><T k="mk.home.securityT" /></h2><p className="text-sm text-slate-600 mt-2"><T k="mk.home.securityD" /></p><Link href="/security" className="mt-3 inline-block text-blue-600 font-semibold text-sm"><T k="mk.home.securityLink" /></Link></div></TiltCard></Reveal>
    <Reveal delay={100}><TiltCard max={4} className="h-full"><div className="bg-slate-50 rounded-2xl p-6 h-full"><h2 className="font-bold text-lg"><T k="mk.home.plansT" /></h2><p className="text-sm text-slate-600 mt-2"><T k="mk.home.plansD" /></p><Link href="/pricing" className="text-blue-600 font-semibold text-sm"><T k="mk.home.comparePlans" /></Link></div></TiltCard></Reveal>
  </section>
  <section className="max-w-6xl mx-auto px-5 py-12 text-center"><Reveal><h2 className="text-3xl font-extrabold text-[#0F2D52]"><T k="mk.home.ready" /></h2><div className="mt-6 flex justify-center gap-3"><Link href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5"><Known text={c.heroPrimaryCta} /></Link><Link href="/pricing" className="px-6 py-3 border rounded-xl font-semibold transition hover:-translate-y-0.5 hover:shadow-lg"><T k="mk.home.seePricing" /></Link></div></Reveal></section>
</MarketingShell>; }
