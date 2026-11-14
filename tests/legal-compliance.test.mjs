import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { buildLegalDocuments, LEGAL_SLUGS } from '../src/lib/legal/index.ts';
import { findPlaceholders, findCounselNotes, buildToc } from '../src/lib/legal/types.ts';
import { LEGAL_ENTITY, missingBusinessInfo } from '../src/lib/legal/entity.ts';
import { buildLegalFacts, BILLING_IMPLEMENTATION } from '../src/lib/legal/facts.ts';
import { DEFAULT_PLAN_CATALOG, annualSavingsPct } from '../src/lib/plans-shared.ts';
import { resolveEntityTokens } from '../src/lib/legal/resolve.ts';

const ROOT = process.cwd();
const docs = buildLegalDocuments();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/** Flatten every string in a document, for content assertions. */
function textOf(doc) {
  return JSON.stringify(doc.blocks);
}

test('all six legal routes exist and are non-trivial, complete documents', () => {
  assert.deepEqual([...LEGAL_SLUGS], ['terms', 'privacy', 'subscription', 'cookies', 'dpa', 'baa']);
  for (const slug of LEGAL_SLUGS) {
    const doc = docs[slug];
    assert.ok(doc, `${slug} builds`);
    assert.equal(doc.slug, slug);
    assert.ok(doc.title.length > 5, `${slug} has a title`);
    assert.ok(doc.summary.length > 40, `${slug} has a summary`);
    const toc = buildToc(doc);
    assert.ok(toc.length >= 6, `${slug} has at least 6 numbered sections (got ${toc.length})`);
    // A placeholder-era document was 1-2 paragraphs; a real agreement is far longer.
    const chars = textOf(doc).length;
    assert.ok(chars > 8000, `${slug} is a full agreement (${chars} chars)`);
  }
});

test('no incomplete-template language is presented as a final agreement', () => {
  const banned = [
    /Template\s*[—-]\s*have this reviewed/i,
    /Template\s*[—-]\s*review before launch/i,
    /\(template\)/i,
    /requires legal review\./i,
    /lorem ipsum/i,
    /\bTBD\b/i,
    /\bTODO\b/i,
    /insert (?:company|business) name/i,
    /\[Your Company\]/i,
  ];
  for (const slug of LEGAL_SLUGS) {
    const all = textOf(docs[slug]) + docs[slug].title + docs[slug].summary;
    for (const pattern of banned) {
      assert.equal(pattern.test(all), false, `${slug} must not contain ${pattern}`);
    }
  }
});

test('business identity is BloomRCM with bloomrcm@gmail.com; still-unknown details stay flagged', () => {
  // Owner-supplied facts (2026-11-13): business is BloomRCM
  // (https://bloomrcm.vercel.app), one business/support inbox for now.
  assert.equal(LEGAL_ENTITY.legalName, 'BloomRCM');
  assert.equal(LEGAL_ENTITY.dba, 'BloomAR Manager');
  assert.equal(LEGAL_ENTITY.supportEmail, 'bloomrcm@gmail.com');
  assert.equal(LEGAL_ENTITY.privacyEmail, 'bloomrcm@gmail.com');
  assert.equal(LEGAL_ENTITY.securityEmail, 'bloomrcm@gmail.com');
  assert.equal(LEGAL_ENTITY.legalEmail, 'bloomrcm@gmail.com');
  assert.equal(LEGAL_ENTITY.website, 'https://bloomrcm.vercel.app');
  const allLegal = LEGAL_SLUGS.map((s) => textOf(docs[s])).join('\n');
  assert.match(allLegal, /BloomRCM/);
  assert.match(allLegal, /bloomrcm@gmail\.com/);
  assert.equal(/Northwind/i.test(allLegal), false, 'no test/preview business name may appear');
  // Details the owner has NOT supplied must still appear as placeholders,
  // never as invented facts (no Inc./LLC suffix, address, or governing state).
  const placeholders = findPlaceholders(docs.terms);
  assert.ok(placeholders.includes('[[GOVERNING_STATE]]'), 'governing state is a placeholder');
  // Effective date lives in the document metadata, not the block list.
  assert.match(docs.terms.effectiveDate, /^\[\[EFFECTIVE_DATE\]\]$/);
  assert.equal(findPlaceholders({ ...docs.terms, blocks: [{ type: 'p', text: docs.terms.effectiveDate }] }).includes('[[EFFECTIVE_DATE]]'), true);

  // Unknown values must be visibly unnatural, never a plausible fake.
  assert.match(LEGAL_ENTITY.addressLine1, /^\[\[LEGAL_ADDRESS_LINE1\]\]$/);
  assert.equal(LEGAL_ENTITY.country, 'United States');
  assert.ok(missingBusinessInfo().length >= 5, 'missing-info reporting lists the gaps');

  // No phone number, street number, or email address is invented anywhere.
  for (const slug of LEGAL_SLUGS) {
    const all = textOf(docs[slug]);
    const emails = [...all.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)].map((m) => m[0]);
    for (const email of emails) {
      // The only literal email allowed is the owner's own business inbox.
      assert.equal(email, 'bloomrcm@gmail.com', `${slug}: unexpected hard-coded email ${email}`);
    }
    const phones = [...all.matchAll(/\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/g)].map((m) => m[0]);
    assert.equal(phones.length, 0, `${slug}: no invented phone numbers (${phones.join(', ')})`);
  }
});

