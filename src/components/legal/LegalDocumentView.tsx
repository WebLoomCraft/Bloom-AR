import Link from 'next/link';
import type { LegalDocument } from '@/lib/legal/types';
import { buildToc, findPlaceholders, findCounselNotes } from '@/lib/legal/types';
import { LegalBlocks } from './Blocks';
import TableOfContents from './TableOfContents';
import PrintButton from './PrintButton';
import { entityFullName, postalAddressOneLine } from '@/lib/legal/entity';

/** Shown only when the site operator has not yet supplied a real date. */
function displayDate(value: string): string | null {
  if (!value || value.includes('[[')) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function LegalDocumentView({
  doc,
  relatedTitles,
  allDocs,
}: {
  doc: LegalDocument;
  relatedTitles: Record<string, string>;
  allDocs: { slug: string; title: string; shortTitle: string }[];
}) {
  const toc = buildToc(doc);
  const placeholders = findPlaceholders(doc);
  const counsel = findCounselNotes(doc);
  const effective = displayDate(doc.effectiveDate);
  const updated = displayDate(doc.lastUpdated);

  return (
    <div className="bg-white">
      {/* Document header */}
      <header className="border-b bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-10">
          <nav aria-label="Breadcrumb" className="legal-no-print text-xs text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-blue-700 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/legal" className="hover:text-blue-700 hover:underline">
                  Legal
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-slate-700">
                {doc.shortTitle}
              </li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                {doc.executable ? 'Agreement for execution' : 'Legal agreement'} · Version{' '}
                {doc.version}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#0F2D52] md:text-[2.6rem]">
                {doc.title}
              </h1>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600">{doc.summary}</p>
            </div>
            <PrintButton />
          </div>

          {/* Metadata grid */}
          <dl className="mt-7 grid gap-x-8 gap-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Effective
              </dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {effective ?? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">
                    not yet set
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Last updated
              </dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {updated ?? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">
                    not yet set
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Issued by
              </dt>
              <dd className="mt-0.5 font-medium text-slate-800">{entityFullName()}</dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Applies to
              </dt>
              <dd className="mt-0.5 leading-snug text-slate-700">{doc.appliesTo}</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* Document picker (mobile-friendly, print-hidden) */}
      <div className="legal-no-print border-b bg-slate-50/70">
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 py-2.5">
          <ul className="flex items-center gap-1 whitespace-nowrap text-sm">
            {allDocs.map((d) => {
              const isCurrent = d.slug === doc.slug;
              return (
                <li key={d.slug}>
                  <Link
                    href={`/legal/${d.slug}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`inline-block rounded-lg px-2.5 py-1.5 transition ${
                      isCurrent
                        ? 'bg-[#0F2D52] font-semibold text-white'
                        : 'text-slate-600 hover:bg-white hover:text-blue-700'
                    }`}
                  >
                    {d.shortTitle}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <article className="min-w-0">
            <LegalBlocks
              blocks={doc.blocks}
              related={doc.related}
              relatedTitles={relatedTitles}
              placeholders={placeholders}
            />

            {counsel.length > 0 && (
              <section
                aria-label="Legal review items"
                className="legal-no-print mt-12 rounded-xl border border-slate-300 bg-slate-50 p-4"
              >
                <h2 className="text-sm font-bold text-[#0F2D52]">
                  Decisions reserved for legal counsel ({counsel.length})
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  These are not missing facts. They are jurisdictional or strategic choices that
                  must be answered by a licensed attorney rather than assumed in the text.
                </p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-slate-700">
                  {counsel.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mt-10 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
              <p>
                <strong className="font-semibold text-slate-700">{doc.title}</strong>, version{' '}
                {doc.version}. Issued by {entityFullName()}, {postalAddressOneLine()}.
              </p>
              <p className="mt-1">
                This document is provided for the purposes of the BloomAR Manager service
                agreement. It is not legal advice to the reader. Customer organizations should
                consult their own counsel before relying on any provision, particularly where the
                reader&apos;s state imposes additional requirements.
              </p>
            </div>
          </article>

          <div className="order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              <TableOfContents entries={toc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
