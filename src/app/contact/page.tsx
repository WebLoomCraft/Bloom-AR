'use client';
import { useState, Suspense, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { useI18n } from '@/components/i18n/I18nProvider';
import Reveal from '@/components/marketing/fx/Reveal';
import TiltCard from '@/components/marketing/fx/TiltCard';

const inp = 'mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-200';
const OPTIONS = [
  { type: 'demo', icon: '🎥', n: 1 },
  { type: 'sales', icon: '💼', n: 2 },
  { type: 'contact', icon: '✉️', n: 3 },
];
type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

function Inner() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', organization: '', phone: '', message: '', website: '', type: ['demo', 'sales', 'contact'].includes(sp.get('type') || '') ? sp.get('type')! : 'contact', teamSize: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const set = (k: string, v: string) => { setForm({ ...form, [k]: v }); setErrors(e => ({ ...e, [k]: undefined })); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Errors = {};
    if (!form.name.trim()) errs.name = t('mk.contact.errName');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t('mk.contact.errEmail');
    if (!form.message.trim()) errs.message = t('mk.contact.errMessage');
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById('form-errors')?.focus(); return; }
    setState('sending');
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, message: `[${form.type}${form.teamSize ? ` · team ${form.teamSize}` : ''}] ${form.message}` }) });
      setState(r.ok ? 'sent' : 'failed');
    } catch { setState('failed'); }
  };
  const FieldError = ({ id }: { id: keyof Errors }) => errors[id] ? <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-red-700">{errors[id]}</p> : null;

  return <MarketingShell>
    <section className="mkt-hero-bg"><div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{t('mk.contact.eyebrow')}</p>
      <div className="mt-2 max-w-2xl"><H1>{t('mk.contact.h1')}</H1></div>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">{t('mk.contact.intro')} <Link href="/register" className="font-semibold text-blue-700 underline">{t('mk.contact.startTrial')}</Link>.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="What can we help with?">
        {OPTIONS.map((o, i) => { const active = form.type === o.type; return (
          <Reveal key={o.type} delay={i * 80}><TiltCard max={4} className="h-full">
            <button type="button" role="radio" aria-checked={active} onClick={() => set('type', o.type)}
              className={`mkt-card-shadow h-full w-full rounded-3xl border bg-white p-5 text-left focus-visible:outline-2 focus-visible:outline-blue-600 ${active ? 'ring-2 ring-blue-600' : ''}`}>
              <span className="text-2xl" aria-hidden="true">{o.icon}</span>
              <span className="mt-2 block font-extrabold text-[#0F2D52]">{t(`mk.contact.opt${o.n}t`)}{active && <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{t('mk.contact.selected')}</span>}</span>
              <span className="mt-1 block text-sm text-slate-600">{t(`mk.contact.opt${o.n}d`)}</span>
              <span className="mt-2 block text-xs font-semibold text-blue-700">{t(`mk.contact.opt${o.n}m`)}</span>
            </button></TiltCard></Reveal>); })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal><form onSubmit={submit} noValidate aria-describedby="form-errors" className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-extrabold text-[#0F2D52]">{t(`mk.contact.opt${OPTIONS.find(o => o.type === form.type)?.n ?? 3}t`)}</h2>
          <div id="form-errors" tabIndex={-1} role="alert" className={Object.keys(errors).length ? 'mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 outline-none ring-1 ring-red-200' : 'sr-only'}>
            {Object.keys(errors).length > 0 && <>{t('mk.contact.fixErrors')} {Object.values(errors).join(' ')}</>}
          </div>
          {state === 'sent' ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-6 text-center ring-1 ring-emerald-200" role="status">
              <p className="text-3xl" aria-hidden="true">✅</p><p className="mt-2 font-extrabold text-emerald-900">{t('mk.contact.sentT')}</p>
              <p className="mt-1 text-sm text-emerald-800">{t('mk.contact.sentD', {email: form.email})}</p>
              <div className="mt-4 flex justify-center gap-3"><Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t('mk.contact.startTrial')}</Link><Link href="/pricing" className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">{t('mk.contact.seePricing')}</Link></div>
            </div>) : <>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><label className="text-sm font-semibold" htmlFor="name">{t('mk.contact.name')} <span aria-hidden="true" className="text-red-600">*</span></label>
                <input id="name" autoComplete="name" required aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} value={form.name} onChange={e => set('name', e.target.value)} className={inp} placeholder="Jane Smith" /><FieldError id="name" /></div>
              <div><label className="text-sm font-semibold" htmlFor="email">{t('mk.contact.workEmail')} <span aria-hidden="true" className="text-red-600">*</span></label>
                <input id="email" type="email" autoComplete="email" required aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : 'email-hint'} value={form.email} onChange={e => set('email', e.target.value)} className={inp} placeholder="you@practice.com" />
                {errors.email ? <FieldError id="email" /> : <p id="email-hint" className="mt-1 text-xs text-slate-600">{t('mk.contact.emailHint')}</p>}</div>
              <div><label className="text-sm font-semibold" htmlFor="organization">{t('mk.contact.org')}</label>
                <input id="organization" autoComplete="organization" value={form.organization} onChange={e => set('organization', e.target.value)} className={inp} placeholder="Sunrise Clinic" /></div>
              <div><label className="text-sm font-semibold" htmlFor="phone">{t('mk.contact.phone')}</label>
                <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} placeholder="(555) 010-1234" /></div>
              <div><label className="text-sm font-semibold" htmlFor="teamSize">{t('mk.contact.teamSize')}</label>
                <select id="teamSize" value={form.teamSize} onChange={e => set('teamSize', e.target.value)} className={inp}><option value="">{t('mk.contact.select')}</option>{['1–5', '6–25', '26–100', '100+'].map(x => <option key={x}>{x}</option>)}</select></div>
            </div>
            <div className="mt-4"><label className="text-sm font-semibold" htmlFor="message">{t('mk.contact.message')} <span aria-hidden="true" className="text-red-600">*</span></label>
              <textarea id="message" required aria-required="true" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : 'message-hint'} rows={5} value={form.message} onChange={e => set('message', e.target.value)} className={inp} placeholder="Tell us about your practice, current AR process, and what you'd like to improve…" />
              {errors.message ? <FieldError id="message" /> : <p id="message-hint" className="mt-1 text-xs text-slate-600">{t('mk.contact.messageHint')}</p>}</div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" value={form.website} onChange={e => set('website', e.target.value)} aria-hidden="true" />
            <button disabled={state === 'sending'} className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 sm:w-auto">
              {state === 'sending' ? t('mk.contact.sending') : t('mk.contact.send')}</button>
            {state === 'failed' && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{t('mk.contact.failed')}</p>}
            <p className="mt-3 text-xs text-slate-600">{t('mk.contact.privacyNote')} <Link href="/legal/privacy" className="text-blue-700 underline">{t('mk.contact.privacyPolicy')}</Link></p>
          </>}
        </form></Reveal>

        <Reveal delay={120}><aside aria-label="What happens next" className="space-y-4">
          <div className="rounded-3xl bg-[#0F2D52] p-6 text-white"><h2 className="font-extrabold">{t('mk.contact.nextH')}</h2>
            <ol className="mt-3 space-y-3 text-sm">{[1,2,3].map((n) => <li key={n} className="flex gap-3"><span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">{n}</span><span><b>{t(`mk.contact.next${n}t`)}.</b> <span className="text-white/75">{t(`mk.contact.next${n}d`)}</span></span></li>)}</ol></div>
          <div className="rounded-3xl border bg-white p-6"><h2 className="font-extrabold text-[#0F2D52]">{t('mk.contact.emailCardH')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('mk.contact.businessEmail')} <a className="font-semibold text-blue-700 hover:underline" href="mailto:bloomrcm@gmail.com">bloomrcm@gmail.com</a></p>
            <p className="mt-1 text-sm text-slate-600">{t('mk.contact.website')} <a className="font-semibold text-blue-700 hover:underline" href="https://bloomrcm.vercel.app" target="_blank" rel="noreferrer">bloomrcm.vercel.app</a></p>
            <p className="mt-2 text-xs text-slate-500">{t('mk.contact.phiNote')}</p></div>
          <div className="rounded-3xl border bg-white p-6"><h2 className="font-extrabold text-[#0F2D52]">{t('mk.contact.exploreH')}</h2>
            <ul className="mt-2 space-y-2 text-sm">{[['/features',1],['/pricing',2],['/faq',3],['/register',4]].map(([h,n]) => <li key={h as string}><Link href={h as string} className="font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600">{t(`mk.contact.explore${n}`)}</Link></li>)}</ul></div>
        </aside></Reveal>
      </div>
    </div></section>
  </MarketingShell>;
}
export default function Page() { return <Suspense><Inner /></Suspense>; }