test('entity tokens resolve from configuration and never leak a second syntax', () => {
  const resolved = resolveEntityTokens('Contact [[SUPPORT_EMAIL]] about [[GOVERNING_STATE]].', {
    ...LEGAL_ENTITY,
    supportEmail: 'help@example.com',
    governingState: 'Delaware',
  });
  assert.equal(resolved, 'Contact help@example.com about Delaware.');

  // Unconfigured values must remain visible placeholders, not blanks.
  const untouched = resolveEntityTokens('State of [[GOVERNING_STATE]]', LEGAL_ENTITY);
  assert.equal(untouched, 'State of [[GOVERNING_STATE]]');

  // Optional values are omitted, not left as empty brackets, and the
  // surrounding line disappears with them.
  const withoutLine2 = resolveEntityTokens(
    `Entity\n[[LEGAL_ADDRESS_LINE1]]\n[[LEGAL_ADDRESS_LINE2]]\n[[LEGAL_CITY]], [[LEGAL_REGION]]`,
    { ...LEGAL_ENTITY, addressLine1: '1 Example Way', city: 'Austin', region: 'Texas' }
  );
  assert.equal(withoutLine2, 'Entity\n1 Example Way\nAustin, Texas');
  assert.equal(withoutLine2.includes('[['), false);

  // A legacy <<TOKEN>> style must not survive anywhere in the source documents.
  const dir = path.join(ROOT, 'src/lib/legal');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.equal(/<<[A-Z0-9_]+>>/.test(src), false, `${file} must not use <<TOKEN>> syntax`);
  }
});

test('prices quoted in legal documents are derived from the live plan catalog', () => {
  const facts = buildLegalFacts();
  // Starter $99/mo, Professional $249/mo, annual 950/2390 — the published prices.
  assert.equal(DEFAULT_PLAN_CATALOG.find((p) => p.slug === 'starter').monthlyPriceCents, 9900);
  assert.equal(DEFAULT_PLAN_CATALOG.find((p) => p.slug === 'professional').monthlyPriceCents, 24900);
  assert.equal(DEFAULT_PLAN_CATALOG.find((p) => p.slug === 'starter').annualPriceCents, 95000);
  assert.equal(DEFAULT_PLAN_CATALOG.find((p) => p.slug === 'professional').annualPriceCents, 239000);

  const subscription = textOf(docs.subscription);
  assert.match(subscription, /\$99 per month/);
  assert.match(subscription, /\$249 per month/);
  assert.match(subscription, /\$950 per year/);
  assert.match(subscription, /\$2,390 per year/);
  assert.match(subscription, /14 days/);
  assert.match(subscription, /30 days/);
  assert.match(subscription, /USD/);

  // Every priced plan appears with its exact monthly amount, so an added or
  // re-priced plan cannot silently omit its contractual price.
  for (const plan of DEFAULT_PLAN_CATALOG.filter((p) => p.monthlyPriceCents > 0)) {
    const dollars = `$${(plan.monthlyPriceCents / 100).toLocaleString('en-US')} per month`;
    assert.ok(subscription.includes(dollars), `subscription policy quotes ${dollars}`);
    assert.ok(
      facts.pricingSentences.some((s) => s.includes(dollars)),
      `facts include ${dollars}`
    );
  }

  // The annual saving claim must match the arithmetic, not a hard-coded %
  const starterPct = annualSavingsPct(DEFAULT_PLAN_CATALOG[0]);
  assert.equal(starterPct, 20);
  // The savings figure is computed from the plan prices, and appears in the Terms
  // pricing summary and the annual-billing sentence of the subscription policy.
  assert.match(textOf(docs.terms), /about 20% less than twelve monthly payments/);
  assert.match(textOf(docs.terms), /roughly 20% saving/);
  // Why the literal check above must stay: the percent is computed, not typed.
  assert.equal(
    facts.pricingSentences.some((s) => s.includes('about 20% less than twelve monthly payments')),
    true
  );

  // If a re-priced catalog is passed in, the documents follow it.
  const repriced = DEFAULT_PLAN_CATALOG.map((p) =>
    p.slug === 'starter' ? { ...p, monthlyPriceCents: 14900, annualPriceCents: 143000 } : p
  );
  const repricedDocs = buildLegalDocuments(repriced);
  assert.match(textOf(repricedDocs.subscription), /\$149 per month/);
  assert.equal(textOf(repricedDocs.subscription).includes('$99 per month'), false);
});

