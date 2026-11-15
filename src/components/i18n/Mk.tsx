'use client';

import { useI18n } from './I18nProvider';
import { translateKnownText } from '@/lib/i18n/translate';

/** Translated marketing string by dictionary key (client bridge for server pages). */
export function T({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}

/**
 * CMS / catalog text: shipped English defaults translate via KNOWN_TEXT;
 * admin-customized copy renders exactly as authored.
 */
export function Known({ text, fallback = '' }: { text?: string | null; fallback?: string }) {
  const { locale } = useI18n();
  return <>{translateKnownText(locale, text, fallback)}</>;
}
