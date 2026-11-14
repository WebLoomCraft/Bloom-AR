/**
 * Supported locales and the regions (countries) they are offered for.
 *
 * Translation is 100% on-device: dictionaries ship with the app and no text —
 * and in particular no patient, claim, or other PHI — is ever sent to an
 * external translation service. Only the interface chrome is translated;
 * user-entered data, payer names, codes (CPT/ICD-10/CARC), and documents stay
 * exactly as entered.
 */

export type LocaleCode =
  | 'en-US'
  | 'en-GB'
  | 'en-PK'
  | 'en-IN'
  | 'ur-PK'
  | 'hi-IN'
  | 'pa-IN'
  | 'es-US'
  | 'ar'
  | 'bn-BD';

export type TextDirection = 'ltr' | 'rtl';

export interface LocaleInfo {
  code: LocaleCode;
  /** Name in the language itself, e.g. "اردو" */
  nativeName: string;
  /** English name, e.g. "Urdu (Pakistan)" */
  englishName: string;
  /** Country/region this locale is presented under in the picker */
  region: string;
  /** Two-letter badge shown in the picker (country code) */
  badge: string;
  dir: TextDirection;
}

export const LOCALES: LocaleInfo[] = [
  { code: 'en-US', nativeName: 'English', englishName: 'English (United States)', region: 'United States', badge: 'US', dir: 'ltr' },
  { code: 'es-US', nativeName: 'Español', englishName: 'Spanish (United States)', region: 'United States', badge: 'US', dir: 'ltr' },
  { code: 'en-GB', nativeName: 'English', englishName: 'English (United Kingdom)', region: 'United Kingdom', badge: 'GB', dir: 'ltr' },
  { code: 'ur-PK', nativeName: 'اردو', englishName: 'Urdu (Pakistan)', region: 'Pakistan', badge: 'PK', dir: 'rtl' },
  { code: 'en-PK', nativeName: 'English', englishName: 'English (Pakistan)', region: 'Pakistan', badge: 'PK', dir: 'ltr' },
  { code: 'hi-IN', nativeName: 'हिन्दी', englishName: 'Hindi (India)', region: 'India', badge: 'IN', dir: 'ltr' },
  { code: 'pa-IN', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi (India)', region: 'India', badge: 'IN', dir: 'ltr' },
  { code: 'en-IN', nativeName: 'English', englishName: 'English (India)', region: 'India', badge: 'IN', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', region: 'Middle East', badge: 'AE', dir: 'rtl' },
  { code: 'bn-BD', nativeName: 'বাংলা', englishName: 'Bangla (Bangladesh)', region: 'Bangladesh', badge: 'BD', dir: 'ltr' },
];

export const DEFAULT_LOCALE: LocaleCode = 'en-US';
export const LOCALE_STORAGE_KEY = 'bloomar-locale';

export function localeInfo(code: LocaleCode): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === 'string' && LOCALES.some((l) => l.code === v);
}

/** Locales grouped by country/region, in display order, for the picker. */
export function localesByRegion(): Array<{ region: string; locales: LocaleInfo[] }> {
  const order: string[] = [];
  const map = new Map<string, LocaleInfo[]>();
  for (const l of LOCALES) {
    if (!map.has(l.region)) {
      map.set(l.region, []);
      order.push(l.region);
    }
    map.get(l.region)!.push(l);
  }
  return order.map((region) => ({ region, locales: map.get(region)! }));
}

/**
 * Best-guess locale for a first-time visitor, from the browser language and
 * (as a tie-breaker for English speakers) the device time zone. This only
 * picks a starting language — the user can change it at any time and the
 * choice is remembered on their device.
 */
export function detectLocale(
  navLanguage?: string | null,
  timeZone?: string | null
): LocaleCode {
  const lang = (navLanguage || '').toLowerCase();
  if (lang.startsWith('ur')) return 'ur-PK';
  if (lang.startsWith('hi')) return 'hi-IN';
  if (lang.startsWith('pa')) return 'pa-IN';
  if (lang.startsWith('bn')) return 'bn-BD';
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('es')) return 'es-US';
  if (lang.startsWith('en-gb')) return 'en-GB';
  if (lang.startsWith('en-pk')) return 'en-PK';
  if (lang.startsWith('en-in')) return 'en-IN';
  if (lang.startsWith('en')) {
    switch (timeZone) {
      case 'Asia/Karachi':
        return 'en-PK';
      case 'Asia/Kolkata':
      case 'Asia/Calcutta':
        return 'en-IN';
      case 'Europe/London':
        return 'en-GB';
      default:
        return 'en-US';
    }
  }
  return DEFAULT_LOCALE;
}