test('subscription policy matches the implemented billing behavior', () => {
  const sub = textOf(docs.subscription);

  // Trial: no card, no automatic conversion.
  assert.equal(BILLING_IMPLEMENTATION.cardRequiredForTrial, false);
  assert.match(sub, /do not need to provide a credit card/i);
  assert.match(sub, /does not convert automatically/i);

  // Grace period is 7 days, matching invoice.payment_failed handling.
  assert.equal(BILLING_IMPLEMENTATION.gracePeriodDays, 7);
  assert.match(sub, /7-day grace period/i);

  // Cancellation must be self-service and must state what happens to access.
  assert.match(sub, /Settings \\u2192 Billing|Settings → Billing/i);
  assert.match(sub, /access continues to the end of the period/i);
  assert.match(sub, /not refunded by default/i);

  // Refunds: a fair, disclosed policy rather than an invented "no refunds".
  assert.match(sub, /Duplicate or accidental charge/i);
  assert.match(sub, /Charge after cancellation/i);
  assert.match(sub, /first 14 days of that first charge|within 14 days of that first charge/i);

  // Automatic renewal is disclosed in capitals.
  assert.match(sub, /SUBSCRIPTIONS RENEW AUTOMATICALLY/);

  // Taxes.
  assert.match(sub, /sales, use, excise/i);

  // The policy must not claim the cancel button fails to reach the provider.
  const manageSrc = read('src/app/api/subscriptions/manage/route.ts');
  if (BILLING_IMPLEMENTATION.cancelPropagatesToStripe) {
    assert.match(manageSrc, /api\.stripe\.com\/v1\/subscriptions/);
    assert.match(manageSrc, /cancel_at_period_end/);
    assert.match(manageSrc, /cancel_at_period_end' \|\| action === 'cancel'/);
  }
});

test('checkout requires terms consent and links every policy', () => {
  const checkout = read('src/app/api/subscriptions/checkout/route.ts');
  // Quoted property key in an object literal: 'consent_collection[terms_of_service]': 'required'
  assert.match(checkout, /'consent_collection\[terms_of_service\]': 'required'/);
  assert.match(checkout, /'custom_text\[terms_of_service_acceptance\]\[message\]':/);
  assert.match(checkout, /'custom_text\[after_submit\]\[message\]':/);
  assert.match(checkout, /'subscription_data\[description\]'/);
  const consentIndex = checkout.indexOf('consent_collection[terms_of_service]');
  assert.ok(consentIndex > 0, 'consent collected before payment');
  // Both policy links appear in the acceptance text the customer must check.
  const customText =
    /'custom_text\[terms_of_service_acceptance\]\[message\]':([\s\S]*?)'custom_text\[after_submit\]/.exec(
      checkout
    );
  assert.ok(customText, 'acceptance message is set');
  assert.match(customText[1], /\/legal\/terms/);
  assert.match(customText[1], /\/legal\/subscription/);
  assert.match(customText[1], /renews automatically/);
  assert.match(customText[1], /Settings → Billing/);
  // Renewal cadence must match the interval actually purchased.
  assert.match(checkout, /const cadence = billingInterval === 'annual' \? 'year' : 'month'/);
  // Privacy policy is linked through Stripe's Dashboard settings, which is documented.
  assert.match(checkout, /Public details/);
  assert.match(checkout, /\/legal\/privacy/);
});

