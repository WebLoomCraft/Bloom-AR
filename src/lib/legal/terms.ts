import type { LegalDocument } from './types.ts';
import { LEGAL_ENTITY, entityFullName, postalAddressOneLine } from './entity.ts';
import { buildLegalFacts, CURRENCY, BILLING_IMPLEMENTATION } from './facts.ts';
import type { PlanCatalogItem } from '@/lib/plans-shared';

const E = LEGAL_ENTITY;

export function termsDocument(plans?: PlanCatalogItem[]): LegalDocument {
  const facts = buildLegalFacts(plans);

  return {
    slug: 'terms',
    title: 'Terms of Service',
    shortTitle: 'Terms',
    summary:
      'The contract between your organization and BloomRCM for use of the BloomAR Manager billing and accounts-receivable platform.',
    effectiveDate: '[[EFFECTIVE_DATE]]',
    lastUpdated: '[[LAST_UPDATED_DATE]]',
    version: '1.0',
    appliesTo: 'Every customer organization, its administrators, and every authorized user who signs in.',
    related: ['privacy', 'subscription', 'dpa', 'baa', 'cookies'],
    blocks: [
      {
        type: 'callout',
        tone: 'warn',
        title: 'Before publication: business information still required',
        text:
          'This agreement is written and ready for use, but the bracketed items below are facts only the operating business can supply. They must be completed before the agreement is published or presented to a customer, and counsel should confirm the handful of jurisdiction-specific choices flagged in this document.',
      },
      {
        type: 'p',
        text: `These Terms of Service ("**Terms**") are a binding agreement between ${entityFullName(
          E
        )} ("**BloomRCM**," "**we**," "**us**") and the organization that registers for, purchases, or uses the BloomAR Manager platform ("**Customer**," "**you**"). If you are accepting these Terms for an employer, practice, billing company, or other legal entity, you represent that you have authority to bind that entity, and "you" refers to that entity.`,
      },
      {
        type: 'p',
        text: 'By creating an account, clicking to accept these Terms, or using the Service, you agree to these Terms. If you do not agree, do not use the Service.',
      },
      {
        type: 'h2',
        text: 'Definitions',
      },
      {
        type: 'dl',
        items: [
          {
            term: 'Service',
            def: 'The BloomAR Manager web application, including the claims and accounts-receivable work queues, denial and coding tools, authorization and task tracking, reporting, document intake, and any associated APIs, documentation, and support we make available.',
          },
          {
            term: 'Customer Data',
            def: 'All data, records, documents, files, and text that Customer or its Authorized Users submit to, store in, or generate through the Service, including claims, patient and subscriber identifiers, payer information, charge and payment data, remittance files, notes, and uploaded documents.',
          },
          {
            term: 'Protected Health Information or PHI',
            def: 'Protected health information as defined in 45 C.F.R. § 160.103, and "electronic protected health information" (ePHI) as defined in 45 C.F.R. § 160.103 when transmitted or maintained in electronic media.',
          },
          {
            term: 'Authorized User',
            def: 'An individual whom Customer permits to access the Service under an account provisioned by Customer, including employees, contractors, and personnel of a billing company acting for Customer.',
          },
          {
            term: 'Organization Administrator',
            def: 'An Authorized User holding an owner or administrator role in a Customer workspace, who can invite users, assign roles, configure the workspace, and manage billing.',
          },
          {
            term: 'Subscription Term',
            def: 'The period for which Customer has paid for or is trialing the Service, as described in Section 7 and in the Subscription, Billing, Refund and Cancellation Policy.',
          },
        ],
      },
      {
        type: 'h2',
        text: 'Who we are and what this agreement covers',
      },
      {
        type: 'p',
        text: `${entityFullName(
          E
        )} is the legal entity that operates the BloomAR Manager product. Its principal place of business is ${postalAddressOneLine(
          E
        )}. BloomRCM is organized under the laws of the State of [[LEGAL_INCORPORATION_STATE]].`,
      },
      {
        type: 'p',
        text: 'These Terms govern the software and workflow-management Service. They do not govern the medical, clinical, billing, or collection services that Customer provides to its own patients or clients, and they do not create a physician-patient, fiduciary, or provider relationship between BloomRCM and any patient.',
      },
      {
        type: 'h2',
        text: 'Scope of the Service',
      },
      {
        type: 'p',
        text: 'BloomAR Manager is a subscription software platform that helps medical practices, physicians, billing companies, and healthcare organizations organize and work their revenue cycle: tracking claims and claim status, prioritizing accounts-receivable follow-up, recording denial reasons and coding work, managing authorizations and referrals, storing supporting documents, assigning internal tasks, and producing operational reports.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'What BloomRCM does not do',
        text:
          'Through BloomAR Manager, BloomRCM provides software and workflow-management tools only. Under these Terms BloomRCM does not provide medical care or clinical advice, does not make or influence insurance coverage or medical-necessity determinations, and does not act as a health plan, and BloomAR Manager does not guarantee that any claim will be paid, that any denial will be overturned, or that any amount of reimbursement will be recovered. Any medical billing or revenue-cycle services BloomRCM may provide to a practice are supplied only under a separate written services agreement and are not provided by, or governed by, BloomAR Manager or these Terms. Decisions about coding, billing, submission, and appeal made in BloomAR Manager remain Customer\u2019s responsibility.',
      },
      {
        type: 'p',
        text: 'Any figures the Service computes (for example aging buckets, denial-category suggestions, recovery-priority scores, or coding-match indicators) are informational workflow aids derived from the data Customer enters and from public code sets. They are not coverage determinations, clinical decisions, or a substitute for review by qualified billing and clinical personnel, and Customer remains solely responsible for the accuracy and appropriateness of everything it submits to a payer.',
      },
      {
        type: 'h2',
        text: 'Licence to use the Service',
      },
      {
        type: 'p',
        text: 'Subject to these Terms and payment of applicable fees, BloomRCM grants Customer a limited, non-exclusive, non-transferable, non-sublicensable, revocable right during the Subscription Term to access and use the Service for Customer\u2019s internal business purposes, and to permit Authorized Users to do the same on Customer\u2019s behalf.',
      },
      {
        type: 'p',
        text: 'The licence is limited to the number of seats, practices, and monthly claim volumes associated with Customer\u2019s plan, as described on the pricing page and enforced by the Service. BloomRCM may measure usage and may refuse to create additional members or claims that exceed the plan limits until Customer upgrades. Enterprise limits described as "fair use" are governed by the written order form or the terms quoted to Customer.',
      },
      {
        type: 'p',
        text: 'All rights not expressly granted are reserved. No licence is granted by implication, estoppel, or otherwise.',
      },
      {
        type: 'h2',
        text: 'Accounts, eligibility, and registration',
      },
      {
        type: 'ul',
        items: [
          'You must be at least 18 years old and legally able to enter into a contract to create an account.',
          'Accounts are organization-scoped. Each Customer workspace is separate and is not shared with, visible to, or accessible by any other customer.',
          'You must provide accurate registration information and keep it current. You are responsible for the accuracy of the organization name, contact details, and billing information you supply.',
          'You must verify your email address where verification is enabled, and you must maintain the security of your credentials, multi-factor authentication devices, and recovery codes.',
          'Credentials are personal. You must not share an Authorized User account, and you must not create accounts to circumvent seat limits, suspension, or a prior termination.',
          'You must notify us promptly at [[SECURITY_EMAIL]] if you believe credentials have been compromised.',
          'BloomRCM may decline, suspend, or close registrations where it reasonably believes the information is false, the account is being used for unlawful purposes, or the account would create a security, sanctions, or legal risk.',
        ],
      },
      {
        type: 'h2',
        text: 'Organization administrators and authorized users',
      },
      {
        type: 'p',
        text: 'The individual who creates a workspace becomes its initial Organization Administrator. Organization Administrators control membership: they invite Authorized Users, assign roles and permissions, remove members, configure workspace settings and custom domains, and manage the subscription.',
      },
      {
        type: 'p',
        text: 'Customer is responsible for: (a) all activity under its workspace and its Authorized User credentials; (b) ensuring each Authorized User is bound by obligations at least as protective as these Terms, including confidentiality and acceptable-use obligations; (c) maintaining an accurate, current list of who should have access and removing access promptly when a person leaves its workforce or no longer needs access; and (d) designating a replacement Organization Administrator if the current one leaves.',
      },
      {
        type: 'p',
        text: 'Roles and permissions are enforced by the Service, including a read-only role and role-based restrictions on administrative actions. Customer acknowledges that role configuration is a Customer responsibility and that BloomRCM does not audit whether Customer\u2019s assigned roles match Customer\u2019s internal policies. BloomRCM personnel do not access Customer Data except as described in the Privacy Policy and, where PHI is involved, the Business Associate Agreement.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Minimum-necessary and workforce obligations stay with Customer',
        text:
          'Deciding what PHI each Authorized User may see, training the workforce, and enforcing minimum-necessary access are Customer obligations as a covered entity or business associate. The Service provides tools (roles, audit logs, organization isolation); it does not perform those obligations for Customer.',
      },
      {
        type: 'h2',
        text: 'Subscriptions, plans, and fees',
      },
      { type: 'h3', text: 'Plans and prices' },
      {
        type: 'p',
        text: `The Service is sold on a subscription basis in ${CURRENCY}. Current self-serve pricing, as displayed on our public pricing page at the time of purchase, is: ${facts.pricingSentences.join(
          ' '
        )}`,
      },
      {
        type: 'p',
        text: 'Prices are exclusive of taxes unless expressly stated. The pricing page is the authoritative public statement of current pricing; where these Terms, an invoice, or a checkout screen states a different price for the same plan and interval, the price displayed at checkout for that purchase controls for that purchase.',
      },
      { type: 'h3', text: 'Billing intervals' },
      {
        type: 'p',
        text: `Subscriptions may be purchased monthly or annually. ${facts.annualSavingsSentence} Monthly subscriptions renew each month on the calendar day corresponding to the start of the billing period (or the last day of a shorter month). Annual subscriptions renew on the anniversary of the initial charge.`,
      },
      { type: 'h3', text: 'Payment authorization and processing' },
      {
        type: 'p',
        text: 'By starting a paid subscription, Customer authorizes BloomRCM and its payment processor to charge the payment method supplied, on a recurring basis, for the plan and interval selected, together with applicable taxes, until the subscription is cancelled. Payments are processed by Stripe, Inc. BloomRCM does not receive or store full payment card numbers; card data is collected and stored by Stripe under its own terms and privacy policy.',
      },
      {
        type: 'p',
        text: 'Customer is responsible for keeping a valid payment method on file and for the accuracy of billing contact information. Where the payment method expires or is declined, see Section 9 (Failed payments) and the Subscription, Billing, Refund and Cancellation Policy.',
      },
      { type: 'h3', text: 'Automatic renewal' },
      {
        type: 'p',
        text: 'SUBSCRIPTIONS RENEW AUTOMATICALLY. Unless Customer cancels before the end of the then-current billing period, the subscription renews for the same interval at the then-current price for that plan, and the payment method on file is charged. The renewal price is the price displayed on the pricing page at the time of renewal, subject to Section 10 (Price changes). Cancellation instructions are in the Subscription, Billing, Refund and Cancellation Policy.',
      },
      {
        type: 'p',
        text: 'Where required by applicable state automatic-renewal law, BloomRCM will provide renewal notices and a compliant online cancellation path, and will not treat a free trial as consent to a paid subscription unless Customer has clearly agreed to the paid terms. {{COUNSEL: confirm automatic-renewal notice and cancellation requirements for every state where customers are located}}',
      },
      { type: 'h3', text: 'Taxes' },
      {
        type: 'p',
        text: 'Fees are exclusive of all sales, use, excise, value-added, gross-receipts, and similar taxes, and of any withholding required by law, other than taxes on BloomRCM\u2019s net income. Customer is responsible for such taxes, and BloomRCM may add them to invoices where it is registered or required to collect them. If Customer claims an exemption, Customer must provide valid documentation, and the exemption applies prospectively from the date accepted.',
      },
      { type: 'h3', text: 'Enterprise and invoiced subscriptions' },
      {
        type: 'p',
        text: 'Enterprise plans are sold under a written order form, statement of work, or subscription agreement that may set custom pricing, seat or volume commitments, invoicing terms, and payment periods. If such a document conflicts with these Terms on commercial matters (price, term, quantity, payment schedule), that document controls for that subscription. All other provisions of these Terms continue to apply.',
      },
      { type: 'h3', text: 'Free trials' },
      {
        type: 'p',
        text: `Starter and Professional include a ${facts.plans.find((p) => p.slug === 'starter')?.trialDays ?? 14}-day free trial and Enterprise includes a ${facts.plans.find((p) => p.slug === 'enterprise')?.trialDays ?? 30}-day free trial. A payment method is not required to begin a trial. A trial does not convert to a paid subscription automatically: paid status begins only after Customer completes checkout and the payment processor confirms the payment. Trial length, eligibility, exclusions, and end-of-trial behavior are described in the Subscription, Billing, Refund and Cancellation Policy.`,
      },
      {
        type: 'p',
        text: 'BloomRCM may modify or end a trial early if it reasonably believes the trial is being used to obtain repeated free access, or if Customer breaches these Terms.',
      },
      {
        type: 'h2',
        text: 'Invoicing, credits, and refunds',
      },
      {
        type: 'p',
        text: 'Fees are payable in advance. Except where required by law or expressly stated in the Subscription, Billing, Refund and Cancellation Policy, fees are non-refundable and BloomRCM does not provide credits or proration for partial periods, unused seats, or periods in which Customer did not use the Service. Cancelling a subscription stops future renewals; it does not by itself entitle Customer to a refund of amounts already paid.',
      },
      {
        type: 'p',
        text: 'Where BloomRCM determines in good faith that a billing error occurred (for example a duplicate charge or a charge after a valid cancellation), BloomRCM will correct it by refund or credit. Billing questions must be raised within 60 days of the invoice date so that records can be reconciled.',
      },
      {
        type: 'h2',
        text: 'Failed payments and delinquent accounts',
      },
      {
        type: 'p',
        text: `If a renewal payment fails, the subscription enters a past-due state and a grace period of ${BILLING_IMPLEMENTATION.gracePeriodDays} days begins. During the grace period the workspace remains fully usable and BloomRCM will notify Customer\u2019s billing contact and Organization Administrators so the payment method can be corrected. If payment is not completed by the end of the grace period, the workspace becomes read-only: Customer and its Authorized Users can view and export existing records but cannot create or modify records until payment is resolved.`,
      },
      {
        type: 'p',
        text: 'BloomRCM does not delete Customer Data because a payment failed. Data retention after a lapse of payment is described in the Subscription, Billing, Refund and Cancellation Policy and the Privacy Policy.',
      },
      {
        type: 'h2',
        text: 'Price changes',
      },
      {
        type: 'p',
        text: 'BloomRCM may change subscription prices. For self-serve subscriptions, BloomRCM will give at least 30 days\u2019 advance notice by email to Organization Administrators before a price change takes effect for an existing subscription, and the new price will apply from the next renewal after the notice period. If Customer does not wish to continue at the new price, Customer may cancel before the change takes effect and will not be charged the new price.',
      },
      {
        type: 'p',
        text: 'Price changes do not apply retroactively to amounts already paid, and do not apply during a fixed term set in a written order form unless that document permits it.',
      },
      {
        type: 'h2',
        text: 'Acceptable use',
      },
      {
        type: 'p',
        text: 'Customer may use the Service only for lawful revenue-cycle, billing, and practice-administration purposes on behalf of organizations it is authorized to represent. Customer is responsible for the conduct of its Authorized Users.',
      },
      { type: 'h3', text: 'Prohibited activities' },
      {
        type: 'p',
        text: 'Customer must not, and must not permit any Authorized User or third party to:',
      },
      {
        type: 'ul',
        items: [
          'Submit data it is not authorized to submit, including PHI of patients it does not treat or bill for, or PHI obtained without a lawful basis.',
          'Access, attempt to access, or probe another customer\u2019s workspace, data, credentials, or infrastructure, or attempt to defeat organization isolation, role enforcement, or authentication.',
          'Submit false, fabricated, or altered claims, coding, or clinical documentation to a payer or into the Service, or use the Service to facilitate healthcare fraud, waste, or abuse, or any violation of the federal Anti-Kickback Statute, the Physician Self-Referral (Stark) Law, the False Claims Act, or applicable state analogues.',
          'Use the Service to contact patients for marketing without a lawful basis, or to send communications that violate HIPAA marketing rules, the Telephone Consumer Protection Act, or CAN-SPAM.',
          'Reverse engineer, decompile, disassemble, or attempt to derive source code, except to the extent a restriction is prohibited by law.',
          'Copy, frame, mirror, scrape, or resell the Service, or make it available to third parties other than Authorized Users, including as a service bureau for entities that are not Customers.',
          'Circumvent seat, practice, or claim-volume limits, usage metering, or rate limits, or use the API in a manner that materially degrades the Service for others.',
          'Introduce malware, or upload content that is unlawful, defamatory, infringing, or that contains executable code intended to disrupt the Service.',
          'Use the Service to build a competing product, or to benchmark or publish performance results without BloomRCM\u2019s prior written consent.',
          'Remove, obscure, or alter proprietary notices, or misrepresent the Service as Customer\u2019s own product.',
          'Use the Service in a way that would subject BloomRCM to a sanctions regime, export-control restriction, or criminal liability, or on behalf of a person or entity subject to U.S. sanctions.',
        ],
      },
      {
        type: 'p',
        text: 'BloomRCM may investigate suspected violations and may suspend or terminate access as described in Section 19. Where BloomRCM reasonably believes conduct may be unlawful, it may report it to appropriate authorities and cooperate with them.',
      },
      {
        type: 'h2',
        text: 'Customer Data and ownership',
      },
      {
        type: 'p',
        text: 'As between the parties, Customer owns all right, title, and interest in and to Customer Data, including all PHI contained in it. BloomRCM claims no ownership of Customer Data and will not use Customer Data for its own purposes except as permitted by these Terms, the Privacy Policy, and (where applicable) the Business Associate Agreement.',
      },
      {
        type: 'p',
        text: 'Customer grants BloomRCM a limited, non-exclusive licence to host, store, transmit, process, display, back up, and create technical copies of Customer Data solely to provide, secure, maintain, and support the Service, to prevent fraud and abuse, and to comply with law. This licence ends when Customer Data is deleted, except for residual copies in backups and records BloomRCM must retain by law.',
      },
      {
        type: 'p',
        text: 'Customer is solely responsible for the content, accuracy, completeness, and legality of Customer Data, for having the right to submit it, and for obtaining and maintaining any patient authorizations or other consents required for the uses Customer makes of it.',
      },
      {
        type: 'p',
        text: 'BloomRCM may create and use aggregated or de-identified information derived from usage of the Service (for example feature-usage statistics and error rates) to operate, secure, and improve the Service, provided that such information does not identify Customer or any individual and is not derived from PHI in a way that would permit re-identification. BloomRCM will not re-identify de-identified data and will contractually bind any recipient accordingly, consistent with 45 C.F.R. § 164.514.',
      },
      {
        type: 'h2',
        text: 'Intellectual property rights',
      },
      {
        type: 'p',
        text: 'The Service, including its software, source code, user interface, design system, documentation, workflows, and all improvements to them, is and remains the exclusive property of BloomRCM and its licensors, protected by copyright, trade secret, and other laws. BloomRCM reserves all rights not expressly granted in these Terms.',
      },
      {
        type: 'p',
        text: 'The BloomRCM and BloomAR Manager names, logos, and product marks are trademarks of BloomRCM. Customer receives no right to use them except to identify BloomRCM as Customer\u2019s service provider with BloomRCM\u2019s prior written consent, or as required by law.',
      },
      {
        type: 'p',
        text: 'If Customer provides feedback, suggestions, or feature requests, BloomRCM may use them without restriction or obligation, provided BloomRCM does not disclose Customer as the source without permission. Third-party code sets and reference data embedded in the Service (including ICD-10-CM, CPT, and HCPCS-derived reference material and CARC/RARC code descriptions) remain subject to their own terms and, where applicable, third-party licensing; Customer\u2019s use of them through the Service is limited to the internal purposes of the Service.',
      },
      {
        type: 'h2',
        text: 'Confidentiality',
      },
      {
        type: 'p',
        text: 'Each party may receive information that the other treats as confidential ("**Confidential Information**"). Confidential Information includes non-public business, technical, financial, security, and product information, the terms of any order form, and Customer Data. It does not include information that the recipient can demonstrate was already known to it without a duty of confidence, is or becomes public through no breach, is received from a third party without a duty of confidence, or is independently developed without use of the discloser\u2019s Confidential Information.',
      },
      {
        type: 'p',
        text: 'The recipient will use Confidential Information only to perform its obligations and exercise its rights under these Terms, will protect it with at least reasonable care (and, for PHI, with the safeguards required by the Business Associate Agreement), and will disclose it only to personnel and contractors who need it and are bound by confidentiality obligations at least as protective as this Section.',
      },
      {
        type: 'p',
        text: 'If the recipient is compelled by law, regulation, or valid legal process to disclose Confidential Information, it will, where legally permitted, give the discloser prompt notice so the discloser may seek protective treatment, and will disclose only what is legally required. These obligations survive termination for five years, and indefinitely for trade secrets, credentials, and PHI.',
      },
      {
        type: 'h2',
        text: 'Data security responsibilities',
      },
      {
        type: 'p',
        text: 'BloomRCM will maintain a security program with administrative, technical, and physical safeguards appropriate to the sensitivity of Customer Data, designed to protect its confidentiality, integrity, and availability. The technical controls implemented in the Service, and the controls that depend on Customer or its hosting and infrastructure providers, are described factually in the Privacy Policy and the Data Processing Agreement. BloomRCM will not describe itself as "HIPAA compliant," "HIPAA certified," or "SOC 2 certified" unless and until it holds the specific attestation or certification named.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'No certification is claimed by this agreement',
        text:
          'HIPAA does not provide a general government certification for software products, and the existence of these Terms, a Data Processing Agreement, or a Business Associate Agreement is not evidence that BloomRCM has completed a HIPAA security risk analysis, achieved compliance, or obtained any third-party audit. BloomRCM\u2019s current certifications and audit reports, if any, are stated only where expressly listed on the public website.',
      },
      {
        type: 'p',
        text: 'Customer is responsible for its own safeguards, including: controlling who receives access and at what role; protecting endpoints, networks, and credentials used to reach the Service; enabling multi-factor authentication for users who handle PHI; configuring session and inactivity settings appropriate to its policies; monitoring its audit logs; and maintaining its own policies, training, sanctions, contingency plan, and security risk analysis as required by the HIPAA Security Rule.',
      },
      {
        type: 'p',
        text: 'BloomRCM will notify Customer of a confirmed security incident or breach of unsecured PHI without unreasonable delay and in accordance with the notification provisions of the Business Associate Agreement and applicable law. Notification will describe what is known at the time and will be supplemented as the investigation progresses.',
      },
      {
        type: 'h2',
        text: 'Healthcare customer responsibilities and HIPAA',
      },
      {
        type: 'p',
        text: 'Customer acknowledges that, in most deployments, Customer is a covered entity or a business associate under HIPAA and is responsible for its own compliance program. Customer is responsible for:',
      },
      {
        type: 'ul',
        items: [
          'Determining whether the data it submits is PHI and whether a Business Associate Agreement is required before submission.',
          'Executing a Business Associate Agreement with BloomRCM before submitting PHI. Where no BAA has been executed, Customer must not submit PHI, and BloomRCM is not acting as a business associate with respect to that data.',
          'Ensuring its notices of privacy practices, patient authorizations, and business associate arrangements with its own clients and subcontractors are accurate and current.',
          'Using the Service consistently with the HIPAA Privacy Rule\u2019s minimum-necessary standard, and not submitting more PHI than the workflow requires (for example, avoid free-text fields containing unnecessary clinical detail).',
          'Maintaining its own breach notification obligations to individuals, HHS, and the media, and notifying BloomRCM promptly of any suspected incident affecting data it submitted.',
          'Complying with payer requirements, coding rules, and state licensing and billing rules applicable to its business.',
        ],
      },
      {
        type: 'p',
        text: 'Where BloomRCM creates, receives, maintains, or transmits PHI on Customer\u2019s behalf, BloomRCM acts as a business associate and the parties\u2019 respective obligations are set out in the Business Associate Agreement, which is incorporated into these Terms when executed. If the BAA and these Terms conflict regarding PHI, the BAA controls. The Data Processing Agreement governs personal data that is not PHI.',
      },
      {
        type: 'h2',
        text: 'Third-party services and integrations',
      },
      {
        type: 'p',
        text: 'The Service relies on third-party providers for hosting, database, email delivery, and payment processing, and may interoperate with Customer-configured features such as custom domains. Those providers are described in the Privacy Policy and the Data Processing Agreement. BloomRCM is responsible for its own selection and oversight of subprocessors, but is not responsible for the acts, omissions, availability, or terms of third-party services that Customer chooses to use independently, or for third-party services that Customer integrates with outside the Service.',
      },
      {
        type: 'p',
        text: 'If Customer enables a custom domain, Customer is responsible for owning and controlling that domain and for the DNS and hosting configuration on its side. BloomRCM does not warrant that a domain will be issued a certificate or become reachable, and the Service will report configuration status honestly rather than assume success.',
      },
      {
        type: 'h2',
        text: 'Service availability and maintenance',
      },
      {
        type: 'p',
        text: 'BloomRCM will use commercially reasonable efforts to make the Service available, and may perform scheduled maintenance, emergency maintenance, and deploy updates. BloomRCM does not promise uninterrupted or error-free operation, and does not warrant any specific uptime percentage, recovery time objective, or service credit unless a separate written service-level agreement signed by BloomRCM says so. No service-level commitment is created by marketing material, a status page, or these Terms.',
      },
      {
        type: 'p',
        text: 'BloomRCM may modify, add, or remove features. BloomRCM will not materially reduce the core functionality of a paid plan during a paid term without notice, but may change non-essential features, user interface, and integrations at any time. Features described as planned or on a roadmap are not commitments and may never be released.',
      },
      {
        type: 'h2',
        text: 'Suspension and termination',
      },
      { type: 'h3', text: 'Termination by Customer' },
      {
        type: 'p',
        text: 'Customer may cancel its subscription at any time from Billing settings, or by contacting [[SUPPORT_EMAIL]]. Cancellation takes effect at the end of the current billing period, and access continues until then, except where a shorter period is required by law or where Customer asks us to close the account and delete its data under Section 20.',
      },
      { type: 'h3', text: 'Termination or suspension by BloomRCM' },
      {
        type: 'p',
        text: 'BloomRCM may suspend or terminate access immediately, in whole or in part, if: (a) Customer materially breaches these Terms, the Business Associate Agreement, or the Data Processing Agreement and does not cure within 10 days of notice, except that no cure period applies to a breach that creates an immediate risk to the security or integrity of the Service or to other customers\u2019 data; (b) Customer fails to pay undisputed fees and remains in default after the grace period described in Section 9; (c) BloomRCM is required to do so by law, court order, or a regulator; (d) continuing to provide the Service would create a material legal, sanctions, or security risk; or (e) Customer becomes insolvent or ceases operations.',
      },
      {
        type: 'p',
        text: 'BloomRCM may also suspend access on a temporary basis to address a security emergency, to prevent ongoing abuse, or to comply with a lawful request, and will restore access as soon as the reason for suspension is resolved. Where reasonably practicable, BloomRCM will give notice before a suspension and will limit the suspension to the affected part of the Service.',
      },
      {
        type: 'p',
        text: 'BloomRCM may terminate a free trial at any time without liability, and may close an account that remains unpaid and inactive for an extended period after notice.',
      },
      { type: 'h3', text: 'Effect of termination' },
      {
        type: 'p',
        text: 'On termination, the licence in Section 4 ends, and Customer must stop using the Service. Sections that by their nature should survive (including Sections 12, 13, 14, 21, 22, 23, 24, 25, and 26) survive termination.',
      },
      {
        type: 'h2',
        text: 'Data export and deletion after termination',
      },
      {
        type: 'p',
        text: 'For 30 days after a subscription ends or an account is closed (the "**Export Window**"), Customer may restore access by renewing, or may request an export of Customer Data by contacting [[SUPPORT_EMAIL]]. The Service provides self-serve CSV and Excel exports for many record types while access is available; a full export of all Customer Data may require operator assistance.',
      },
      {
        type: 'p',
        text: 'After the Export Window, BloomRCM may delete Customer Data from live systems. Backup copies are retained only for the period described in the Privacy Policy and are deleted on the normal backup rotation. BloomRCM may retain Customer Data for longer where required by law, for audit and financial records, to resolve a dispute, or to enforce these Terms, and will retain PHI only as permitted by the Business Associate Agreement.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Export before you cancel',
        text:
          'BloomRCM does not currently run an automated archival-purge job. That does not make deletion automatic or guaranteed; it means that deletion requests are executed through documented operator procedure. Customer is responsible for exporting records it needs to retain, including any records it must keep under 45 C.F.R. § 164.530(j) or applicable state medical-record and billing-record retention rules, before the Export Window closes.',
      },
      {
        type: 'h2',
        text: 'Warranties and disclaimers',
      },
      {
        type: 'p',
        text: 'BloomRCM warrants that: (a) it will provide the Service in a professional and workmanlike manner consistent with generally accepted industry standards; (b) the Service will materially perform the functions described in its public documentation; and (c) BloomRCM will not knowingly introduce into the Service any malicious code. Customer\u2019s exclusive remedy for breach of these warranties is re-performance of the deficient Service or, if BloomRCM cannot correct it within a reasonable time, termination of the affected subscription and a refund of prepaid fees for the unused portion.',
      },
      {
        type: 'callout',
        tone: 'legal',
        title: 'Disclaimer',
        text:
          'EXCEPT FOR THE EXPRESS WARRANTIES IN THIS SECTION, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," AND BLOOMAR DISCLAIMS ALL OTHER WARRANTIES, EXPRESS, IMPLIED, AND STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT, AND ANY WARRANTY ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. BLOOMAR DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, THAT THE SERVICE WILL BE COMPATIBLE WITH ANY PAYER OR CLEARINGHOUSE SYSTEM, THAT ANY CLAIM WILL BE ACCEPTED OR PAID, OR THAT ANY DENIAL WILL BE RECOVERED.',
      },
      {
        type: 'p',
        text: 'Some jurisdictions do not allow the exclusion of certain warranties, so some of the above may not apply to Customer. Nothing in this Section limits a warranty that cannot lawfully be excluded.',
      },
      {
        type: 'h2',
        text: 'Limitation of liability',
      },
      {
        type: 'p',
        text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY IS LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST CLAIM RECOVERY, BUSINESS INTERRUPTION, OR LOSS OR CORRUPTION OF DATA, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND EVEN IF A LIMITED REMEDY FAILS OF ITS ESSENTIAL PURPOSE.',
      },
      {
        type: 'p',
        text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, EACH PARTY\u2019S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS IS LIMITED TO THE FEES PAID OR PAYABLE BY CUSTOMER FOR THE SERVICE IN THE TWELVE MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM (OR, FOR A FREE TRIAL, ONE HUNDRED U.S. DOLLARS).',
      },
      {
        type: 'p',
        text: 'The limitations in this Section do not apply to: (a) a party\u2019s indemnification obligations under Section 23; (b) Customer\u2019s payment obligations for fees properly due; (c) a party\u2019s breach of the other\u2019s intellectual property rights; (d) a party\u2019s gross negligence, willful misconduct, or fraud; or (e) any liability that cannot be limited under applicable law, including liability for a breach of unsecured PHI to the extent such limitation is prohibited by HIPAA or state law.',
      },
      {
        type: 'p',
        text: 'The parties agree that the limitations in this Section reflect an allocation of risk reflected in the fees charged and are a material basis of the bargain.',
      },
      {
        type: 'h2',
        text: 'Indemnification',
      },
      { type: 'h3', text: 'Indemnification by BloomRCM' },
      {
        type: 'p',
        text: 'BloomRCM will defend Customer against any third-party claim alleging that the Service, as provided by BloomRCM and used in accordance with these Terms, infringes or misappropriates that third party\u2019s United States patent, copyright, or trade secret, and will pay damages and costs finally awarded or agreed in settlement. If such a claim is made or likely, BloomRCM may, at its option, procure the right for Customer to continue using the Service, modify the Service so it is non-infringing while materially retaining functionality, or terminate the affected subscription and refund prepaid fees for the unused portion. This Section does not apply to claims arising from Customer Data, Customer\u2019s modifications, use outside the documented scope, or combination with products not supplied by BloomRCM.',
      },
      { type: 'h3', text: 'Indemnification by Customer' },
      {
        type: 'p',
        text: 'Customer will defend BloomRCM against any third-party claim arising out of or relating to: (a) Customer Data, including claims by patients, payers, providers, or Customer\u2019s own clients concerning the content, accuracy, use, or disclosure of that data; (b) Customer\u2019s billing, coding, collection, or clinical practices, or its submissions to any payer; (c) Customer\u2019s failure to obtain required authorizations, consents, or a Business Associate Agreement before submitting PHI; (d) Customer\u2019s violation of HIPAA or other applicable law; or (e) Customer\u2019s breach of Section 11 (Acceptable use); and will pay damages and costs finally awarded or agreed in settlement.',
      },
      { type: 'h3', text: 'Indemnification procedure' },
      {
        type: 'p',
        text: 'The indemnified party must notify the indemnifying party promptly in writing, allow it to control the defense and settlement, and provide reasonable cooperation at the indemnifying party\u2019s expense. The indemnifying party may not settle a claim in a way that admits fault by, or imposes a non-monetary obligation on, the indemnified party without its written consent, which will not be unreasonably withheld.',
      },
      {
        type: 'h2',
        text: 'Dispute resolution',
      },
      {
        type: 'p',
        text: 'The parties will first attempt to resolve any dispute arising out of or relating to these Terms through good-faith negotiation. A party must send written notice of the dispute describing the issue and the relief sought to the other party\u2019s legal notice address, and the parties will confer (by videoconference if requested) within 30 days of that notice. Either party may then commence proceedings as described below.',
      },
      {
        type: 'p',
        text: 'Except for claims that qualify for small-claims court, claims for injunctive relief to protect intellectual property or data security, and claims to collect undisputed fees, any dispute that is not resolved by negotiation will be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, before a single arbitrator seated in [[VENUE_COUNTY]], [[GOVERNING_STATE]], in English, applying the governing law in Section 25. The arbitrator may award any relief a court could award, and judgment on the award may be entered in any court of competent jurisdiction.',
      },
      {
        type: 'p',
        text: 'Each party waives any right to a jury trial and any right to bring or participate in a class, collective, or representative action, to the maximum extent permitted by law. Either party may bring an individual action in small-claims court if the claim qualifies. Customer may opt out of arbitration by sending written notice to [[LEGAL_NOTICES_EMAIL]] within 30 days after first accepting these Terms; opting out does not affect any other provision.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Counsel decision required: arbitration and venue',
        text:
          'The arbitration clause, class-action waiver, jury waiver, and venue above are a common United States commercial default, not legal advice. Enforceability varies by state and by customer type, and certain healthcare, government, and public-entity customers cannot agree to arbitration. {{COUNSEL: confirm the enforceability of the arbitration clause, class-action waiver, jury waiver and venue, and decide whether a carve-out for public entities and for injunctive relief is needed, before these Terms are published}}',
      },
      {
        type: 'h2',
        text: 'Governing law and jurisdiction',
      },
      {
        type: 'p',
        text: 'These Terms are governed by the laws of the State of [[GOVERNING_STATE]], without regard to its conflict-of-laws rules, and by applicable United States federal law. The United Nations Convention on Contracts for the International Sale of Goods does not apply. Subject to Section 24, the state and federal courts located in [[VENUE_COUNTY]], [[GOVERNING_STATE]] have exclusive jurisdiction over any proceeding not subject to arbitration, and each party consents to personal jurisdiction there.',
      },
      {
        type: 'p',
        text: 'Nothing in this Section prevents either party from seeking injunctive relief in any court of competent jurisdiction, or prevents BloomRCM from seeking to enforce a judgment in any jurisdiction where Customer has assets.',
      },
      {
        type: 'h2',
        text: 'General provisions',
      },
      { type: 'h3', text: 'Entire agreement' },
      {
        type: 'p',
        text: 'These Terms, together with the Privacy Policy, the Subscription, Billing, Refund and Cancellation Policy, the Cookie Policy, any executed Business Associate Agreement, any executed Data Processing Agreement, and any written order form or subscription agreement, constitute the entire agreement between the parties regarding the Service and supersede all prior proposals, understandings, and communications. In the event of conflict, the order of precedence is: (1) an executed Business Associate Agreement, for PHI; (2) an executed Data Processing Agreement, for personal data that is not PHI; (3) a written order form or subscription agreement, for commercial terms; (4) these Terms; (5) the Subscription, Billing, Refund and Cancellation Policy; (6) the Privacy Policy; (7) the Cookie Policy; (8) public marketing pages and documentation.',
      },
      { type: 'h3', text: 'Severability' },
      {
        type: 'p',
        text: 'If any provision of these Terms is held invalid, illegal, or unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable while preserving its intent, or if modification is not possible, severed, and the remaining provisions will remain in full force and effect.',
      },
      { type: 'h3', text: 'Waiver and cumulative remedies' },
      {
        type: 'p',
        text: 'A party\u2019s failure to exercise or delay in exercising a right is not a waiver of that right. A waiver is effective only if in writing and signed by the waiving party. Except as expressly stated, remedies are cumulative and not exclusive.',
      },
      { type: 'h3', text: 'Assignment' },
      {
        type: 'p',
        text: 'Neither party may assign these Terms without the other\u2019s prior written consent, except that either party may assign them without consent to a successor in connection with a merger, acquisition, reorganization, or sale of substantially all of its assets, provided the assignee assumes all obligations. Any purported assignment in violation of this Section is void. These Terms bind and benefit the parties\u2019 permitted successors and assigns.',
      },
      { type: 'h3', text: 'Notices' },
      {
        type: 'p',
        text: `Legal notices to BloomRCM must be sent in writing to ${entityFullName(
          E
        )}, Attn: Legal, [[LEGAL_ADDRESS_LINE1]], [[LEGAL_CITY]], [[LEGAL_REGION]] [[LEGAL_POSTAL_CODE]], United States, with a copy by email to [[LEGAL_NOTICES_EMAIL]]. Notices to Customer may be sent to the email address of the Organization Administrator on record, or posted in the Service, and are effective when sent. Operational notices (maintenance, security, billing) may be sent by email to the Customer\u2019s administrative contacts.`,
      },
      { type: 'h3', text: 'Force majeure' },
      {
        type: 'p',
        text: 'Neither party is liable for a failure or delay caused by events beyond its reasonable control, including acts of God, natural disaster, epidemic, war, terrorism, civil disturbance, labor action, government action, failure of third-party infrastructure or internet providers, or a widespread cybersecurity incident not caused by the affected party\u2019s failure to maintain reasonable safeguards. The affected party will notify the other and use reasonable efforts to resume performance.',
      },
      { type: 'h3', text: 'Independent contractors' },
      {
        type: 'p',
        text: 'The parties are independent contractors. Nothing in these Terms creates a partnership, joint venture, agency, franchise, or employment relationship, and neither party has authority to bind the other.',
      },
      { type: 'h3', text: 'No third-party beneficiaries' },
      {
        type: 'p',
        text: 'Except for the parties\u2019 respective affiliates, licensors, and indemnitees as expressly provided, there are no third-party beneficiaries to these Terms. Nothing in these Terms confers rights on any patient or other individual.',
      },
      { type: 'h3', text: 'U.S. government end users' },
      {
        type: 'p',
        text: 'The Service is a "commercial product" and "commercial computer software" as those terms are used in 48 C.F.R. § 2.101. Government end users acquire only the rights granted in these Terms. Where Customer is a public entity subject to state procurement, contracting, or immunity rules, the parties will negotiate a mutually acceptable addendum before service begins.',
      },
      { type: 'h3', text: 'Changes to these Terms' },
      {
        type: 'p',
        text: 'BloomRCM may update these Terms to reflect changes in the Service, the law, or its practices. Material changes will be announced by email to Organization Administrators and by updating the "Last updated" date at the top of this document, with at least 30 days\u2019 notice where the change materially adversely affects Customer. Changes apply from the effective date stated in the notice; if Customer does not agree, Customer may cancel before the change takes effect. Changes required by law may take effect immediately.',
      },
      { type: 'h3', text: 'Language and interpretation' },
      {
        type: 'p',
        text: 'These Terms are written in English, and English is the controlling language. Headings are for convenience only and do not affect interpretation. "Including" means "including without limitation." References to statutes include their implementing regulations and any successor provisions.',
      },
      {
        type: 'h2',
        text: 'Contact information',
      },
      {
        type: 'p',
        text: 'Questions about these Terms, notices, and legal service may be directed to:',
      },
      {
        type: 'address',
        lines: [
          `${entityFullName(E)}`,
          'Attn: Legal',
          '[[LEGAL_ADDRESS_LINE1]]',
          '[[LEGAL_ADDRESS_LINE2]]',
          '[[LEGAL_CITY]], [[LEGAL_REGION]] [[LEGAL_POSTAL_CODE]]',
          'United States',
          'Email: [[LEGAL_NOTICES_EMAIL]]',
          'Support: [[SUPPORT_EMAIL]]',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Document status',
        text:
          'Version 1.0. Effective and last-updated dates are placeholders until the document is published. This document is complete and intended for use, but it has not been reviewed by licensed counsel in the governing jurisdiction; that review is an outstanding pre-launch requirement.',
      },
    ],
  };
}
