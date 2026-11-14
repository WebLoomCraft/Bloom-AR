'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useI18n } from './I18nProvider';
import { localeInfo, localesByRegion } from '@/lib/i18n/locales';

/**
 * Full language & region picker for Account Settings → Preferences.
 * The same choice drives the header/sidebar switchers — one device-wide
 * preference, stored in localStorage (`bloomar-locale`).
 */
export function LanguageSettingsCard() {
  const { locale, setLocale, t } = useI18n();
  const info = localeInfo(locale);

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="language-settings-title">
      <h2 id="language-settings-title" className="font-bold">
        {t('settings.languageTitle')}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{t('settings.languageBody')}</p>
      <p className="mt-3 text-sm text-slate-700">
        {t('settings.currentLanguage')}:{' '}
        <b>
          <span lang={info.code} dir={info.dir}>
            {info.nativeName}
          </span>{' '}
          · {info.englishName}
        </b>
      </p>

      <div className="mt-4 space-y-4">
        {localesByRegion().map(({ region, locales }) => (
          <div key={region}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{region}</p>
            <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label={region}>
              {locales.map((l) => {
                const active = l.code === locale;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLocale(l.code)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-blue-600 ${
                      active
                        ? 'border-blue-600 bg-blue-50 font-semibold text-blue-800'
                        : 'bg-white hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <span className="flex h-5 w-7 items-center justify-center rounded bg-slate-100 text-[9px] font-bold text-slate-600">
                      {l.badge}
                    </span>
                    <span lang={l.code} dir={l.dir}>
                      {l.nativeName}
                    </span>
                    {active && <Check className="h-4 w-4 text-blue-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">{t('common.translationNote')}</p>
    </section>
  );
}
