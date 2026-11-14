import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell, H1 } from '@/components/marketing/Marketing';
import { getSiteContent } from '@/lib/site-content';
import Reveal from '@/components/marketing/fx/Reveal';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Security — BloomAR Manager',
  description:
    'How BloomRCM protects BloomAR Manager: tenant isolation, MFA, session controls, CSRF and rate limiting, security headers, audit logs, and responsible disclosure.',
  alternates: { canonical: '/security' },
};

const PILLARS: Array<{ icon: string; title: string; points: string[] }> = [
  {
    icon: '🏢',
    title: 'Organization isolation (server-enforced)',
    points: [
      'Every operational record belongs to one organization; the server binds each session to a verified membership and checks ownership on every request — client parameters cannot cross into another workspace.',
      'PostgreSQL Row-Level Security (FORCE RLS) adds a database-level backstop to the application checks.',
      'Platform administrators see workspace metadata only — never claims, patients, or clinical documents.',
    ],
  },
  {
    icon: '🔐',
    title: 'Identity & access control',
    points: [
      'Passwords are hashed with bcrypt (cost 12) and must be 12+ characters with upper-case, lower-case, and a number — the same policy at sign-up, reset, and change.',
      'Optional TOTP multi-factor authentication: secrets encrypted with AES-256-GCM, one-time recovery codes stored hashed.',
      'Role-based access (owner → read-only) is enforced on the server; read-only members and suspended workspaces are blocked from changes, not just hidden buttons.',
    ],
  },
  {
    icon: '⏱️',
    title: 'Session protection',
    points: [
      'Sessions use unique per-session tokens in Secure, HttpOnly cookies, with an 8-hour server-side idle timeout and a 7-day absolute lifetime.',
      'Any session can be revoked from Account Settings → Security & Sessions, signing that device out immediately.',
      'Optional automatic logoff after inactivity, configured per user.',
    ],
  },
  {
    icon: '🛡️',
    title: 'Application & browser hardening',
    points: [
      'Every response carries a Content-Security-Policy, HSTS (on HTTPS), X-Content-Type-Options, Referrer-Policy, and Permissions-Policy — foreign scripts, plugins, and off-site form posts are blocked.',
      'CSRF origin validation on every state-changing API request, plus per-IP rate limiting in front of stricter per-endpoint limits on sign-in, registration, and password reset.',
      'File uploads are restricted by extension, a 25MB size cap, and magic-byte content checks, so a renamed file cannot masquerade as a spreadsheet.',
    ],
  },
  {
    icon: '📜',
    title: 'Auditability',
    points: [
      'Authentication events, role changes, workflow transitions, uploads, payment postings, and coding edits are written to an organization-scoped audit log with user, role, timestamp, and IP.',
      'Credentials and high-risk identifiers are redacted before anything is written to the audit log.',
      'Scoped external API keys are stored SHA-256 hashed and bound to a single organization.',
    ],
  },
  {
    icon: '💳',
    title: 'Payments & privacy by design',
    points: [
      'Card data is collected and stored by Stripe — BloomAR Manager never receives or stores full card numbers.',
      'The in-app language translator runs entirely on your device; no patient, claim, or account text is sent to any translation service.',
      'No advertising trackers, analytics cookies, or session-replay tools run in the product.',
    ],
  },
];

export default async function Page() {
  const c = await getSiteContent();
  return (
    <MarketingShell content={c}>
      <section className="mkt-hero-bg">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Security</p>
          <div className="mt-2 max-w-3xl">
            <H1>Security built into the software, not just the server.</H1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            {c.brandName} handles sensitive billing operations, so protection is layered: the
            hosting and database enforce their controls, and the application enforces its own —
            isolation, authentication, session, browser, and audit controls that hold even if one
            layer is misconfigured. Every measure below is implemented in the product today.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/legal/privacy"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"
            >
              Read the Privacy Policy
            </Link>
            <Link
              href="/legal/baa"
              className="rounded-xl border bg-white px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:shadow-md"
            >
              HIPAA Business Associate Agreement
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="pillars-h" className="mx-auto max-w-6xl px-5 py-10">
        <Reveal>
          <h2 id="pillars-h" className="text-2xl font-extrabold text-[#0F2D52]">
            The measures in place
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 80}>
              <article className="mkt-card-shadow h-full rounded-3xl border bg-white p-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-xl"
                  aria-hidden="true"
                >
                  {s.icon}
                </div>
                <h3 className="mt-3 font-bold text-[#0F2D52]">{s.title}</h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <span aria-hidden="true" className="text-emerald-600">
                        ✓
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl bg-[#0F2D52] p-6 text-white md:p-8">
              <h2 className="text-xl font-extrabold">What we do not claim</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/80">
                <li>
                  No software can honestly be called "unbreachable." We publish the controls we
                  run, fix what we find, and tell you how to report what we miss.
                </li>
                <li>
                  HIPAA has no government certification for software, and we do not claim to be
                  "HIPAA certified." A signed BAA, your own risk analysis, and workforce policies
                  remain necessary — see the BAA and HIPAA readiness notes.
                </li>
                <li>
                  We do not advertise security certifications or audit reports we have not
                  completed. If that changes, it will be stated here with the auditor and date.
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-3xl border bg-white p-6 md:p-8">
              <h2 className="text-xl font-extrabold text-[#0F2D52]">Report a vulnerability</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Found something? Email BloomRCM at{' '}
                <a
                  className="font-semibold text-blue-700 underline"
                  href="mailto:bloomrcm@gmail.com?subject=Security%20report%20—%20BloomAR%20Manager"
                >
                  bloomrcm@gmail.com
                </a>{' '}
                with the page or endpoint, what you did, and what happened. Please give us a
                reasonable chance to fix it before publishing details, and never access another
                organization's data while testing. Our machine-readable policy is at{' '}
                <Link href="/.well-known/security.txt" className="font-semibold text-blue-700 underline">
                  /.well-known/security.txt
                </Link>
                .
              </p>
              <h3 className="mt-5 font-bold text-[#0F2D52]">Your side of shared security</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                <li>Turn on MFA for administrators, and review sessions after staff changes.</li>
                <li>Give each person their own account and the least role they need.</li>
                <li>Execute the BAA before uploading patient information.</li>
              </ul>
              <p className="mt-4 text-sm">
                <Link href="/legal/dpa" className="font-semibold text-blue-700 underline">
                  Data Processing Agreement
                </Link>{' '}
                ·{' '}
                <Link href="/legal/cookies" className="font-semibold text-blue-700 underline">
                  Cookie Policy
                </Link>{' '}
                ·{' '}
                <Link href="/contact" className="font-semibold text-blue-700 underline">
                  Contact BloomRCM
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