test('Terms of Service states the software-only, no-guarantee position', () => {
  const terms = textOf(docs.terms);
  assert.match(terms, /does not provide medical care/i);
  assert.match(terms, /does not make or influence insurance coverage/i);
  assert.match(terms, /does not guarantee that any claim will be paid/i);
  assert.match(terms, /does not promise uninterrupted/i);
  // Required sections from the brief.
  for (const required of [
    'Licence to use the Service',
    'Accounts, eligibility, and registration',
    'Organization administrators and authorized users',
    'Automatic renewal',
    'Acceptable use',
    'Customer Data and ownership',
    'Intellectual property rights',
    'Confidentiality',
    'Data security responsibilities',
    'Healthcare customer responsibilities and HIPAA',
    'Third-party services and integrations',
    'Service availability and maintenance',
    'Suspension and termination',
    'Data export and deletion after termination',
    'Warranties and disclaimers',
    'Limitation of liability',
    'Indemnification',
    'Dispute resolution',
    'Governing law and jurisdiction',
    'Severability',
    'Entire agreement',
    'Contact information',
  ]) {
    assert.ok(terms.includes(required), `Terms contains "${required}"`);
  }
});

test('Privacy Policy distinguishes controller data, customer data, and PHI under a BAA', () => {
  const privacy = textOf(docs.privacy);
  assert.match(privacy, /Two different roles/i);
  assert.match(privacy, /Information we control as a business/);
  assert.match(privacy, /Customer Data we process on behalf of a healthcare organization/);
  assert.match(privacy, /PHI processed under a Business Associate Agreement/);

  // Required legal frameworks.
  for (const law of [
    'HIPAA Privacy Rule',
    'HIPAA Security Rule',
    'HIPAA Breach Notification Rule',
    'California Consumer Privacy Act',
    'State data breach notification laws',
    'Other state comprehensive privacy laws',
    'Children\u2019s privacy',
    'Marketing communications and choices',
    'Cookies and similar technologies',
    'CAN-SPAM',
  ]) {
    assert.ok(privacy.includes(law), `Privacy addresses ${law}`);
  }

  // The sale-of-data statement must be accurate to the codebase: no ad/analytics SDKs.
  assert.match(privacy, /do not sell personal information or PHI for money or other valuable consideration/i);
  const adSdk = /google-analytics|googletagmanager|facebook\.net|fbq\(|hotjar|mixpanel|segment\.com|posthog/i;
  for (const dir of ['src/app', 'src/components']) {
    const walk = (d) =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
      );
    for (const file of walk(path.join(ROOT, dir))) {
      if (!/\.(tsx?|jsx?)$/.test(file)) continue;
      assert.equal(adSdk.test(fs.readFileSync(file, 'utf8')), false, `${file} loads an ad/analytics SDK`);
    }
  }
});

