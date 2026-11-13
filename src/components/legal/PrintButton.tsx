'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="legal-no-print inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
    >
      <span aria-hidden="true">{'\u2399'}</span>
      Print or save as PDF
    </button>
  );
}
