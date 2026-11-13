export interface SiteContent {
  brandName: string; tagline: string; supportEmail: string; supportPhone: string;
  announcementEnabled: boolean; announcementText: string; announcementLink: string;
  heroHeadline: string; heroSubtext: string; heroPrimaryCta: string; heroSecondaryCta: string;
  featuresHeading: string;
  features: { title: string; description: string }[];
  aboutText: string; roadmapText: string;
  faqs: { question: string; answer: string }[];
  footerText: string; seoTitle: string; seoDescription: string;
}
export const DEFAULT_SITE_CONTENT: SiteContent = {
  brandName: 'BloomAR Manager', tagline: 'Medical billing & accounts-receivable workspace for practices and billing companies.',
  supportEmail: '', supportPhone: '', announcementEnabled: false, announcementText: '', announcementLink: '',
  heroHeadline: 'Take Control of Your Medical Billing and Accounts Receivable.',
  heroSubtext: 'Manage your billing operations, monitor outstanding receivables, organize your workflows, and give your team a centralized workspace built around your practice.',
  heroPrimaryCta: 'Start Free Trial', heroSecondaryCta: 'Book a Demo', featuresHeading: 'Built for practices, physicians & billing companies',
  features: [
    { title: 'AR work queues', description: 'Prioritized unworked / working / pending-approval queues so nothing ages silently.' },
    { title: 'Claim tracking & follow-up', description: '15 claim statuses, notes, documents, follow-up dates and full status history.' },
    { title: 'Denial management', description: '272 CARC/RARC codes, denial reasons, coding queue and AI denial analysis.' },
    { title: 'AR aging & reports', description: 'Aging, payer breakdown, productivity and exportable reports.' },
    { title: 'Authorizations & tasks', description: 'Prior auth, referrals, VOB, charge entry and payment posting workflows.' },
    { title: 'Team collaboration', description: 'Role-based access, chat, notifications, sign-offs and a complete audit trail.' },
  ],
  aboutText: 'BloomAR Manager exists to give medical practices and billing companies one organized place to work accounts receivable: see what is outstanding, assign it, work it, review it, and measure it. Our philosophy is simple — preserve the workflows billing teams actually use, isolate each organization\'s data, and be honest about what is configured versus planned.',
  roadmapText: 'Richer workflow automation, clearinghouse 835/837 tooling, and expanded reporting — released only when verified against the real backend.',
  faqs: [
    { question: 'How do I create an account?', answer: 'Use Create Account, verify your email, and your organization workspace and trial are created automatically.' },
    { question: 'Can I invite my team?', answer: 'Owners and admins invite members by email with a role; invitations expire in 7 days.' },
    { question: 'How do subscriptions work?', answer: 'Pick a plan, start the trial, and subscribe from Billing settings. Paid status activates only after the payment provider confirms via webhook.' },
    { question: 'Can I use my own domain?', answer: 'Yes — add it in Organization Settings, publish the TXT record shown, verify, then add the domain in your hosting provider for HTTPS.' },
  ],
  footerText: 'We do not claim certifications or outcomes not listed on this site.', seoTitle: 'BloomAR Manager — Medical Billing & AR Management', seoDescription: 'Manage billing operations, outstanding receivables and AR workflows in one organization-scoped workspace.',
};
const str = (v: unknown, fb: string) => (typeof v === 'string' && v.trim() ? v : fb);
export function mergeSiteContent(raw: Record<string, unknown> | null | undefined): SiteContent {
  if (!raw || typeof raw !== 'object') return DEFAULT_SITE_CONTENT;
  const d = DEFAULT_SITE_CONTENT; const r = raw as Partial<SiteContent>;
  return {
    ...d,
    brandName: str(r.brandName, d.brandName), tagline: str(r.tagline, d.tagline),
    supportEmail: typeof r.supportEmail === 'string' ? r.supportEmail : d.supportEmail,
    supportPhone: typeof r.supportPhone === 'string' ? r.supportPhone : d.supportPhone,
    announcementEnabled: Boolean(r.announcementEnabled), announcementText: str(r.announcementText, ''), announcementLink: str(r.announcementLink, ''),
    heroHeadline: str(r.heroHeadline, d.heroHeadline), heroSubtext: str(r.heroSubtext, d.heroSubtext),
    heroPrimaryCta: str(r.heroPrimaryCta, d.heroPrimaryCta), heroSecondaryCta: str(r.heroSecondaryCta, d.heroSecondaryCta),
    featuresHeading: str(r.featuresHeading, d.featuresHeading),
    features: Array.isArray(r.features) && r.features.length ? r.features.filter(f => f && typeof f.title === 'string') as SiteContent['features'] : d.features,
    aboutText: str(r.aboutText, d.aboutText), roadmapText: str(r.roadmapText, d.roadmapText),
    faqs: Array.isArray(r.faqs) && r.faqs.length ? r.faqs.filter(f => f && typeof f.question === 'string') as SiteContent['faqs'] : d.faqs,
    footerText: str(r.footerText, d.footerText), seoTitle: str(r.seoTitle, d.seoTitle), seoDescription: str(r.seoDescription, d.seoDescription),
  };
}
