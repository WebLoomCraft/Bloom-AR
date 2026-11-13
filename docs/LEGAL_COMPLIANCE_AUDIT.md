# BloomAR Manager — Legal & Stripe Readiness Compliance Audit

**Date:** 13 November 2026
**Scope:** `/legal/{terms,privacy,subscription,cookies,dpa,baa}`, `/legal`, checkout, billing settings, footer, and the code paths those documents make claims about.
**Method:** Every statement in the legal documents was checked against the actual implementation in this repository. Where a document makes a claim about product behavior (cookies set, encryption, cancellation, trial conversion, data retention), the claim is asserted by an automated test in `tests/legal-compliance.test.mjs` that reads the relevant source file. Nothing below is marked compliant merely because text exists.

---

## 1. All six legal pages updated

| Route | Before | After | Size |
|---|---|---|---|
| `/legal/terms` | 2 placeholder paragraphs from a DB string (`"Template — have this reviewed by counsel"`) | 27 sections: scope, licence, accounts, org admins, plans/fees, refunds, failed payments, price changes, acceptable use, data ownership, IP, confidentiality, security, HIPAA, third parties, availability, termination, export/deletion, warranties, liability, indemnity, dispute resolution, governing law, general provisions, contact | ~47k chars rendered |
| `/legal/privacy` | 2 placeholder paragraphs | 19 sections with 3-role model (BloomAR-controlled / customer data / PHI under BAA), processing table, HIPAA 3 rules, CCPA/CPRA, other state laws, breach laws, CAN-SPAM, rights, deletion exceptions, retention table, security controls, subprocessors, transfers, children, marketing, cookies, AI features, complaints | ~34k chars |
| `/legal/subscription` | 3 placeholder paragraphs | 16 sections; prices generated from live plan catalog; trial, authorization, renewal dates, auto-renewal disclosure, cancellation steps, access after cancel, refund policy with 7 enumerated refund grounds, grace period, taxes, price changes, duplicates, chargebacks, enterprise billing | ~21k chars |
| `/legal/cookies` | 1 placeholder paragraph | 10 sections; every cookie and local-storage key by name, purpose, duration; SameSite explanation; third-party requests (Vercel Speed Insights, Google Fonts, Stripe); browser controls; GPC/DNT | ~12k chars |
| `/legal/dpa` | 2 placeholder paragraphs | 22 sections: parties, definitions, processing matrix, instructions, processor obligations, confidentiality, 10-row security table, subprocessor authorization + named list, flow-down, data-subject requests, incidents, breach cooperation, DPIAs, transfers, retention, return/export, audit, liability, termination, **HIPAA-vs-DPA comparison table**, precedence, signatures | ~29k chars |
| `/legal/baa` | 2 placeholder paragraphs + "(template)" in the title | 17 sections keyed to 45 CFR 164.308/.310/.312, minimum necessary, reporting, breach notification, subcontractors, individual rights, HHS cooperation, 6-year retention, return/destruction, non-feasible retention, management/admin disclosures, termination for material breach, signatures | ~31k chars |

Supporting changes:

- **New `/legal` index** with document cards, "where to start" routing by user need, issuer identity, and a conditional operator notice listing any unresolved placeholders.
- **Legal documents moved out of the CMS.** The old `site_settings.legal` free-text field (source of the "Template — review before launch" strings) is removed from `site-content-shared.ts`, and the platform-admin editor now explains that documents are version-controlled rather than free text. This prevents a placeholder from being re-introduced through the UI.
- **Footer** lists all six documents in a fixed order plus "All legal documents", with a footer line stating prices are USD and that the product does not provide medical care, coverage decisions, or a reimbursement guarantee.
- **Print/PDF**: dedicated `@media print` rules hide navigation, TOC, buttons and footer; avoid page breaks inside tables and callouts; repeat table headers; render external URLs inline. Each page has a "Print or save as PDF" button.
- **Typography and design system**: document header with breadcrumb, version, effective/last-updated, issuer and "applies to"; sticky TOC with active-section tracking on desktop and a collapsible summary on mobile; consistent h2/h3 numbering; definition lists, captioned tables, three callout tones (info / warning / legal); amber highlighting for unresolved business facts; a "Decisions reserved for legal counsel" panel; "Related documents" cross-links.

