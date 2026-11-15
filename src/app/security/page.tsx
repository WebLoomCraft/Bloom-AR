import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import Reveal from '@/components/marketing/fx/Reveal';
import { T } from '@/components/i18n/Mk';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Security — BloomAR Manager',
  description:
    'How BloomRCM protects BloomAR Manager: tenant isolation, MFA, session controls, CSRF and rate limiting, security headers, audit logs, and responsible disclosure.',
  alternates: { canonical: '/security' },
};

const PILLARS = ['🏢','🔐','⏱️','🛡️','📜','💳'].map((icon,i)=>({icon,n:i+1}));

export default async function Page() {
  const c = await getSiteContent();
  return (
    <MarketingShell content={c}>
      <section className="mkt-hero-bg">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700"><T k="mk.security.eyebrow" /></p>
          <div className="mt-2 max-w-3xl">
            <H1><T k="mk.security.h1" /></H1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-slate-600"><T k="mk.security.intro" vars={{brand:c.brandName}} /></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/legal/privacy"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"
            >
              <T k="mk.security.readPrivacy" />
            </Link>
            <Link
              href="/legal/baa"
              className="rounded-xl border bg-white px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <T k="mk.security.readBaa" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="pillars-h" className="mx-auto max-w-6xl px-5 py-10">
        <Reveal>
          <h2 id="pillars-h" className="text-2xl font-extrabold text-[#0F2D52]"><T k="mk.security.measuresH" /></h2>
        </Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((s, i) => (
            <Reveal key={s.n} delay={(i % 3) * 80}>
              <article className="mkt-card-shadow h-full rounded-3xl border bg-white p-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl"
                  aria-hidden="true"
                >
                  {s.icon}
                </div>
                <h3 className="mt-3 font-bold text-[#0F2D52]"><T k={`mk.security.p${s.n}t`} /></h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
                  {['a','b','c'].map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <span aria-hidden="true" className="text-emerald-600">
                        ✓
                      </span>
                      <span><T k={`mk.security.p${s.n}${pt}`} /></span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl bg-[#0F2D52] p-6 text-white md:p-8">
              <h2 className="text-xl font-extrabold"><T k="mk.security.claimsH" /></h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/80">
                {[1,2,3].map(n=><li key={n}><T k={`mk.security.claim${n}`} /></li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-3xl border bg-white p-6 md:p-8">
              <h2 className="text-xl font-extrabold text-[#0F2D52]"><T k="mk.security.reportH" /></h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                <T k="mk.security.reportD" vars={{email:'bloomrcm@gmail.com'}} />{' '}
                <Link href="/.well-known/security.txt" className="font-semibold text-blue-700 underline">
                  /.well-known/security.txt
                </Link>
                .
              </p>
              <h3 className="mt-5 font-bold text-[#0F2D52]"><T k="mk.security.yourSideH" /></h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                {[1,2,3].map(n=><li key={n}><T k={`mk.security.y${n}`} /></li>)}
              </ul>
              <p className="mt-4 text-sm">
                <Link href="/legal/dpa" className="font-semibold text-blue-700 underline">
                  <T k="mk.security.dpa" />
                </Link>{' '}
                ·{' '}
                <Link href="/legal/cookies" className="font-semibold text-blue-700 underline">
                  <T k="mk.security.cookies" />
                </Link>{' '}
                ·{' '}
                <Link href="/contact" className="font-semibold text-blue-700 underline">
                  <T k="mk.security.contact" />
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
