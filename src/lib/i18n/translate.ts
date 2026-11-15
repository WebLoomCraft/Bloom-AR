import { DICTIONARIES } from './dictionary.ts';
import { DEFAULT_LOCALE, type LocaleCode } from './locales.ts';

/** Interpolate `{name}`-style placeholders. Unknown placeholders stay as-is. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m
  );
}

/**
 * Pure translation lookup (no React), so dictionaries can be unit-tested.
 * Fallback chain: requested locale → English → the key itself.
 */
export function translate(
  locale: LocaleCode,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  const raw = dict[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
  return interpolate(raw, vars);
}

export function formatNumberFor(locale: LocaleCode, value: number): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}

/** Money stays USD (all plans are billed in USD); only grouping/digits localize. */
export function formatCurrencyFor(locale: LocaleCode, value: number): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value}`;
  }
}

export function formatDateFor(
  locale: LocaleCode,
  value: Date | string | number,
  opts?: Intl.DateTimeFormatOptions
): string {
  try {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(value));
  } catch {
    return new Date(value).toLocaleDateString();
  }
}

/**
 * Translate free text that is known to be one of the shipped English
 * defaults (CMS copy / plan catalog — see KNOWN_TEXT in marketing.ts).
 * Admin-customized text is not in the map and is returned unchanged, so
 * operator-authored copy is never silently machine-reworded.
 */
import { KNOWN_TEXT } from './marketing.ts';

export function translateKnownText(
  locale: LocaleCode,
  text: string | null | undefined,
  fallback = ''
): string {
  if (text == null) return fallback;
  const trimmed = text.trim();
  if (!trimmed) return text;
  const key = KNOWN_TEXT[trimmed];
  return key ? translate(locale, key) : text;
}