## 2. Applicable legal requirements addressed

| Requirement | Where | Status |
|---|---|---|
| HIPAA Privacy Rule (45 CFR 160/164 Subpart E) — permitted uses, minimum necessary, business associate chain | Terms §16, Privacy §6.2, BAA §3, §6.2 | Addressed |
| HIPAA Security Rule (Subpart C) — administrative/physical/technical safeguards | Terms §15, Privacy §6.3 and §10, BAA §6.1 and §4, DPA §7 | Addressed with a factual control inventory |
| HIPAA Breach Notification Rule (Subpart D) — 60-day outer limit, content, BA→CE notification | Privacy §6.4, BAA §7, DPA §11–12 | Addressed |
| 45 CFR 164.504(e) BAA required elements | BAA (all sections) | Addressed |
| 45 CFR 164.502(e)(1)(ii) subcontractor flow-down | BAA §8, DPA §9 | Addressed |
| 45 CFR 164.524/.526/.528 individual rights | BAA §9 | Addressed |
| 45 CFR 164.530(j) / 164.316 six-year documentation | BAA §11 | Addressed |
| CCPA/CPRA — notice at collection, categories, rights, service-provider role, no-sale statement | Privacy §6.5, §7, §8 | Addressed |
| Other state comprehensive privacy laws (CO, CT, VA, TX, OR, etc.) | Privacy §6.6 | Addressed; applicability flagged for counsel |
| State breach-notification statutes (all 50) | Privacy §6.7, DPA §12 | Addressed procedurally |
| CAN-SPAM — sender identity, physical address, unsubscribe honored in 10 business days | Privacy §6.8, §14 | Addressed |
| Automatic-renewal / negative-option statutes | Subscription §5 and §5.1, Terms §7.4 | Disclosed + flagged for counsel per state |
| E-SIGN/UETA for online acceptance and BAA execution | Terms preamble, Register checkbox, BAA §17 | Addressed |
| Anti-Kickback / Stark / FCA exposure | Terms §11 (prohibited activities) | Addressed as customer obligations |
| TCPA | Privacy §6.9 | Addressed (no SMS program) |
| 42 CFR Part 2 | Privacy §6.9 | Disclosed limitation |
| Attorney advertising / no-legal-advice nuance | Every document footer note | Addressed |

## 3. Missing business information

The documents contain **no invented business facts**. Unsupplied values render as amber-highlighted `[[TOKEN]]` placeholders on the live page, and the `/legal` index and each document show an operator notice while any remain. Set these environment variables and redeploy:

| Variable | Used for | Blocks |
|---|---|---|
| `LEGAL_ENTITY_NAME` | Contracting party in every agreement | **Publication** |
| `LEGAL_ADDRESS_LINE1/2`, `LEGAL_CITY`, `LEGAL_REGION`, `LEGAL_POSTAL_CODE` | Notices address, principal place of business | **Publication** |
| `LEGAL_INCORPORATION_STATE` | Entity description in Terms §2 | Publication |
| `LEGAL_SUPPORT_EMAIL` | Cancellation-by-email, refunds, export requests | **Stripe support requirement** |
| `LEGAL_SUPPORT_PHONE` | Alternative cancellation channel | Publication |
| `LEGAL_PRIVACY_EMAIL` | Privacy requests, complaints | Compliance |
| `LEGAL_SECURITY_EMAIL` | Vulnerability/incident reporting | Compliance |
| `LEGAL_NOTICES_EMAIL` | Legal notices, BAA execution requests | Contract formation |
| `LEGAL_GOVERNING_STATE` | Governing law in Terms, DPA, BAA | **Enforceability** |
| `LEGAL_VENUE` | Arbitration seat / exclusive venue | Enforceability |
| `EFFECTIVE_DATE`, `LAST_UPDATED_DATE` | Document metadata | Legal hygiene |

Also required, and not settable by code:

- A monitored support channel beyond email if phone support is promised (`LEGAL_SUPPORT_PHONE` is referenced as an alternative cancellation route; if no phone support exists, remove that sentence).
- Confirmation of the backup retention window (Privacy §9 table, marked `{{CONFIRM:…}}`).

## 4. Unverified security and HIPAA claims

