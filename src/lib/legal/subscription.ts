import type { LegalDocument } from './types.ts';
import { LEGAL_ENTITY, entityFullName } from './entity.ts';
import { buildLegalFacts, CURRENCY, BILLING_IMPLEMENTATION } from './facts.ts';
import type { PlanCatalogItem } from '@/lib/plans-shared';

const E = LEGAL_ENTITY;

export function subscriptionDocument(plans?: PlanCatalogItem[]): LegalDocument {
  const facts = buildLegalFacts(plans);
  const starter = facts.plans.find((p) => p.slug === 'starter');
  const pro = facts.plans.find((p) => p.slug === 'professional');
  const ent = facts.plans.find((p) => p.slug === 'enterprise');

  return {
    slug: 'subscription',
    title: 'Subscription, Billing, Refund and Cancellation Policy',
    shortTitle: 'Billing & Cancellation',
    summary:
      'Trial terms, prices, renewal dates, how to cancel, when refunds are available, and what happens if a payment fails.',
    effectiveDate: '[[EFFECTIVE_DATE]]',
    lastUpdated: '[[LAST_UPDATED_DATE]]',
    version: '1.0',
    appliesTo: 'Customers on self-serve Starter, Professional, and Enterprise subscriptions, including those in a free trial.',
    related: ['terms', 'privacy', 'dpa'],
    blocks: [
      {
        type: 'p',
        text: `This policy explains how subscriptions to BloomAR Manager are billed, renewed, cancelled, and refunded. It forms part of the Terms of Service between you and ${entityFullName(
          E
        )}. Where a written order form or subscription agreement signed by both parties sets different commercial terms, that document controls for that subscription.`,
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'The short version',
        text:
          'You can start a free trial without a credit card. Paid plans are billed in U.S. dollars on a recurring monthly or annual basis. Subscriptions renew automatically until cancelled. You can cancel at any time from Billing settings, and your access continues to the end of the period you have already paid for. Charges already made for a period that has begun are not refunded by default, but there are several exceptions where we do refund — duplicate charges, charges after cancellation, billing errors, and service that was not delivered — and we will always review your situation in good faith.',
      },
      { type: 'h2', text: 'Plans and prices' },
      {
        type: 'table',
        caption: `Published prices in ${CURRENCY} (as displayed on the public pricing page)`,
        headers: ['Plan', 'Monthly', 'Annual', 'Free trial', 'Best for'],
        rows: facts.plans.map((p) => [
          p.name,
          p.monthlyPriceCents > 0 ? `${moneyUsd(p.monthlyPriceCents)} per month` : 'Custom',
          p.annualPriceCents > 0 ? `${moneyUsd(p.annualPriceCents)} per year` : 'Custom',
          `${p.trialDays} days`,
          p.bestFor || '\u2014',
        ]),
      },
      {
        type: 'p',
        text: `All prices are in ${CURRENCY} and exclude applicable taxes. Prices may be shown with or without cents; where a checkout screen displays a different amount for the same plan and interval, the amount displayed at checkout for that purchase controls. Prices are subject to change as described in Section 11.`,
      },
      {
        type: 'p',
        text: `Self-serve subscriptions are available for ${starter?.name ?? 'Starter'} and ${pro?.name ?? 'Professional'}. ${
          ent ? `${ent.name} plans are quoted individually` : 'Enterprise plans are quoted individually'
        } and are billed under a written order form; the price, seat count, claim volume, and payment schedule in that document replace the table above for that subscription.`,
      },
      { type: 'h2', text: 'Free trials' },
      { type: 'h3', text: 'Trial length and eligibility' },
      {
        type: 'p',
        text: `Starter and Professional include a ${starter?.trialDays ?? 14}-day free trial. Enterprise includes a ${ent?.trialDays ?? 30}-day free trial arranged with our team. Trials are available to organizations that have not previously received a free trial for the same organization or substantially the same business, unless we agree otherwise in writing. We may decline a trial or end one early if we reasonably believe it is being used to obtain repeated free access.`,
      },
      { type: 'h3', text: 'A payment method is not required to start' },
      {
        type: 'p',
        text: 'You do not need to provide a credit card to start a trial. This means a trial cannot turn into a charge without an action you take: you must complete a checkout and submit a payment method to become a paying customer.',
      },
      { type: 'h3', text: 'When a trial becomes paid' },
      {
        type: 'p',
        text: 'A trial does not convert automatically. Paid status begins only when you: (a) choose a plan and billing interval in Billing settings, (b) complete checkout and authorize payment, and (c) our payment processor (Stripe) confirms the payment to us. Returning to our site from the payment page is not itself confirmation, and we will never tell you a subscription is active based only on a redirect.',
      },
      { type: 'h3', text: 'What happens when a trial ends without payment' },
      {
        type: 'p',
        text: 'When a trial ends without an active paid subscription, your workspace switches to read-only mode. You can still see and export your records, but you cannot create or modify them. We do not delete your data at the end of a trial. You can reactivate at any time by subscribing, and your existing records remain available.',
      },
      {
        type: 'p',
        text: 'Trial features are the features of the plan selected at sign-up. Seat and claim-volume limits still apply during a trial. We may change trial length or eligibility for new customers at any time; the terms that apply to your trial are the ones in effect when it starts.',
      },
      { type: 'h2', text: 'Authorizing payment' },
      {
        type: 'p',
        text: 'When you subscribe, you will be taken to a Stripe-hosted checkout page. Before you pay, that page displays the plan name, the amount, the currency, the billing interval, the length of any trial, and the fact that the subscription renews automatically. The page also links to these policies, and you must affirmatively agree to the Terms of Service and this policy before completing the purchase.',
      },
      {
        type: 'p',
        text: 'By completing checkout you authorize us, through Stripe, to charge your payment method now and on each renewal date for the amount corresponding to your plan and interval, plus applicable taxes, until you cancel. This authorization continues until the subscription ends. You may withdraw it by cancelling.',
      },
      {
        type: 'p',
        text: 'Stripe collects and stores your payment details. We never receive or store your full card number, expiry date, or security code. Your use of Stripe is also subject to Stripe\u2019s own terms and privacy policy.',
      },
      { type: 'h2', text: 'Billing intervals and renewal dates' },
      {
        type: 'ul',
        items: [
          '**Monthly subscriptions** are charged the monthly price at the start of each monthly period. Your renewal date is the same calendar day each month as the day you subscribed; if the month is shorter, the renewal date is the last day of the month.',
          '**Annual subscriptions** are charged the annual price once per year, on the anniversary of the initial charge.',
          '**A trial that precedes a paid subscription** begins the paid billing period on the day the trial ends, if checkout was completed during the trial with a future start date set by our configuration.',
          '**Mid-period upgrades** (for example Starter to Professional) are charged at the new plan\u2019s price for the next billing period; the current period has already been paid and is not re-rated unless we agree otherwise in writing.',
          '**Mid-period downgrades** reduce the charge for the next renewal. Downgrades that would take your workspace below its current seat or claim usage cannot be completed until usage is reduced, and checkout or the application will tell you if that is the case.',
        ],
      },
      {
        type: 'p',
        text: 'Subscription dates are calculated by Stripe and shown in your Billing settings. If you believe a renewal date is wrong, contact us before the date passes so we can review it.',
      },
      {
        type: 'h2',
        text: 'Automatic renewal disclosure',
      },
      {
        type: 'callout',
        tone: 'legal',
        title: 'Automatic renewal',
        text:
          'SUBSCRIPTIONS RENEW AUTOMATICALLY. Unless you cancel before the end of the current billing period, your subscription will renew for the same interval, and your payment method on file will be charged the then-current price for your plan, plus applicable taxes. Your renewal date and amount are shown in Billing settings and on each receipt. You can cancel at any time as described in Section 6, and you will not be charged again after the period you have already paid for.',
      },
      {
        type: 'p',
        text: `If your plan price changes, we will give you at least 30 days\u2019 notice by email before the change takes effect, and the new price applies from your next renewal after the notice period. ${'{{COUNSEL: confirm state automatic-renewal statutes applicable to each customer location, and whether separate renewal or pre-renewal notices, or additional cancellation methods, are required beyond the online path described here}}'}`,
      },
      { type: 'h2', text: 'How to cancel' },
      {
        type: 'p',
        text: 'You can cancel online, in the product, without contacting support and without answering a retention survey:',
      },
      {
        type: 'ol',
        items: [
          'Sign in to BloomAR Manager.',
          'Open **Settings \u2192 Billing** for the organization whose subscription you want to cancel.',
          'Select **Cancel at Period End** next to the current subscription.',
          'Confirm the cancellation. The page will show that the subscription is scheduled to cancel and the date on which access ends.',
        ],
      },
      {
        type: 'p',
        text: 'If you cannot access the product, or you are an Enterprise customer billed by invoice, you may also cancel by emailing [[SUPPORT_EMAIL]] from an address associated with an Organization Administrator account, or by calling [[SUPPORT_PHONE]]. We will confirm within one business day.',
      },
      {
        type: 'h3',
        text: 'What cancellation does' },
      {
        type: 'p',
        text: `Cancellation stops future renewals. Because access is set to continue to the end of the period you already paid for (${BILLING_IMPLEMENTATION.cancelAtPeriodEnd ? 'cancel-at-period-end' : 'immediate'} cancellation), the subscription remains active until the current period ends, and no further charge is made. You are not required to give a reason, and cancelling does not require you to delete your data.`,
      },
      {
        type: 'h3',
        text: 'Cancellation confirmation' },
      {
        type: 'p',
        text: 'When you cancel, the application displays a confirmation state on the Billing page, and we send an email confirming the cancellation and the date your access ends to the Organization Administrators. If you do not receive that confirmation within one business day, contact [[SUPPORT_EMAIL]] and treat the cancellation as not yet complete.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'If something goes wrong, support finishes the job',
        text:
          `The in-app cancel button records your cancellation in BloomAR Manager and sends the cancellation to our payment processor at the same time, so billing stops at your next renewal date. If our processor cannot be reached, the application tells you so instead of silently claiming success, and we will not charge you again for a period after a cancellation we recorded. If you ever see a charge after cancelling, email [[SUPPORT_EMAIL]] and we will refund it in full.`,
      },
      { type: 'h2', text: 'Access after cancellation' },
      {
        type: 'p',
        text: 'You keep full access to your workspace until the end of the period you have paid for. After that, the workspace becomes read-only: you can view and export records but cannot create or modify them. Your data is retained for 30 days after the subscription ends (the Export Window described in the Terms of Service), during which you can reactivate or request an export. After that window, deletion is carried out as described in the Privacy Policy.',
      },
      {
        type: 'p',
        text: 'We recommend exporting any records you are required to keep before your access ends. Customers subject to medical-record or billing-record retention requirements are responsible for their own retention obligations.',
      },
      { type: 'h2', text: 'Refunds' },
      { type: 'h3', text: 'Our policy' },
      {
        type: 'p',
        text: 'Subscription fees are paid in advance for a period of service. If you cancel, you keep access for the remainder of that period; we do not automatically refund the unused portion, because the service was made available for that period and reserved capacity for your organization.',
      },
      {
        type: 'p',
        text: 'We will nevertheless grant a refund in the following situations, and we apply these rules in good faith rather than as a trap:',
      },
      {
        type: 'ul',
        items: [
          '**Duplicate or accidental charge.** If you were charged twice for the same period, or charged in error, we refund the duplicate or erroneous amount in full.',
          '**Charge after cancellation.** If you cancelled and were charged for a subsequent period, we refund that charge in full.',
          '**Unauthorized charge.** If a charge was made without authorization by your organization, contact us and your card issuer; we will cooperate and refund where we confirm the charge was not authorized.',
          '**Billing error on our side.** If we charged an incorrect amount or the wrong plan, we refund or credit the difference.',
          '**Service not delivered.** If a paid feature did not work as described and we could not correct it within a reasonable time, we refund the prepaid fees for the affected period, as described in the warranty section of the Terms of Service.',
          '**First-purchase goodwill review.** If you subscribed for the first time, were charged, and contact us within 14 days of that first charge before making substantial use of the paid plan, we will review your request and, in most cases, refund the current period. This is a discretionary review, not an unconditional right, and it does not apply to renewals or to Enterprise subscriptions billed by invoice under a fixed-term agreement.',
          '**Required by law.** Where a refund is required by applicable consumer-protection law, we will provide it.',
        ],
      },
      {
        type: 'p',
        text: 'Nothing in this policy limits rights you have under mandatory law, and nothing here is intended to waive a statutory refund right that cannot be waived.',
      },
      { type: 'h3', text: 'Unused time, unused seats, and non-use' },
      {
        type: 'ul',
        items: [
          '**Unused part of a period after cancellation:** not refunded by default (Section 8.1 applies if the cancellation resulted from a duplicate charge, a billing error, or non-delivery).',
          '**Unused seats:** not refunded. Seats are included in the plan price; reducing seats does not reduce the fee for a period already paid.',
          '**Non-use:** not a basis for a refund. If you do not sign in, the subscription still renews, so cancel if you no longer need the Service.',
          '**Annual subscriptions:** mid-year cancellation does not create a refund of the remaining months except under Section 8.1. If the annual discount was granted on the basis of a full-year commitment, a refund made at our discretion may be calculated using the monthly price for the months used.',
        ],
      },
      { type: 'h3', text: 'How to request a refund' },
      {
        type: 'p',
        text: 'Email [[SUPPORT_EMAIL]] from an Organization Administrator address within 60 days of the charge, with the organization name, the invoice or receipt number, the charge date, and the amount. We will acknowledge within two business days and decide within 10 business days. Approved refunds are issued to the original payment method through Stripe; the time to appear on your statement depends on your card issuer, typically 5–10 business days. We do not issue refunds in cash or to a different payment method.',
      },
      { type: 'h2', text: 'Failed payments, grace period, and suspension' },
      {
        type: 'ol',
        items: [
          `**Day 0 — payment fails.** Stripe notifies us. The subscription is marked past due and a ${BILLING_IMPLEMENTATION.gracePeriodDays}-day grace period begins.`,
          '**During the grace period.** Your workspace stays fully usable. We email the billing contact and Organization Administrators with a link to update the payment method, and Stripe may retry the charge automatically.',
          `**End of the grace period.** If payment still has not succeeded, the workspace becomes read-only. You can view and export records but not create or modify them. Your data is not deleted.`,
          '**Resolution.** When a payment succeeds, the subscription returns to active status and full functionality is restored immediately.',
          '**Long-term non-payment.** An account that stays unpaid and inactive may be closed after notice, and data is then handled as described in the Privacy Policy.',
        ],
      },
      {
        type: 'p',
        text: 'We may suspend a workspace for reasons unrelated to payment (for example a security emergency or a material breach of the Terms of Service), as described in the Terms of Service. Suspension for non-payment alone never deletes data.',
      },
      { type: 'h2', text: 'Taxes' },
      {
        type: 'p',
        text: 'Prices exclude sales, use, excise, gross-receipts, and similar taxes. Where we are required to collect tax on your subscription, it will be added at checkout and itemized on your invoice. If you are tax-exempt, send valid exemption documentation to [[SUPPORT_EMAIL]] before or shortly after purchase, and we will apply the exemption prospectively.',
      },
      {
        type: 'p',
        text: 'You are responsible for any taxes that we are not required to collect. If a taxing authority later assesses tax on your purchase, we may invoice you for it, and you agree to pay within 30 days.',
      },
      { type: 'h2', text: 'Price changes' },
      {
        type: 'p',
        text: 'We may change prices for new subscriptions at any time. For existing self-serve subscriptions, we will give at least 30 days\u2019 notice by email to Organization Administrators before a price change applies to your renewal, and the new price takes effect at your next renewal after the notice period. If you do not want to continue at the new price, cancel before the change takes effect. We will not apply a price increase retroactively to a period you have already paid for. Enterprise prices are governed by your order form, which may fix pricing for its term.',
      },
      { type: 'h2', text: 'Duplicate payments' },
      {
        type: 'p',
        text: 'If you are charged twice for the same subscription period — for example because you completed checkout twice, or switched plans while a charge was pending — contact [[SUPPORT_EMAIL]] with both receipt numbers. We will confirm the duplicate and refund the extra charge in full. We do not require you to accept a credit instead of a refund.',
      },
      { type: 'h2', text: 'Chargebacks and billing disputes' },
      {
        type: 'p',
        text: 'Please contact us before filing a chargeback with your card issuer. Most billing questions are resolved the same day. We may ask for the invoice number, organization name, and date of the charge.',
      },
      {
        type: 'p',
        text: 'If a chargeback is filed, we may suspend the subscription while the dispute is investigated, and we may provide Stripe and the card issuer with the checkout and consent records that evidence the purchase and the acceptance of these terms. If a chargeback is resolved in our favor, the subscription resumes. We do not charge a separate chargeback fee, and we do not retaliate against a customer for raising a good-faith dispute.',
      },
      { type: 'h2', text: 'Enterprise contractual billing' },
      {
        type: 'p',
        text: 'Enterprise subscriptions are governed by a written order form or subscription agreement. That document may provide for annual or quarterly invoicing, net payment terms, committed seat or claim volumes, true-ups, multi-year terms, and a non-cancellable initial term. Where it conflicts with this policy on commercial matters, the order form controls. Unless the order form says otherwise, Enterprise invoices are payable within 30 days, late amounts may accrue interest at the lesser of 1.5% per month or the maximum permitted by law, and the subscription renews for successive terms as stated in the order form.',
      },
      { type: 'h2', text: 'Changes to this policy' },
      {
        type: 'p',
        text: 'We may update this policy to reflect changes in our pricing, our payment provider, or the law. We will post the updated version with a new "Last updated" date and, for material changes affecting existing subscriptions, give at least 30 days\u2019 notice by email. Changes do not apply retroactively to charges already made.',
      },
      { type: 'h2', text: 'Questions and contact' },
      {
        type: 'address',
        lines: [
          `${entityFullName(E)} — Billing Support`,
          'Email: [[SUPPORT_EMAIL]]',
          'Phone: [[SUPPORT_PHONE]]',
          'Billing hours: {{CONFIRM: support hours and time zone for billing inquiries}}',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Document status',
        text:
          'Version 1.0. Prices in this document are generated from the same plan configuration the public pricing page and checkout use, so the three cannot drift apart. Effective and last-updated dates are placeholders until publication.',
      },
    ],
  };
}

function moneyUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
