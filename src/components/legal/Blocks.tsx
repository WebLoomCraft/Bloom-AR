import Link from 'next/link';
import type { Block } from '@/lib/legal/types';
import { headingId } from '@/lib/legal/types';
import { RichText } from './inline';

const TONES = {
  info: {
    box: 'border-blue-200 bg-blue-50/70',
    title: 'text-blue-950',
    body: 'text-blue-950/80',
    icon: 'i',
  },
  warn: {
    box: 'border-amber-300 bg-amber-50',
    title: 'text-amber-950',
    body: 'text-amber-950/80',
    icon: '!',
  },
  legal: {
    box: 'border-slate-400 bg-slate-50',
    title: 'text-[#0F2D52]',
    body: 'text-slate-800',
    icon: '\u00a7',
  },
} as const;

export function LegalBlocks({
  blocks,
  related,
  relatedTitles,
  placeholders,
}: {
  blocks: Block[];
  related: string[];
  relatedTitles: Record<string, string>;
  placeholders: string[];
}) {
  const hasPlaceholders = placeholders.length > 0;

  return (
    <div className="legal-prose">
      {hasPlaceholders && (
        <aside
          aria-label="Outstanding business information"
          className="legal-no-print mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-amber-950">
            This document is not final until these details are supplied
          </p>
          <p className="mt-1 text-xs text-amber-900">
            The highlighted items below are facts only the operating business can confirm — a legal
            entity name, a mailing address, a governing-law state, or a monitored contact address.
            They are shown in brackets rather than invented.
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {placeholders.map((p) => (
              <li
                key={p}
                className="rounded border border-amber-300 bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-900"
              >
                {p}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={i}
                id={headingId(block.text, i)}
                className="legal-h2 mt-11 scroll-mt-28 border-t border-slate-200 pt-8 text-[1.35rem] font-bold tracking-tight text-[#0F2D52] first:mt-0 first:border-0 first:pt-0"
              >
                <RichText text={block.text} />
              </h2>
            );
          case 'h3':
            return (
              <h3
                key={i}
                id={headingId(block.text, i)}
                className="legal-h3 mt-7 scroll-mt-28 text-[1.05rem] font-semibold text-[#0F2D52]"
              >
                <RichText text={block.text} />
              </h3>
            );
          case 'p':
            return (
              <p key={i} className="mt-4 text-[0.975rem] leading-[1.75] text-slate-700">
                <RichText text={block.text} />
              </p>
            );
          case 'ul':
            return (
              <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-[0.975rem] leading-[1.7] text-slate-700 marker:text-slate-400">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="mt-4 list-decimal space-y-2 pl-6 text-[0.975rem] leading-[1.7] text-slate-700 marker:font-semibold marker:text-slate-500">
                {block.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    <RichText text={item} />
                  </li>
                ))}
              </ol>
            );
          case 'dl':
            return (
              <dl key={i} className="mt-5 space-y-4">
                {block.items.map((item, j) => (
                  <div key={j} className="rounded-lg border border-slate-200 bg-white p-4">
                    <dt className="text-[0.9rem] font-semibold text-[#0F2D52]">
                      <RichText text={item.term} />
                    </dt>
                    <dd className="mt-1.5 text-[0.925rem] leading-[1.7] text-slate-700">
                      <RichText text={item.def} />
                    </dd>
                  </div>
                ))}
              </dl>
            );
          case 'table':
            return (
              <figure key={i} className="mt-6">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[34rem] border-collapse text-left text-[0.875rem]">
                    {block.caption && (
                      <caption className="border-b bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold text-slate-600">
                        {block.caption}
                      </caption>
                    )}
                    <thead>
                      <tr className="bg-slate-50">
                        {block.headers.map((h, j) => (
                          <th
                            key={j}
                            scope="col"
                            className="border-b border-slate-200 px-4 py-2.5 font-semibold text-[#0F2D52]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, j) => (
                        <tr key={j} className="align-top even:bg-slate-50/50">
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className={`border-b border-slate-100 px-4 py-2.5 leading-relaxed text-slate-700 ${
                                k === 0 ? 'font-medium text-slate-800' : ''
                              }`}
                            >
                              <RichText text={cell} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            );
          case 'callout': {
            const tone = TONES[block.tone];
            return (
              <aside
                key={i}
                className={`mt-6 rounded-xl border p-4 md:p-5 ${tone.box}`}
                aria-label={block.title ?? 'Note'}
              >
                <div className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${tone.title} border border-current/30`}
                  >
                    {tone.icon}
                  </span>
                  <div>
                    {block.title && (
                      <p className={`text-sm font-bold ${tone.title}`}>{block.title}</p>
                    )}
                    <p className={`mt-1 text-[0.9rem] leading-relaxed ${tone.body}`}>
                      <RichText text={block.text} />
                    </p>
                  </div>
                </div>
              </aside>
            );
          }
          case 'address':
            return (
              <address
                key={i}
                className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-[0.9rem] not-italic leading-relaxed text-slate-700"
              >
                {block.lines.filter((line) => line.trim() !== '').map((line, j) => (
                  <div key={j} className={j === 0 ? 'font-semibold text-[#0F2D52]' : ''}>
                    <RichText text={line} />
                  </div>
                ))}
              </address>
            );
          case 'signatures':
            return (
              <div key={i} className="mt-6 grid gap-4 md:grid-cols-2">
                {block.parties.map((party, j) => (
                  <div key={j} className="rounded-xl border border-slate-300 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {party.role}
                    </p>
                    <div className="mt-3 space-y-2 text-[0.85rem] text-slate-600">
                      {party.rows.map((row, k) => (
                        <p key={k} className="border-b border-dotted border-slate-200 pb-1">
                          <RichText text={row} />
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}

      {related.length > 0 && (
        <nav aria-label="Related documents" className="mt-12 border-t border-slate-200 pt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Related documents
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/legal/${slug}`}
                  className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {relatedTitles[slug] ?? slug}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/legal"
                className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                All legal documents
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
