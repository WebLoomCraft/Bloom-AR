'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';

function BillingSettingsInner() {
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get('checkout');
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState('');

  const loadBilling = async () => {
    try {
      const [orgRes, plansRes] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/plans'),
      ]);
      const o = await orgRes.json();
      const p = await plansRes.json();
      setPlans(p.plans || []);
      const org =
        o.organizations?.find((x: any) => x.id === o.activeOrganizationId) ||
        o.organizations?.[0];
      if (org) {
        const e = await (await fetch(`/api/subscriptions/me?organizationId=${org.id}`)).json();
        setData({ ...e, org });
      }
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  if (!loaded) {
    return (
      <AppLayout title="Billing & Plan">
        <div className="p-8 text-sm text-slate-600">Loading billing…</div>
      </AppLayout>
    );
  }

  if (!data?.org) {
    return (
      <AppLayout title="Billing & Plan">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border p-6 space-y-3">
          <h1 className="text-xl font-bold text-[#0F2D52]">Billing &amp; Plan</h1>
          <p className="text-sm text-slate-600">
            Create or join an organization workspace first to manage subscriptions and plan limits.
          </p>
          <a
            href="/settings/organization"
            className="inline-block px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold"
          >
            Set up organization →
          </a>
        </div>
      </AppLayout>
    );
  }

  const ent = data.entitlements;
  const usage = ent?.usage;
  const sub = ent?.subscription;
  const invoices = data.invoices || [];

  return (
    <AppLayout title="Billing & Plan">
      <div className="max-w-4xl mx-auto space-y-6">
        {checkoutResult === 'success' && sub?.status !== 'active' && (
          <div role="status" className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-900">
            <b>Checkout completed — waiting for confirmation.</b> Your plan becomes active as soon as
            the payment provider confirms the payment, which is usually immediate. This page updates
            automatically; reload in a moment if the status below still shows a trial.
          </div>
        )}
        {sub?.cancelAtPeriodEnd && (
          <div
            role="status"
            className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-sm text-amber-900"
          >
            <b>Cancelled — no further charges.</b> Your subscription will not renew.
            {sub.currentPeriodEnd && (
              <> You keep full access until{' '}
                <b>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</b>.
              </>
            )}{' '}
            You can resume below at any time before then. Export any records you need to keep
            before access ends.
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#0F2D52]">Billing — {data.org.name}</h1>
              <p className="text-sm mt-2">
                Current plan: <b>{ent?.plan?.name || '—'}</b> · Status:{' '}
                <b>{sub?.status || data.org.status}</b>
                {sub?.trialEnd && (
                  <> · Trial ends {new Date(sub.trialEnd).toLocaleDateString()}</>
                )}
                {sub?.cancelAtPeriodEnd && (
                  <span className="ml-2 text-amber-700 font-semibold">
                    (Scheduled to cancel at period end)
                  </span>
                )}
              </p>
            </div>
            {sub && (sub.status === 'active' || sub.status === 'trialing') && (
              <div>
                {sub.cancelAtPeriodEnd ? (
                  <button
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                    onClick={async () => {
                      const r = await fetch('/api/subscriptions/manage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          organizationId: data.org.id,
                          action: 'resume',
                        }),
                      });
                      const d = await r.json();
                      setMsg(d.message || d.error || 'Subscription updated.');
                      loadBilling();
                    }}
                  >
                    Resume Subscription
                  </button>
                ) : (
                  <button
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
                    onClick={async () => {
                      const endsOn = sub?.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : 'the end of your current billing period';
                      if (
                        !window.confirm(
                          `Cancel your subscription?\n\n` +
                            `• You keep full access until ${endsOn}.\n` +
                            `• Your subscription will not renew and you will not be charged again.\n` +
                            `• Your data is retained and you can export it after cancelling.\n\n` +
                            `See the Subscription, Billing, Refund and Cancellation Policy for refund terms.`
                        )
                      )
                        return;
                      const r = await fetch('/api/subscriptions/manage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          organizationId: data.org.id,
                          action: 'cancel_at_period_end',
                        }),
                      });
                      const d = await r.json();
                      setMsg(
                        r.ok
                          ? d.message || 'Cancelled. Your subscription will not renew.'
                          : d.error || 'Cancellation failed. Contact support at bloomrcm@gmail.com.'
                      );
                      loadBilling();
                    }}
                  >
                    Cancel at Period End
                  </button>
                )}
              </div>
            )}
          </div>

          {usage && (
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="bg-slate-50 border rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Team Seats</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {usage.seatsUsed} / {usage.seatsLimit ?? 'Unlimited'} active members
                </p>
              </div>
              <div className="bg-slate-50 border rounded-xl p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Monthly Claim Volume
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {usage.claimsThisMonth} / {usage.claimsLimit ?? 'Unlimited'} claims this month
                </p>
              </div>
            </div>
          )}

          {!data.paymentsConfigured && (
            <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              Online checkout is not configured on this deployment yet (payment provider keys
              missing). No charge can be made — your workspace entitlements remain active. Operator:
              see docs/SAAS_SETUP.md.
            </p>
          )}

          <div className="grid md:grid-cols-3 gap-4 mt-5">
            {plans.map((p) => {
              const isCurrent = ent?.plan?.slug === p.slug;
              return (
                <div
                  key={p.id}
                  className={`border rounded-xl p-4 flex flex-col justify-between ${
                    isCurrent ? 'border-[#2563EB] bg-blue-50/30' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <b>{p.name}</b>
                      {isCurrent && (
                        <span className="text-[11px] font-bold text-[#2563EB] bg-blue-100 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      ${(p.monthlyPriceCents / 100).toLocaleString()}/mo
                    </p>
                    {p.description && (
                      <p className="text-xs text-slate-500 mt-1.5">{p.description}</p>
                    )}
                  </div>
                  <button
                    disabled={isCurrent}
                    className="mt-3 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    onClick={async () => {
                      const r = await fetch('/api/subscriptions/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          organizationId: data.org.id,
                          planSlug: p.slug,
                          interval: 'monthly',
                        }),
                      });
                      const d = await r.json();
                      if (d.url) window.location.href = d.url;
                      else setMsg(d.error);
                    }}
                  >
                    {isCurrent ? 'Active Plan' : 'Subscribe / change plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {msg && (
            <p
              role="status"
              className="text-sm mt-4 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3"
            >
              {msg}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-4">
            Paid plans activate only after the payment provider confirms via webhook — returning
            from checkout alone never activates a subscription.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Billing is processed by Stripe. Subscriptions renew automatically until cancelled.
            Review the{' '}
            <Link href="/legal/subscription" className="text-[#2563EB] underline">
              Subscription, Billing, Refund and Cancellation Policy
            </Link>{' '}
            and the{' '}
            <Link href="/legal/terms" className="text-[#2563EB] underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold text-slate-900">Invoice History</h2>
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">No invoices recorded yet.</p>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-4">Invoice</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-xs">
                        {inv.invoiceNumber || inv.stripeInvoiceId}
                      </td>
                      <td className="py-2.5 pr-4">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold">
                        ${((inv.amountPaidCents || inv.amountDueCents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-4 capitalize">{inv.status}</td>
                      <td className="py-2.5">
                        {inv.hostedInvoiceUrl ? (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2563EB] hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

/**
 * `useSearchParams` requires a Suspense boundary so the route can be prerendered
 * without reading the query string at build time.
 */
export default function BillingSettingsPage() {
  return (
    <Suspense fallback={<AppLayout title="Billing & Plan"><div className="p-8 text-sm text-slate-600">Loading billing…</div></AppLayout>}>
      <BillingSettingsInner />
    </Suspense>
  );
}
