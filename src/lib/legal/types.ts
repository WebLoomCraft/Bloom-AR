/**
 * Structured document model for BloomAR Manager legal agreements.
 *
 * Legal text is stored as structured blocks (not raw HTML) so that the public
 * renderer, the table of contents, print styles, and the compliance tests can
 * all work from one source of truth.
 *
 * Inline markup supported inside strings:
 *   **bold**              → <strong>
 *   [label](/path)        → internal link
 *   `code`                → monospace
 *   [[PLACEHOLDER_NAME]]  → visibly flagged business information that must be
 *                           supplied by the operator before execution
 */

export type BlockTone = 'info' | 'warn' | 'legal';

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'dl'; items: { term: string; def: string }[] }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'callout'; tone: BlockTone; title?: string; text: string }
  | { type: 'address'; lines: string[] }
  | { type: 'signatures'; parties: { role: string; rows: string[] }[] };

export interface LegalDocument {
  /** URL slug: /legal/{slug} */
  slug: string;
  /** Full title used in the document header and footer link */
  title: string;
  /** Short title used in navigation and cross-references */
  shortTitle: string;
  /** One-sentence description shown on the /legal index and in metadata */
  summary: string;
  /** ISO date the current version took effect */
  effectiveDate: string;
  /** ISO date this version was published */
  lastUpdated: string;
  /** Document version identifier, e.g. "1.0" */
  version: string;
  /** Who the document binds, shown in the document metadata panel */
  appliesTo: string;
  /** Must be executed (signed) by the customer rather than accepted by use */
  executable?: boolean;
  /** Slugs of related documents, rendered as "Related documents" */
  related: string[];
  blocks: Block[];
}

export interface TocEntry {
  id: string;
  label: string;
  level: 2 | 3;
  number: string;
}

/** URL-safe, stable identifier for a heading. */
export function headingId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${index}-${base || 'section'}`;
}

/** Extract h2/h3 headings with automatic section numbering for the TOC. */
export function buildToc(doc: LegalDocument): TocEntry[] {
  const out: TocEntry[] = [];
  let top = 0;
  let sub = 0;
  doc.blocks.forEach((b, i) => {
    if (b.type === 'h2') {
      top += 1;
      sub = 0;
      out.push({ id: headingId(b.text, i), label: b.text, level: 2, number: String(top) });
    } else if (b.type === 'h3') {
      sub += 1;
      out.push({
        id: headingId(b.text, i),
        label: b.text,
        level: 3,
        number: top ? `${top}.${sub}` : String(sub),
      });
    }
  });
  return out;
}

export const PLACEHOLDER_PATTERN = /\[\[[A-Z0-9_]+\]\]/g;

/** Counsel-decision markers. These are legal questions an attorney must answer, not missing facts. */
export const COUNSEL_PATTERN = /\{\{COUNSEL: ([^}]+)\}\}/g;

/** Collect the distinct placeholders present in a document. */
export function findPlaceholders(doc: LegalDocument): string[] {
  const found = new Set<string>();
  const scan = (value: string) => {
    for (const m of value.matchAll(PLACEHOLDER_PATTERN)) found.add(m[0]);
  };
  for (const b of doc.blocks) {
    switch (b.type) {
      case 'h2':
      case 'h3':
      case 'p':
        scan(b.text);
        break;
      case 'ul':
      case 'ol':
        b.items.forEach(scan);
        break;
      case 'dl':
        b.items.forEach((it) => {
          scan(it.term);
          scan(it.def);
        });
        break;
      case 'table':
        b.headers.forEach(scan);
        b.rows.forEach((r) => r.forEach(scan));
        break;
      case 'callout':
        if (b.title) scan(b.title);
        scan(b.text);
        break;
      case 'address':
        b.lines.forEach(scan);
        break;
      case 'signatures':
        b.parties.forEach((p) => {
          scan(p.role);
          p.rows.forEach(scan);
        });
        break;
    }
  }
  return [...found].sort();
}

/** Collect the distinct counsel-decision questions raised in a document. */
export function findCounselNotes(doc: LegalDocument): string[] {
  const found = new Set<string>();
  const scan = (value: string) => {
    for (const m of value.matchAll(COUNSEL_PATTERN)) found.add(m[1].trim());
  };
  for (const b of doc.blocks) {
    if (b.type === 'signatures') continue;
    const json = JSON.stringify(b);
    scan(json);
  }
  return [...found].sort();
}