test('Cookie Policy names every cookie the application actually sets', () => {
  const cookies = textOf(docs.cookies);
  const auth = read('src/lib/auth.ts');
  const cookieCfg = read('src/lib/cookie-config.ts');

  // The only cookie set by the app is the session cookie.
  const setCalls = [...fs.readFileSync(path.join(ROOT, 'src/app/api/auth/login/route.ts'), 'utf8')
    .matchAll(/cookies\.set\('([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(setCalls, ['session']);
  assert.match(auth, /cookieStore\.get\('session'\)/);
  assert.match(cookieCfg, /httpOnly: true/);
  assert.match(cookieCfg, /secure: true/);

  assert.match(cookies, /`session`/);
  assert.match(cookies, /HttpOnly/);
  assert.match(cookies, /7 days/);
  assert.match(cookies, /SameSite=None/);

  // Browser storage keys documented must match the code exactly.
  const a11y = read('src/components/marketing/fx/A11yToolbar.tsx');
  const key = /const KEY = '([^']+)'/.exec(a11y)[1];
  assert.ok(cookies.includes(`\`${key}\``), `cookie policy documents ${key}`);
  const sessionSec = read('src/lib/session-security.ts');
  const sk = /SESSION_SECURITY_STORAGE_KEY = '([^']+)'/.exec(sessionSec)[1];
  assert.ok(cookies.includes(`\`${sk}\``), `cookie policy documents ${sk}`);

  // The language-preference cookie/storage set by the i18n provider is documented.
  assert.match(read('src/components/i18n/I18nProvider.tsx'), /LOCALE_STORAGE_KEY/);
  assert.ok(cookies.includes('`bloomar-locale`'), 'cookie policy documents bloomar-locale');
  assert.match(cookies, /two first-party cookies/i);

  // No claim that analytics cookies exist, and no claim they are absent while one is loaded.
  assert.match(cookies, /No analytics cookies/i);
});

test('BAA reflects real capability and never claims HIPAA certification', () => {
  const baa = textOf(docs.baa);
  assert.match(baa, /164\.504\(e\)/);
  assert.match(baa, /164\.308/);
  assert.match(baa, /164\.310/);
  assert.match(baa, /164\.312/);
  assert.match(baa, /Minimum necessary/i);
  assert.match(baa, /Accounting of disclosures/i);
  assert.match(baa, /Return or destruction/i);
  assert.match(baa, /Subcontractor/i);
  assert.match(baa, /Security Incident/i);
  assert.match(baa, /60 calendar days/);
  assert.match(baa, /does not mean BloomRCM is .HIPAA certified./i);
  assert.match(baa, /HIPAA does not issue certification for software/i);

  // Capability claims must match the schema/implementation.
  assert.match(baa, /row-level security is enabled/i);
  const rls = read('drizzle/0006_multi_tenant_isolation.sql');
  assert.match(rls, /ROW LEVEL SECURITY/i);
  const auth = read('src/lib/auth.ts');
  assert.match(auth, /bcrypt\.hash\(password, 12\)/);
  const mfa = read('src/lib/mfa.ts');
  assert.match(mfa, /aes-256-gcm/);
  const audit = read('src/lib/audit.ts');
  assert.match(audit, /REDACTED/);
  // The BAA must state that no automated purge job exists, matching the codebase.
  assert.match(baa, /does not currently run an automated purge job|no automated purge/i);
  assert.equal(BILLING_IMPLEMENTATION.automaticDataDeletionJob, false);
  const scripts = fs.readdirSync(path.join(ROOT, 'scripts')).join(' ');
  assert.equal(/purge|retention-cleanup/i.test(scripts), false, 'no purge job exists in scripts/');
});

test('DPA separates HIPAA obligations from general processor obligations', () => {
  const dpa = textOf(docs.dpa);
  assert.match(dpa, /not a substitute for the BAA/i);
  assert.match(dpa, /Data Processing Agreement/);
  for (const required of [
    'Subject matter',
    'Categories of Data Subjects',
    'Customer instructions',
    'Technical and organizational security measures',
    'Subprocessor authorization',
    'Subprocessor flow-down obligations',
    'Assistance with Data Subject requests',
    'Security incident notification',
    'Personal data breach cooperation',
    'Data protection impact assessments',
    'International data transfers',
    'Data retention and deletion',
    'Data return and export',
    'Audit rights',
    'Liability allocation',
    'Order of precedence',
  ]) {
    assert.ok(dpa.includes(required), `DPA contains "${required}"`);
  }
  // The comparison table must contain both regimes.
  assert.match(dpa, /HIPAA Business Associate Agreement/);
  assert.match(dpa, /This DPA/);
});

test('legal pages are wired to real routes and the footer links every document', () => {
  const route = read('src/app/legal/[slug]/page.tsx');
  assert.match(route, /isLegalSlug\(slug\)/);
  assert.match(route, /generateStaticParams/);
  assert.match(route, /generateMetadata/);
  assert.match(route, /LegalDocumentView/);

  const index = read('src/app/legal/page.tsx');
  assert.match(index, /LEGAL_SLUGS\.map/);

  const marketing = read('src/components/marketing/Marketing.tsx');
  for (const slug of LEGAL_SLUGS) {
    assert.ok(marketing.includes(`'${slug}'`), `footer links /legal/${slug}`);
  }
  // The template-era legal content must be gone from the CMS.
  assert.equal(/legal: Record<string/.test(read('src/lib/site-content-shared.ts')), false);
  assert.equal(/Template — review before launch/.test(read('src/lib/site-content-shared.ts')), false);
});

