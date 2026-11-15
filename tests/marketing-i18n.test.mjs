import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { DICTIONARIES, MARKETING_KEYS } from '../src/lib/i18n/dictionary.ts';
import { MARKETING_EN, KNOWN_TEXT } from '../src/lib/i18n/marketing.ts';
import { translate, translateKnownText } from '../src/lib/i18n/translate.ts';
import { DEFAULT_SITE_CONTENT } from '../src/lib/site-content-shared.ts';
import { DEFAULT_PLAN_CATALOG, INCLUDED_IN_EVERY_PLAN } from '../src/lib/plans-shared.ts';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const FULL = ['ur-PK', 'hi-IN', 'es-US', 'ar'];

test('marketing keys exist in English and fully translate for ur/hi/es/ar', () => {
  assert.ok(MARKETING_KEYS.length > 150, `marketing key inventory (${MARKETING_KEYS.length})`);
  for (const key of MARKETING_KEYS) {
    assert.ok(MARKETING_EN[key], `en has ${key}`);
    for (const code of FULL) {
      assert.ok(DICTIONARIES[code][key], `${code} has ${key}`);
      assert.notEqual(DICTIONARIES[code][key], MARKETING_EN[key], `${code} actually translates ${key}`);
    }
  }
});

test('marketing keys resolve in every locale (English fallback, never blank/key)', () => {
  for (const code of Object.keys(DICTIONARIES)) {
    for (const key of ['mk.pricing.h1', 'mk.home.badge', 'mk.legal.englishNotice', 'mk.contact.send']) {
      const v = translate(code, key);
      assert.ok(v && v !== key, `${code} resolves ${key}`);
    }
  }
  // Core marketing strings are translated (not just inherited) in bn/pa too.
  for (const code of ['bn-BD', 'pa-IN']) {
    assert.notEqual(translate(code, 'mk.pricing.h1'), MARKETING_EN['mk.pricing.h1'], `${code} pricing headline`);
    assert.notEqual(translate(code, 'mk.features'), MARKETING_EN['mk.features'], `${code} nav features`);
  }
});

test('shipped CMS defaults translate via KNOWN_TEXT; admin copy is untouched', () => {
  const c = DEFAULT_SITE_CONTENT;
  const cmsStrings = [
    c.tagline, c.heroHeadline, c.heroSubtext, c.heroPrimaryCta, c.heroSecondaryCta,
    c.featuresHeading, c.aboutText, c.roadmapText, c.footerText,
    ...c.features.flatMap((f) => [f.title, f.description]),
    ...c.faqs.flatMap((f) => [f.question, f.answer]),
  ];
  for (const s of cmsStrings) {
    assert.ok(KNOWN_TEXT[s.trim()], `CMS default is known: ${s.slice(0, 50)}`);
    assert.notEqual(translateKnownText('ur-PK', s), s, `ur translates: ${s.slice(0, 40)}`);
  }
  // Admin-customized copy must render exactly as authored.
  const custom = 'My clinic custom headline — call (555) 010-1234 today!';
  assert.equal(translateKnownText('ur-PK', custom), custom);
  assert.equal(translateKnownText('ar', custom), custom);
  assert.equal(translateKnownText('ur-PK', null), '');
  assert.equal(translateKnownText('ur-PK', undefined, 'fb'), 'fb');
});

test('plan catalog defaults (description / best-for / CTA) translate via KNOWN_TEXT', () => {
  for (const p of DEFAULT_PLAN_CATALOG) {
    for (const s of [p.description, p.bestFor, p.cta]) {
      assert.ok(KNOWN_TEXT[s.trim()], `plan string known: ${s.slice(0, 40)}`);
      assert.notEqual(translateKnownText('es-US', s), s, `es translates: ${s.slice(0, 40)}`);
    }
    // Prices/trials are data, not copy — they must never be "translated" away.
    assert.ok(p.monthlyPriceCents >= 0 && p.trialDays > 0);
  }
  assert.equal(DEFAULT_PLAN_CATALOG.find((p) => p.slug === 'starter').monthlyPriceCents, 9900);
  assert.equal(DEFAULT_PLAN_CATALOG.find((p) => p.slug === 'professional').monthlyPriceCents, 24900);
  assert.ok(INCLUDED_IN_EVERY_PLAN.length >= 5);
  for (const plan of DEFAULT_PLAN_CATALOG) {
    for (const f of plan.features) {
      assert.ok(KNOWN_TEXT[f.trim()], `plan feature known: ${f.slice(0, 40)}`);
      assert.notEqual(translateKnownText('ur-PK', f), f, `ur translates feature: ${f.slice(0, 30)}`);
    }
  }
  for (const x of INCLUDED_IN_EVERY_PLAN) {
    assert.ok(KNOWN_TEXT[x.trim()], `included item known: ${x.slice(0, 40)}`);
  }
});

test('marketing pages are wired to the translator (no hard-coded shell copy)', () => {
  assert.match(read('src/components/marketing/Marketing.tsx'), /useI18n/);
  assert.match(read('src/components/marketing/Marketing.tsx'), /mk\.pricesNote/);
  assert.match(read('src/app/page.tsx'), /mk\.home\.badge/);
  assert.match(read('src/app/page.tsx'), /Known text=\{c\.heroHeadline\}/);
  assert.match(read('src/app/features/page.tsx'), /mk\.features\.h1/);
  assert.match(read('src/app/pricing/page.tsx'), /mk\.pricing\.h1/);
  assert.match(read('src/components/marketing/PricingClient.tsx'), /useI18n/);
  assert.match(read('src/components/marketing/PricingClient.tsx'), /translateKnownText/);
  assert.match(read('src/app/about/page.tsx'), /mk\.about\.h1/);
  assert.match(read('src/app/faq/page.tsx'), /Known text=\{f\.question\}/);
  assert.match(read('src/app/contact/page.tsx'), /mk\.contact\.h1/);
  assert.match(read('src/app/accessibility/page.tsx'), /mk\.a11y\.h1/);
  assert.match(read('src/app/security/page.tsx'), /mk\.security\.h1/);
  assert.match(read('src/app/legal/page.tsx'), /mk\.legal\.englishNotice/);
  // Legal documents themselves stay English-governed, with the translated notice on each.
  assert.match(read('src/app/legal/[slug]/page.tsx'), /mk\.legal\.englishNotice/);
});

test('no external translation service is introduced for marketing either', () => {
  const src = ['marketing.ts', 'marketing-locales.ts', 'translate.ts', 'dictionary.ts']
    .map((f) => read(`src/lib/i18n/${f}`))
    .join('\n');
  assert.equal(/translate\.google|deepl|api\.openai|libretranslate|microsoft.*translator/i.test(src), false);
});
