'use client';
import Link from 'next/link';
import SmoothScroll from './fx/SmoothScroll';
import MarketingNav from './fx/MarketingNav';
import PageTransition from './fx/PageTransition';
import { DEFAULT_SITE_CONTENT, type SiteContent } from '@/lib/site-content-shared';
import { useI18n } from '@/components/i18n/I18nProvider';
import { translateKnownText } from '@/lib/i18n/translate';

/** Canonical footer order for the legal documents. Titles are the official English document titles (the agreements themselves are English-governed). */
const LEGAL_FOOTER_LINKS: [string, string][] = [
  ['terms', 'Terms of Service'],
  ['privacy', 'Privacy Policy'],
  ['subscription', 'Subscription & Cancellation'],
  ['cookies', 'Cookie Policy'],
  ['dpa', 'Data Processing Agreement'],
  ['baa', 'Business Associate Agreement'],
];
export function MarketingShell({ children, content = DEFAULT_SITE_CONTENT }: { children: React.ReactNode; content?: SiteContent }) {
  const { t, locale } = useI18n();
  const known = (text?: string | null) => translateKnownText(locale, text);
  return <div className="min-h-screen bg-white text-slate-900"><SmoothScroll />
    {content.announcementEnabled && content.announcementText && <div className="bg-blue-600 text-white text-center text-sm px-4 py-2">{content.announcementLink ? <Link href={content.announcementLink} className="underline font-medium">{content.announcementText}</Link> : content.announcementText}</div>}
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white">{t('mk.skip')}</a>
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur"><MarketingNav brandName={content.brandName} /></header><main id="main-content" tabIndex={-1} className="outline-none"><PageTransition>{children}</PageTransition></main>
    <footer className="border-t mt-16" aria-label="Site footer"><div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-4 gap-8 text-sm text-slate-600">
      <div><span className="flex items-center gap-2"><img src="/logo-mark.svg" alt="" width="30" height="30" /><b className="text-[#0F2D52]">{content.brandName}</b></span><p className="mt-2">{known(content.tagline)}</p><p className="mt-2">{t('mk.productOf')} <b className="text-[#0F2D52]">{content.businessName}</b>{content.businessWebsite && <> — <a className="text-blue-600 hover:underline" href={content.businessWebsite} target="_blank" rel="noreferrer">bloomrcm.vercel.app</a></>}</p>{content.supportEmail && <p className="mt-2">{t('mk.businessSupport')} <a className="text-blue-600" href={`mailto:${content.supportEmail}`}>{content.supportEmail}</a></p>}{content.supportPhone && <p>{content.supportPhone}</p>}</div>
      <div><b>{t('mk.product')}</b><ul className="mt-2 space-y-1"><li><Link href="/features">{t('mk.features')}</Link></li><li><Link href="/pricing">{t('mk.pricing')}</Link></li></ul></div>
      <div><b>{t('mk.company')}</b><ul className="mt-2 space-y-1"><li><Link href="/about">{t('mk.about')}</Link></li><li><Link href="/contact">{t('mk.contact')}</Link></li><li><Link href="/faq">{t('mk.faq')}</Link></li><li><Link href="/security">{t('mk.security')}</Link></li><li><Link href="/accessibility">{t('mk.accessibility')}</Link></li></ul></div>
      <div><b>{t('mk.legal')}</b><ul className="mt-2 space-y-1">{LEGAL_FOOTER_LINKS.map(([slug,label])=><li key={slug}><Link href={`/legal/${slug}`} className="hover:text-blue-700 hover:underline">{label}</Link></li>)}<li><Link href="/legal" className="font-medium text-blue-700 hover:underline">{t('mk.allLegal')}</Link></li></ul></div>
    </div>
    <div className="mx-auto max-w-6xl px-5 pb-8 text-center text-xs text-slate-500">
      <p>© {new Date().getFullYear()} {content.businessName} ({content.brandName}). {t('common.allRightsReserved')}</p>
      <p className="mt-1">{known(content.footerText)}</p>
      <p className="mt-1.5">{t('mk.pricesNote')}</p>
    </div></footer></div>;
}
export const H1 = ({children}:{children:React.ReactNode}) => <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F2D52] leading-tight">{children}</h1>;