test('registration and pricing surfaces link the policies Stripe requires', () => {
  const register = read('src/app/register/page.tsx');
  assert.match(register, /\/legal\/terms/);
  assert.match(register, /\/legal\/privacy/);

  const pricing = read('src/components/marketing/PricingClient.tsx');
  assert.match(pricing, /\/legal\/subscription/);
  assert.match(pricing, /Prices in USD/);

  const billing = read('src/app/settings/billing/page.tsx');
  assert.match(billing, /\/legal\/subscription/);
  assert.match(billing, /\/legal\/terms/);
  // Cancellation must be honest about the outcome rather than assuming success.
  assert.match(billing, /cancel_at_period_end/);
});

test('documents expose dates, versions, and counsel-decision flags', () => {
  for (const slug of LEGAL_SLUGS) {
    const doc = docs[slug];
    assert.ok(doc.version, `${slug} has a version`);
    assert.ok(doc.effectiveDate, `${slug} has an effective date field`);
    assert.ok(doc.lastUpdated, `${slug} has a last-updated field`);
    assert.ok(doc.related.every((r) => LEGAL_SLUGS.includes(r)), `${slug} cross-references are valid`);
  }
  // Jurisdiction-specific decisions must be flagged for counsel, not invented.
  const counsel = LEGAL_SLUGS.flatMap((s) => findCounselNotes(docs[s]));
  assert.ok(counsel.length >= 4, `counsel flags present (${counsel.length})`);
  assert.ok(counsel.some((c) => /arbitration|venue/i.test(c)), 'dispute resolution flagged');
  assert.ok(counsel.some((c) => /renewal/i.test(c)), 'renewal law flagged');
});

test('every dollar figure in the agreements is a configured plan price', () => {
  const allowed = new Set();
  for (const p of DEFAULT_PLAN_CATALOG) {
    for (const cents of [p.monthlyPriceCents, p.annualPriceCents]) {
      if (cents > 0) allowed.add(cents / 100);
    }
  }
  allowed.add(100); // the liability cap for a free trial, stated in the Terms
  for (const slug of LEGAL_SLUGS) {
    const text = textOf(docs[slug]);
    for (const m of text.matchAll(/\$([\d,]+)(?:\.\d{2})?/g)) {
      const amount = Number(m[1].replace(/,/g, ''));
      assert.ok(allowed.has(amount), `${slug}: $${amount} is not a configured price`);
    }
  }
});

/**
 * Cross-references are the least-noticed failure mode in a legal document: a
 * reader follows "see Section 9" and lands on the wrong clause. These tests
 * verify every reference against the actual numbering, and pin the two places a
 * human could reasonably read a reference differently.
 */