| Claim | Status | Action |
|---|---|---|
| "HIPAA compliant" / "HIPAA certified" | **Never claimed anywhere.** Both the Terms and BAA state explicitly that HIPAA issues no certification and that none is held. | None |
| SOC 2 / HITRUST / ISO 27001 | **Never claimed.** Privacy §10 states none is held. | None |
| bcrypt cost 12 | Verified in `src/lib/auth.ts` | Asserted by test |
| AES-256-GCM for TOTP secrets | Verified in `src/lib/mfa.ts` | Asserted by test |
| PostgreSQL row-level security enabled | Verified in `drizzle/0006_multi_tenant_isolation.sql` | Asserted by test |
| Audit log redaction of credentials/SSNs | Verified in `src/lib/audit.ts` | Asserted by test |
| 8-hour idle / 7-day absolute session | Verified in `src/lib/auth.ts` | Asserted by test |
| TLS in transit | Implied by HTTPS deployment and `sslmode` DB URLs; **not independently verified** | Confirm TLS configuration at the host |
| Encryption at rest | Provider-level (Vercel/Neon). **Not verified by this repository.** | `{{CONFIRM:…}}` in DPA §7 and BAA §4 — complete before sending a BAA to a customer |
| Security risk analysis completed | **Not evidenced.** `docs/HIPAA_READINESS.md` treats it as an outstanding operator action. | `{{CONFIRM:…}}` in BAA §6.1 — name the date or the document |
| Named Security/Privacy Officer | **Not evidenced** | `{{CONFIRM:…}}` in BAA §7 |
| Documented incident-response plan | **Not evidenced** | `{{CONFIRM:…}}` in BAA §7 |
| No automated purge/retention job | Verified — no purge script exists; documents say deletion runs through operator procedure | Asserted by test |
| No PHI sent to third-party AI/OCR vendors | Verified — analysis and extraction are local rules/pattern matching | Stated in Privacy §16, BAA §4 |
| No analytics or advertising cookies/SDKs | Verified — only the `session` cookie; grep for 8 known ad/analytics SDKs returns nothing | Asserted by test |
| 7-day payment grace period | Verified in `webhook/route.ts` and `saas.ts` | Asserted by test |
| Trial does not auto-convert | Verified — paid status only from webhooks | Asserted by test |
| Cancellation reaches Stripe | **Was false before this change** — the Billing page posted `cancel_at_period_end`, which the manage route did not handle, and no Stripe call was made. Now: action accepted, `cancel_at_period_end=true` sent to Stripe, and a failure is reported honestly instead of being swallowed. | Fixed + asserted by test |

## 5. Stripe website requirements

| Requirement | Status | Evidence |
|---|---|---|
| Business identity publicly accessible | ✅ Structure in place | `/legal` and footer show entity + address; **values still needed** (§3) |
| Clear product/service description | ✅ | Homepage, `/features`, Terms §3 |
| Pricing and currency | ✅ | `/pricing`: Starter $99/mo, Professional $249/mo, Enterprise custom; USD; annual $950/$2,390 |
| Terms of Service public, no login | ✅ | `/legal/terms` returns 200 unauthenticated (verified by HTTP request) |
| Privacy Policy public | ✅ | `/legal/privacy` 200 unauthenticated |
| Subscription/cancellation policy public | ✅ | `/legal/subscription` 200 unauthenticated |
| Refund information public | ✅ | `/legal/subscription` §8 |
| Contact information and support channel | ✅ Structure, ⚠️ values | `/contact`, `/legal` issuer block; needs `LEGAL_SUPPORT_EMAIL` |
| Legal restrictions disclosed | ✅ | Terms §11, refund/eligibility terms |
| Business name/description consistent with Stripe Dashboard | ⚠️ **Operator action** | Set `LEGAL_DBA`/`LEGAL_ENTITY_NAME` to match the Dashboard legal entity, and matching statement descriptor |
| Terms of Service URL in Stripe Dashboard → Public details | ⚠️ **Operator action** | Required for the consent checkbox to work at all; checkout now returns a precise instruction if missing |
| Privacy Policy URL in Stripe Dashboard | ⚠️ **Operator action** | `/legal/privacy` |
| Refund policy URL in Stripe Dashboard | ⚠️ **Operator action** | `/legal/subscription` |
| Prices in Stripe match the pricing page | ⚠️ **Operator action** | Per-plan `stripeMonthlyPriceId`/`stripeAnnualPriceId` must point at $99/$249/$950/$2,390 prices |
| No implication of Stripe endorsement | ✅ | Nothing on the site implies Stripe approval; Stripe is named only as processor |

