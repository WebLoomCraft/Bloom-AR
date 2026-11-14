import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { LOCALES, detectLocale, localesByRegion, localeInfo } from '../src/lib/i18n/locales.ts';
import { DICTIONARIES, CORE_KEYS } from '../src/lib/i18n/dictionary.ts';
import { translate, formatCurrencyFor, formatNumberFor } from '../src/lib/i18n/translate.ts';
import { SIDEBAR_NAV_ITEMS } from '../src/lib/sidebar-nav.ts';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const NON_ENGLISH = ['ur-PK', 'hi-IN', 'pa-IN', 'es-US', 'ar', 'bn-BD'];

test('regions cover the US, UK, Pakistan, India and related countries', () => {
  const regions = localesByRegion().map((r) => r.region);
  for (const region of ['United States', 'United Kingdom', 'Pakistan', 'India', 'Bangladesh', 'Middle East']) {
    assert.ok(regions.includes(region), `region offered: ${region}`);
  }
  // Every locale has a native name, badge and direction.
  for (const l of LOCALES) {
    assert.ok(l.nativeName.length > 1, `${l.code} native name`);
    assert.ok(['ltr', 'rtl'].includes(l.dir), `${l.code} direction`);
    assert.ok(localeInfo(l.code).code === l.code);
  }
  // Urdu and Arabic are RTL; the rest of the shipped locales are LTR.
  assert.equal(localeInfo('ur-PK').dir, 'rtl');
  assert.equal(localeInfo('ar').dir, 'rtl');
  assert.equal(localeInfo('hi-IN').dir, 'ltr');
});

test('every sidebar item has a real (non-English) translation in every non-English locale', () => {
  const navKeys = SIDEBAR_NAV_ITEMS.map((i) => `nav.${i.id}`);
  assert.ok(navKeys.length >= 30, 'sidebar item inventory');
  for (const code of NON_ENGLISH) {
    const dict = DICTIONARIES[code];
    for (const key of [...navKeys, 'nav.group.arClaims']) {
      assert.ok(dict[key], `${code} translates ${key}`);
      assert.notEqual(dict[key], DICTIONARIES['en-US'][key], `${code} ${key} is actually translated`);
    }
  }
});

test('core chrome keys are translated in every non-English locale', () => {
  const core = [
    'common.language', 'common.changeLanguage', 'common.searchOptions', 'common.logout',
    'header.notifications', 'marketing.signIn', 'marketing.startFreeTrial',
    'auth.signIn', 'auth.password', 'dashboard.totalClaims', 'status.denied',
    'settings.languageTitle', 'shell.sessionExpired',
  ];
  for (const code of NON_ENGLISH) {
    for (const key of core) {
      assert.ok(DICTIONARIES[code][key], `${code} has ${key}`);
      assert.notEqual(DICTIONARIES[code][key], DICTIONARIES['en-US'][key], `${code} ${key} translated`);
    }
  }
  // Regional English inherits the full dictionary (spelling overrides only).
  for (const code of ['en-GB', 'en-PK', 'en-IN']) {
    for (const key of CORE_KEYS) assert.ok(DICTIONARIES[code][key], `${code} inherits ${key}`);
  }
  assert.equal(DICTIONARIES['en-GB']['nav.organization-settings'], 'Organisation Settings');
});

test('translate() interpolates, falls back to English, then to the key', () => {
  assert.equal(translate('en-US', 'common.availableOptions', { count: 3 }), 'Available Options (3)');
  assert.match(translate('ur-PK', 'common.availableOptions', { count: 3 }), /3/);
  assert.equal(translate('ur-PK', 'does.not.exist'), 'does.not.exist');
  // A locale formatted number/currency keeps USD while localising digits.
  assert.equal(formatCurrencyFor('en-US', 1234567), '$1,234,567');
  assert.match(formatNumberFor('hi-IN', 1234567), /12,34,567|१२/);
  assert.notEqual(formatNumberFor('ur-PK', 1234), '');
});

test('region auto-detection maps device language and time zone sensibly', () => {
  assert.equal(detectLocale('ur-PK', 'Asia/Karachi'), 'ur-PK');
  assert.equal(detectLocale('hi-IN', 'Asia/Kolkata'), 'hi-IN');
  assert.equal(detectLocale('pa-IN', 'Asia/Kolkata'), 'pa-IN');
  assert.equal(detectLocale('en-GB', 'Europe/London'), 'en-GB');
  assert.equal(detectLocale('en-US', 'America/New_York'), 'en-US');
  assert.equal(detectLocale('es-US', 'America/Chicago'), 'es-US');
  assert.equal(detectLocale('en', 'Asia/Karachi'), 'en-PK');
  assert.equal(detectLocale('en', 'Asia/Kolkata'), 'en-IN');
  assert.equal(detectLocale('fr-FR', 'Europe/Paris'), 'en-US');
  assert.equal(detectLocale(undefined, undefined), 'en-US');
});

test('i18n is wired into the shell, marketing nav, login, dashboard and settings', () => {
  assert.match(read('src/app/layout.tsx'), /I18nProvider/);
  assert.match(read('src/components/layout/Sidebar.tsx'), /LanguageSwitcher/);
  assert.match(read('src/components/layout/Sidebar.tsx'), /t\(`nav\.\$\{item\.id\}`\)/);
  assert.match(read('src/components/layout/Header.tsx'), /LanguageSwitcher/);
  assert.match(read('src/components/marketing/fx/MarketingNav.tsx'), /LanguageSwitcher/);
  assert.match(read('src/app/login/page.tsx'), /LanguageSwitcher/);
  assert.match(read('src/app/dashboard/page.tsx'), /useI18n/);
  assert.match(read('src/app/settings/account/page.tsx'), /LanguageSettingsCard/);
  // Stored under one shared key so every surface agrees.
  assert.match(read('src/lib/i18n/locales.ts'), /bloomar-locale/);
  // Translation is local-only: no external translation endpoint anywhere in i18n.
  const i18nSrc = ['locales.ts', 'dictionary.ts', 'translate.ts']
    .map((f) => read(`src/lib/i18n/${f}`))
    .join('\n');
  assert.equal(/translate\.google|deepl|api\.openai|libretranslate/i.test(i18nSrc), false);
});