test('every "Section N" cross-reference resolves to the intended clause', () => {
  const expected = {
    // reference text -> section heading it must point at
    terms: {
      'Section 7': 'Subscriptions, plans, and fees',
      'Section 9': 'Failed payments and delinquent accounts',
      'Section 10': 'Price changes',
      'Section 11': 'Acceptable use',
      'Section 19': 'Suspension and termination',
      'Section 23': 'Indemnification',
      'Section 24': 'Dispute resolution',
      'Section 25': 'Governing law and jurisdiction',
      'Section 4': 'Licence to use the Service',
    },
    privacy: {
      'Section 1': 'Two different roles',
      'Section 5': 'How we share information',
      'Section 7': 'Consumer and data-subject rights',
      'Section 9': 'Data retention',
      'Section 10': 'Data security',
      'Section 13': 'Children',
      'Section 19': 'Contact us',
    },
    subscription: {
      'Section 6': 'How to cancel',
      'Section 8.1': 'Our policy',
      'Section 11': 'Price changes',
    },
    dpa: {
      'Section 7': 'Technical and organizational security measures',
      'Section 8': 'Subprocessor authorization',
      'Section 10': 'Assistance with Data Subject requests',
      'Section 11': 'Security incident notification',
      'Section 15': 'Data retention and deletion',
      'Section 16': 'Data return and export',
      'Section 17': 'Audit rights',
    },
    baa: {
      'Section 3': 'Permitted uses and disclosures',
      'Section 4': 'Actual capabilities of the Service',
      'Section 6': 'Obligations of the business associate',
      'Section 7': 'Breach notification',
      'Section 8': 'Subcontractors',
      'Section 15': 'Term, termination, and material breach',
    },
  };

  const headingsOf = (doc) => {
    const out = [];
    doc.blocks.forEach((b) => {
      if (b.type === 'h2') out.push({ level: 2, text: b.text });
      if (b.type === 'h3') out.push({ level: 3, text: b.text });
    });
    return out;
  };

  for (const [slug, refs] of Object.entries(expected)) {
    const doc = docs[slug];
    const flat = textOf(doc);
    const headings = headingsOf(doc);
    // Build h2 numbering + h3 sub-numbering exactly as the renderer does.
    const numbered = [];
    let top = 0;
    let sub = 0;
    for (const h of headings) {
      if (h.level === 2) {
        top += 1;
        sub = 0;
        numbered.push({ number: String(top), text: h.text });
      } else {
        sub += 1;
        numbered.push({ number: `${top}.${sub}`, text: h.text });
      }
    }

    for (const [ref, target] of Object.entries(refs)) {
      assert.ok(flat.includes(ref), `${slug} still contains ${ref}`);
      const number = ref.replace('Section ', '');
      const section = numbered.find((n) => n.number === number);
      assert.ok(section, `${slug}: ${ref} does not exist (has ${numbered.length} numbered headings)`);
      assert.ok(
        section.text.toLowerCase().includes(target.toLowerCase()),
        `${slug}: ${ref} points at "${section.text}", expected "${target}"`
      );
    }
  }

  // No reference may point past the end of its document.
  for (const slug of ['terms', 'privacy', 'subscription', 'dpa', 'baa']) {
    const flat = textOf(docs[slug]);
    for (const m of flat.matchAll(/Section (\d+)/g)) {
      const n = Number(m[1]);
      const max = (flat.match(/"type":"h2"/g) || []).length;
      assert.ok(n >= 1 && n <= max, `${slug} references Section ${n} but has ${max} sections`);
    }
  }
});

test('webhook records terms acceptance and refund state, matching the billing policy', () => {
  const hook = read('src/app/api/subscriptions/webhook/route.ts');
  // The consent the customer gives at checkout must be evidenced in the audit trail.
  assert.match(hook, /checkout_terms_accepted/);
  assert.match(hook, /obj\.consent\?\.terms_of_service/);
  // Refunds must be reflected, because the policy says a refunded charge is corrected.
  assert.match(hook, /charge\.refunded/);
  assert.match(hook, /'refunded' : 'partially_refunded'/);
  // Signature verification and idempotency must be intact.
  assert.match(hook, /timingSafeEqual/);
  assert.match(hook, /processedWebhooks/);
  // Grace period remains the documented 7 days.
  assert.match(hook, /7 \* 24 \* 60 \* 60 \* 1000/);
});

test('website and software surfaces use BloomRCM and bloomrcm@gmail.com', () => {
  const site = read('src/lib/site-content-shared.ts');
  assert.match(site, /businessName: 'BloomRCM'/);
  assert.match(site, /businessWebsite: 'https:\/\/bloomrcm\.vercel\.app'/);
  assert.match(site, /supportEmail: 'bloomrcm@gmail\.com'/);
  assert.match(read('src/components/marketing/Marketing.tsx'), /bloomrcm@gmail\.com|supportEmail/);
  assert.match(read('src/app/contact/page.tsx'), /bloomrcm@gmail\.com/);
  assert.match(read('src/app/contact/page.tsx'), /bloomrcm\.vercel\.app/);
  assert.match(read('.env.example'), /LEGAL_ENTITY_NAME=BloomRCM/);
  assert.match(read('.env.example'), /LEGAL_SUPPORT_EMAIL=bloomrcm@gmail\.com/);
  assert.equal(/Northwind/i.test(read('src/lib/legal/entity.ts')), false);
});