## 6. Checkout disclosure issues

Fixed in `src/app/api/subscriptions/checkout/route.ts`:

1. **Terms were never presented.** Checkout is now created with `consent_collection[terms_of_service]=required`, so Stripe renders a mandatory agreement checkbox before the pay button.
2. **Policy links missing.** `custom_text[terms_of_service_acceptance]` now carries the Terms of Service and Subscription/Refund/Cancellation URLs, plus the automatic-renewal statement with the correct cadence ("every month" or "every year" derived from the interval actually purchased).
3. **Cancellation terms.** `custom_text[after_submit]` states that cancelling is available in Settings → Billing, that it stops future renewals, that access continues to the paid period end, and links the refund policy.
4. **Product name on receipt/invoice.** `subscription_data[description]` now says "BloomAR Manager — {plan} (billed monthly|annually)", so the Stripe invoice and receipt identify the product and interval.
5. **Trial length** continues to be sent as `subscription_data[trial_period_days]`, so Stripe displays the trial end date before payment.
6. **Consent is recorded.** `checkout.session.completed` now writes a `checkout_terms_accepted` audit entry containing `consent.terms_of_service`, amount, currency and interval — evidence the customer accepted the terms.
7. **Stripe-side failure is explained.** If Stripe rejects the session because no terms URL is configured, checkout returns a 503 naming the exact Dashboard fields to set, instead of a generic 502.

Remaining outstanding:

- ⚠️ **Stripe will reject sessions until the Dashboard terms URL is set.** This is account configuration, not code.
- ⚠️ **Tax handling.** No `automatic_tax` is enabled and no tax is added at checkout, so the legal statement is "prices exclude taxes, which BloomAR may add where required to collect." If Stripe Tax is enabled later, the checkout and the subscription policy should be revisited together.
- ⚠️ **Annual interval from Billing settings.** `/settings/billing` only offers monthly checkout. The annual prices are published and exercisable only if a purchase path exists (Pricing page → register → Billing). Consider exposing interval selection in Billing settings so the advertised annual option is reachable inside the product.

## 7. Technical issues found and fixed

| Issue | Severity | Fix |
|---|---|---|
| Legal content was DB-editable free text containing "Template — review before launch" | **High** — placeholder presented as a final agreement | Replaced with a typed document registry; CMS field removed |
| "Cancel at Period End" sent an action the API did not implement (`cancel_at_period_end`) | **High** — cancellation silently failed | Route accepts the action; propagates to Stripe |
| Cancellation never reached Stripe, so billing would continue after "cancelling" | **High** — directly contradicts the published policy | `cancel_at_period_end=true` sent to Stripe; failures surfaced to the user |
| Cancel button had no confirmation and reported success unconditionally | Medium | Confirm dialog stating the exact end date and consequences; honest result message |
| No cancellation confirmation state on the Billing page | Medium | Persistent amber banner with the access-end date |
| Refunds were invisible in the invoice ledger | Low | `charge.refunded` / `invoice.payment_refunded` update invoice status |
| `useSearchParams` used without a Suspense boundary on Billing | Medium — prerender risk | Wrapped in `<Suspense>` |
| Optional `LEGAL_ADDRESS_LINE2` rendered as an empty `[[…]]` bracket | Low | Optional tokens are dropped along with their line |
| Hard-coded "see Section N" cross-references drifted from real numbering (13 wrong references) | **High** for a legal document | All corrected; regression test maps each reference to its intended heading |
| `<a>` used for internal legal links (lint error) | Low | Switched to `next/link` |
| `facts.ts` used `@/` alias, so it could not be exercised by the node test runner | Low | Relative `.ts` specifier |

Build and checks: `npx tsc --noEmit` clean; `npm run build` succeeds (`/legal` and `/legal/[slug]` present); `npm test` → 40 pass, 2 pre-existing skips, 0 fail (18 of those tests are new); `npm run lint` adds no new findings beyond the pre-existing 55 repo-wide errors.

