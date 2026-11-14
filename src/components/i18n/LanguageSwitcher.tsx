'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useI18n } from './I18nProvider';
import { localeInfo, localesByRegion } from '@/lib/i18n/locales';

/**
 * Language & region picker. Grouped by country (United States, United
 * Kingdom, Pakistan, India, …) so users pick "their" region first and the
 * language second. Remembers the choice on the device.
 *
 * `variant="dark"` is for the navy app header/sidebar; `"light"` for the
 * marketing site and auth screens. `compact` renders an icon-only button.
 */
export function LanguageSwitcher({
  variant = 'dark',
  compact = false,
}: {
  variant?: 'dark' | 'light';
  compact?: boolean;
}) {
  const { locale, setLocale, t, autoDetected } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const info = localeInfo(locale);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const buttonCls =
    variant === 'dark'
      ? 'text-white/80 hover:text-white hover:bg-white/10'
      : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.changeLanguage')}
        title={`${t('common.language')}: ${info.englishName}`}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${buttonCls}`}
      >
        <Globe className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        {!compact && (
          <>
            <span className="hidden max-w-[110px] truncate sm:inline">{info.nativeName}</span>
            <span className="rounded bg-current/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide opacity-70">
              {info.badge}
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('common.selectRegion')}
          className="absolute end-0 top-full z-[70] mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          <p className="border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t('common.selectRegion')}
          </p>
          {autoDetected && (
            <p className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-medium text-blue-800">
              {t('common.autoDetected')}: {info.englishName}
            </p>
          )}
          {localesByRegion().map(({ region, locales }) => (
            <div key={region} className="py-1">
              <p className="px-4 pb-0.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {region}
              </p>
              {locales.map((l) => {
                const active = l.code === locale;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLocale(l.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none ${
                      active ? 'bg-blue-50/70 font-semibold text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex h-6 w-8 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[9px] font-bold tracking-wide text-slate-600">
                      {l.badge}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate" lang={l.code} dir={l.dir}>
                        {l.nativeName}
                      </span>
                      <span className="block truncate text-[11px] font-normal text-slate-400">
                        {l.englishName}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 flex-shrink-0 text-blue-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ))}
          <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
            {t('common.translationNote')}
          </p>
        </div>
      )}
    </div>
  );
}
