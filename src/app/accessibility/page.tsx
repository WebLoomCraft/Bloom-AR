import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import { T } from '@/components/i18n/Mk';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Accessibility — BloomAR Manager', description: 'How BloomAR Manager supports accessible use of our website and application, and how to request help.' };
export default async function Page() {
  const c = await getSiteContent();
  return <MarketingShell content={c}><section className="mx-auto max-w-3xl px-5 py-14">
    <H1><T k="mk.a11y.h1" /></H1>
    <p className="mt-4 text-slate-600"><T k="mk.a11y.intro" vars={{brand:c.brandName}} /></p>
    <h2 className="mt-8 text-lg font-bold"><T k="mk.a11y.builtH" /></h2>
    <ul className="mt-2 list-disc space-y-1.5 pl-6 text-slate-600">
      {[1,2,3,4,5].map(n=><li key={n}><T k={`mk.a11y.b${n}`} /></li>)}
    </ul>
    <h2 className="mt-8 text-lg font-bold"><T k="mk.a11y.limitsH" /></h2>
    <p className="mt-2 text-slate-600"><T k="mk.a11y.limitsD" /></p>
    <h2 className="mt-8 text-lg font-bold"><T k="mk.a11y.helpH" /></h2>
    <p className="mt-2 text-slate-600"><T k="mk.a11y.helpD" vars={{email:c.supportEmail}} /> (<Link className="text-blue-700 underline" href="/contact"><T k="mk.a11y.contactPage" /></Link>)</p>
  </section></MarketingShell>;
}