## 8. Remaining legal-review requirements

These are **not** engineering tasks. Each is flagged in-product with a `{{COUNSEL:…}}` marker, surfaced in a "Decisions reserved for legal counsel" panel on the document page, and enumerated by `findCounselNotes()`:

1. **Arbitration, class-action waiver, jury waiver, venue** (Terms §24) — enforceability varies by state and by customer type; public entities and some healthcare customers cannot agree to arbitration. Decide whether to carve out public entities.
2. **Governing law and venue** (Terms §25) — confirm the chosen state has a reasonable nexus to the business.
3. **Automatic-renewal statutes** (Subscription §5) — some states require specific pre-renewal notice content, a separate consent step, or additional cancellation methods. Confirm per state served.
4. **State privacy-law applicability** (Privacy §6.6) — confirm which comprehensive laws apply, whether thresholds are met, and whether B2B exemptions change the rights offered.
5. **International transfers** (Privacy §12, DPA §14) — confirm no non-U.S. customer should be onboarded, or add SCCs/UK addendum before doing so.
6. **BAA reporting windows** — the BAA promises 5 business days for impermissible use/disclosure and a 30-day cure. Confirm the company can actually meet both.
7. **Refund discretion language** (Subscription §8.1) — confirm the first-purchase 14-day goodwill review is a policy the company will actually administer.
8. **Order of precedence** (Terms §26.1, DPA §21) — confirm it reflects how the company wants conflicts between an order form, the DPA and the BAA resolved.
9. **Export Window of 30 days** (Terms §20) — confirm 30 days is long enough for customers with medical-record retention duties, or extend it contractually for Enterprise.
10. **Independent legal review of all six documents** before they are published with real business details — this is the single remaining gating item.

## 9. Pre-Stripe-review checklist (operator actions)

**Must be done before the legal pages are published:**

- [ ] Set every `LEGAL_*` variable in §3 in the hosting environment and redeploy.
- [ ] Replace `EFFECTIVE_DATE` and `LAST_UPDATED_DATE` with real dates when publishing version 1.0.
- [ ] Confirm the support email and phone are monitored (they are offered as cancellation channels).
- [ ] Remove the phone-cancellation sentence if no phone support exists.

**Must be done before the first live charge:**

- [ ] Stripe Dashboard → Settings → Business → **Public details**: Terms of Service URL = `/legal/terms`, Privacy Policy URL = `/legal/privacy`, refund policy URL = `/legal/subscription`.
- [ ] Stripe product/price objects match the published amounts ($99 / $249 monthly; $950 / $2,390 annual; USD), and each plan row has the correct `stripeMonthlyPriceId` / `stripeAnnualPriceId`.
- [ ] Statement descriptor and business name match `LEGAL_ENTITY_NAME` / `LEGAL_DBA`.
- [ ] Run one end-to-end test-mode purchase: confirm the terms checkbox appears, `consent.terms_of_service = accepted` in the session, the audit log shows `checkout_terms_accepted`, and the invoice description names the plan and interval.
- [ ] Run one test-mode cancellation: confirm Stripe shows `cancel_at_period_end = true` and the Billing page shows the end date.
- [ ] Decide and implement tax handling (Stripe Tax or a documented manual process), or leave the "we may add taxes" wording in place.

**Must be done before the first PHI is accepted:**

- [ ] Complete the `{{CONFIRM:…}}` items in BAA §4 and §6 and DPA §7 (encryption at rest, risk analysis date, incident-response plan, named officers, backup retention, access-review cadence, vulnerability management).
- [ ] Execute the BAA with each covered entity; keep executed copies for six years.
- [ ] Complete the administrative safeguards in `docs/HIPAA_READINESS.md` §2 (risk analysis, training, contingency plan, BAAs with hosting/DB/email providers).
- [ ] Confirm the hosting and database providers' BAAs are in place and the plan tier supports them.

**Should be done soon:**

- [ ] Independent counsel review of all six documents (§8).
- [ ] Expose annual billing in `/settings/billing` so the advertised annual plan is purchasable in-product.
- [ ] Re-run `npm run test:legal` on every release; add a cookie or subprocessor to the checklist whenever a new integration is added.
