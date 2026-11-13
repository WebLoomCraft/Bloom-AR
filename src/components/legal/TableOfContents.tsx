'use client';

import { useEffect, useState } from 'react';
import type { TocEntry } from '@/lib/legal/types';

/**
 * Sticky table of contents for long agreements.
 * - Desktop: a fixed side column with active-section tracking.
 * - Mobile: a collapsible summary so the document is not pushed off-screen.
 * - Print: hidden entirely.
 */
export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string>(entries[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!entries.length) return;
    const ids = entries.map((e) => e.id);
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: [0, 1] }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  const top = entries.filter((e) => e.level === 2);

  return (
    <nav aria-label="Table of contents" className="legal-no-print">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="legal-toc-list"
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-[#0F2D52] shadow-sm lg:hidden"
      >
        <span>Contents ({top.length} sections)</span>
        <span aria-hidden="true" className="text-slate-400">
          {open ? '\u25b2' : '\u25bc'}
        </span>
      </button>

      <div
        id="legal-toc-list"
        className={`${open ? 'mt-2 block' : 'hidden'} rounded-xl border border-slate-200 bg-white p-3 lg:block lg:mt-0 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto`}
      >
        <p className="hidden px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:block">
          On this page
        </p>
        <ol className="space-y-0.5 text-sm">
          {top.map((entry) => {
            const isActive = active === entry.id;
            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex gap-2 rounded-md px-2 py-1.5 leading-snug transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
                    isActive
                      ? 'bg-blue-50 font-semibold text-blue-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-5 shrink-0 tabular-nums ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    {entry.number}
                  </span>
                  <span>{entry.label.replace(/\*\*/g, '')}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
