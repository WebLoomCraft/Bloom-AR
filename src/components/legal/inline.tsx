import Link from 'next/link';
import React from 'react';

/**
 * Renders the small inline subset used by the legal documents:
 *   **bold**, `code`, [label](/internal-path), and [[PLACEHOLDER]] tokens.
 * No raw HTML is ever injected — the source is trusted TypeScript, and this
 * keeps rendering deterministic and XSS-free.
 */

const SPLIT = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\[\[[A-Z0-9_]+\]\])/;

function isToken(part: string): boolean {
  return (
    (/^\*\*[^*]+\*\*$/.test(part) && part.length > 4) ||
    /^`[^`]+`$/.test(part) ||
    /^\[[^\]]+\]\([^)]+\)$/.test(part) ||
    /^\[\[[A-Z0-9_]+\]\]$/.test(part)
  );
}

function renderToken(token: string, key: number): React.ReactNode {
  if (/^\*\*[^*]+\*\*$/.test(token)) {
    return (
      <strong key={key} className="font-semibold text-[#0F2D52]">
        {token.slice(2, -2)}
      </strong>
    );
  }
  if (/^`[^`]+`$/.test(token)) {
    return (
      <code
        key={key}
        className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800"
      >
        {token.slice(1, -1)}
      </code>
    );
  }
  const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
  if (link) {
    const [, label, href] = link;
    if (/^https?:/i.test(href)) {
      return (
        <a
          key={key}
          href={href}
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-700"
          rel="noreferrer noopener"
          target="_blank"
        >
          {label}
        </a>
      );
    }
    return (
      <Link
        key={key}
        href={href}
        className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-700"
      >
        {label}
      </Link>
    );
  }
  // Unresolved business-information token: make it impossible to miss.
  return (
    <mark
      key={key}
      title="This business detail has not been supplied yet and must be completed before publication."
      className="rounded border border-amber-300 bg-amber-100 px-1 py-0.5 font-mono text-[0.8em] font-semibold text-amber-900"
    >
      {token}
    </mark>
  );
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(new RegExp(SPLIT.source, 'g'));
  return (
    <span className={className}>
      {parts.map((part, i) => (part && isToken(part) ? renderToken(part, i) : part))}
    </span>
  );
}
