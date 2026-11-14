'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectLocale,
  isLocaleCode,
  localeInfo,
  type LocaleCode,
  type TextDirection,
} from '@/lib/i18n/locales';
import {
  formatCurrencyFor,
  formatDateFor,
  formatNumberFor,
  translate,
} from '@/lib/i18n/translate';

export interface I18nContextValue {
  locale: LocaleCode;
  dir: TextDirection;
  setLocale: (code: LocaleCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
  formatDate: (value: Date | string | number, opts?: Intl.DateTimeFormatOptions) => string;
  /** True when the current locale was guessed from the device, not chosen. */
  autoDetected: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  dir: 'ltr',
  setLocale: () => {},
  t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
  formatNumber: (v) => formatNumberFor(DEFAULT_LOCALE, v),
  formatCurrency: (v) => formatCurrencyFor(DEFAULT_LOCALE, v),
  formatDate: (v, o) => formatDateFor(DEFAULT_LOCALE, v, o),
  autoDetected: false,
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [autoDetected, setAutoDetected] = useState(false);

  // On first load: honour a saved choice, otherwise guess from the device
  // (browser language, then time zone) so a user in Karachi, Delhi, London or
  // Houston lands in a sensible language without doing anything.
  useEffect(() => {
    // Deferred a tick: reads device state once on mount without a
    // synchronous setState cascade during the effect body.
    const timer = window.setTimeout(() => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      } catch {}
      if (isLocaleCode(saved)) {
        setLocaleState(saved);
        setAutoDetected(false);
        return;
      }
      const guess = detectLocale(
        navigator.language,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      setLocaleState(guess);
      setAutoDetected(guess !== DEFAULT_LOCALE);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Reflect the language on <html> for screen readers, search engines and
  // browser translation prompts; flip text direction for Urdu/Arabic.
  useEffect(() => {
    const info = localeInfo(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = info.dir;
  }, [locale]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    setAutoDetected(false);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
      // Cookie too, so a future server render could honour the choice.
      document.cookie = `${LOCALE_STORAGE_KEY}=${code}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: localeInfo(locale).dir,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      formatNumber: (v) => formatNumberFor(locale, v),
      formatCurrency: (v) => formatCurrencyFor(locale, v),
      formatDate: (v, o) => formatDateFor(locale, v, o),
      autoDetected,
    }),
    [locale, setLocale, autoDetected]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
