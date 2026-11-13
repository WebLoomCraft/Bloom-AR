import type { LegalDocument } from './types.ts';
import { LEGAL_ENTITY, entityFullName, postalAddressLines } from './entity.ts';

const E = LEGAL_ENTITY;

export function privacyDocument(): LegalDocument {
  return {
    slug: 'privacy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    summary:
      'What BloomAR collects, why, how long it keeps it, who it shares it with, and what rights you have — including how PHI is handled under a BAA.',
    effectiveDate: '[[EFFECTIVE_DATE]]',
    lastUpdated: '[[LAST_UPDATED_DATE]]',
    version: '1.0',
    appliesTo:
      'Visitors to bloomar.com-style public pages, account holders, Authorized Users, and individuals whose information is submitted by a customer organization.',
    related: ['terms', 'cookies', 'dpa', 'baa', 'subscription'],
    blocks: [
      {
        type: 'callout',
        tone: 'warn',
        title: 'Before publication: business information still required',
        text:
          'Bracketed items must be supplied by the operating business before this policy is published. Privacy-related facts that BloomAR has not verified (such as specific retention periods for every record type and the final subprocessor list) are stated conservatively and flagged where they need confirmation.',
      },
      {
        type: 'p',
        text: `${entityFullName(
          E
        )} ("**BloomAR**," "**we**," "**us**") operates the BloomAR Manager platform, a subscription software service for medical billing and accounts-receivable management. This Privacy Policy explains what information we collect through our public website and the Service, how we use and share it, how long we keep it, and the choices and rights available to you.`,
      },
      {
        type: 'p',
        text: 'Residents of California and other states with comprehensive privacy laws should read Section 7, which explains your specific rights and how to exercise them.',
      },
      { type: 'h2', text: 'Two different roles: our own data vs. customer data' },
      {
        type: 'p',
        text: 'It is important to distinguish two very different kinds of information, because different rules apply to each.',
      },
      {
        type: 'dl',
        items: [
          {
            term: '1. Information we control as a business',
            def: 'Information about you as a website visitor, prospect, account holder, or billing contact — your name, work email, organization, sign-in data, billing details, and how you use the Service. BloomAR decides why and how this information is processed. This policy governs it directly.',
          },
          {
            term: '2. Customer Data we process on behalf of a healthcare organization',
            def: 'Data a customer organization and its Authorized Users put into the Service — claims, patient and subscriber identifiers, payer data, charges and payments, remittance files, notes, and uploaded documents. BloomAR processes this data as a service provider / business associate on the customer\u2019s instructions. The customer decides what is collected and why. If you are a patient, the healthcare organization that submitted your information is the party responsible for it, and you should direct requests to them.',
          },
          {
            term: '3. PHI processed under a Business Associate Agreement',
            def: 'Where Customer Data includes Protected Health Information, BloomAR processes it as a business associate under an executed HIPAA Business Associate Agreement, not as an ordinary consumer-data controller. PHI is not used for marketing, advertising, or analytics, and is never sold.',
          },
        ],
      },
      {
        type: 'h2', 
        text: 'Information we collect',
      },
      { type: 'h3', text: 'Information you give us' },
      {
        type: 'ul',
        items: [
          '**Account information:** first and last name, work email address, password (stored only as a one-way bcrypt hash — we never store the password itself), and account status.',
          '**Organization information:** organization or practice name, organization type, country, time zone, custom domain names you register, and workspace settings.',
          '**Billing and subscription information:** plan, billing interval, subscription status, trial dates, invoice history, and the identifiers our payment processor returns to us. Full payment card numbers, CVCs, and expiry dates are collected and stored by Stripe, Inc., not by BloomAR.',
          '**Contact and lead information:** when you submit a demo, sales, or contact request, we collect your name, work email, organization, optional phone number, and the message you send, plus the request type.',
          '**Communications:** the content of support requests, security reports, and correspondence with us.',
          '**Authentication and security data:** multi-factor authentication enrollment state and encrypted authenticator secrets, hashed recovery codes, session records (including IP address and browser user-agent), and verification/reset tokens (stored hashed).',
          '**Content you upload:** files and text you or your Authorized Users add to the Service, which for healthcare customers may include PHI.',
        ],
      },
      { type: 'h3', text: 'Information collected automatically' },
      {
        type: 'ul',
        items: [
          '**Usage information:** pages and features used, actions taken, workflow state changes, and records created or modified — much of which is recorded in the organization-scoped audit log.',
          '**Device and connection information:** IP address, browser type and version, operating system, referring URL, and timestamps.',
          '**Session identifiers:** our authentication cookie and tokens, described in the Cookie Policy.',
          '**Technical logs:** server errors, request identifiers, and performance traces. Our hosting platform also collects aggregate real-user performance measurements (see the Cookie Policy).',
          '**Local device storage:** your accessibility preferences and session-security preferences are stored in your browser\u2019s local storage, on your device, and are not transmitted to us as preference data.',
        ],
      },
      { type: 'h3', text: 'Information we do not collect or want' },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Do not submit unnecessary sensitive data',
        text:
          'The Service does not require Social Security numbers, full dates of birth beyond what a payer workflow needs, full clinical records, or financial account numbers, and we ask customers not to put them in free-text fields. Where such information is submitted anyway, it is treated as Customer Data under the customer\u2019s agreement and, if it is PHI, under the Business Associate Agreement. BloomAR does not knowingly collect information from children under 16 (see Section 13).',
      },
      {
        type: 'h2',
        text: 'How we use information',
      },
      {
        type: 'p',
        text: 'We use the information described above for the following purposes, and we do not use it for materially different purposes without notice:',
      },
      {
        type: 'table',
        caption: 'Purposes of processing, by legal basis',
        headers: ['Purpose', 'What it involves', 'Applies to'],
        rows: [
          [
            'Providing the Service',
            'Creating and securing accounts, authenticating users, enforcing organization isolation and role permissions, storing and displaying records, running workflows, generating reports, and processing exports.',
            'Account data, Organization data, Customer Data',
          ],
          [
            'Billing and accounting',
            'Processing subscription payments, generating invoices and receipts, managing trials and renewals, handling failed payments and disputes, and keeping financial records.',
            'Billing data, account data',
          ],
          [
            'Security and abuse prevention',
            'Rate limiting, detecting credential-stuffing and anomalous sign-ins, investigating suspicious activity, maintaining audit trails, and responding to incidents.',
            'Authentication data, usage data, technical logs',
          ],
          [
            'Support and customer communication',
            'Answering questions, troubleshooting, sending service notices (verification, password reset, invitations, billing, security, maintenance), and following up on demos and sales requests.',
            'Contact data, communications',
          ],
          [
            'Product operation and improvement',
            'Understanding feature usage in aggregate, measuring performance and error rates, and improving usability and reliability. Aggregate reporting does not identify any customer or patient.',
            'Usage data, technical logs',
          ],
          [
            'Legal and compliance',
            'Complying with tax, accounting, and healthcare-privacy obligations; responding to lawful requests; enforcing our agreements; establishing or defending legal claims.',
            'All categories as necessary',
          ],
          [
            'Marketing (limited)',
            'Sending occasional product and company updates to business contacts who have not opted out. Marketing emails never contain PHI and are separate from transactional email.',
            'Business contact data only',
          ],
        ],
      },
      {
        type: 'p',
        text: 'We do not use Customer Data or PHI to train advertising models, to build marketing profiles, or to target advertising. We do not use PHI for our own commercial purposes.',
      },
      {
        type: 'h2',
        text: 'What we do not do',
      },
      {
        type: 'ul',
        items: [
          'We do not sell personal information or PHI for money or other valuable consideration, and we do not share it for cross-context behavioral advertising. If our practices change, we will update this policy and, where required, obtain consent and offer an opt-out before the change takes effect.',
          'We do not place PHI, patient names, member identifiers, claim or charge details, or any Customer Data into advertising or analytics tracking systems.',
          'We do not use third-party advertising pixels, retargeting tags, or session-replay tools on the Service or on signed-in pages.',
          'We do not allow our service providers to use Customer Data for their own purposes.',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Why we phrase this narrowly',
        text:
          'We state that we do not sell data because the Service as currently implemented has no advertising, data-broker, or cross-context behavioral advertising integrations. Any future introduction of such a tool would require this section to be rewritten and, in several states, an opt-out and consent mechanism added before launch of the feature.',
      },
      {
        type: 'h2',
        text: 'How we share information',
      },
      { type: 'h3', text: 'Service providers and subprocessors' },
      {
        type: 'p',
        text: 'We share information with vendors that process it on our behalf under written contracts that restrict their use of it. The categories currently used to operate the Service are:',
      },
      {
        type: 'table',
        caption: 'Subprocessor categories',
        headers: ['Category', 'Purpose', 'Data involved'],
        rows: [
          ['Cloud hosting and edge platform', 'Serving the application and running server-side functions', 'All data transmitted through the Service, technical logs'],
          ['Managed PostgreSQL database provider', 'Primary data storage, backups, point-in-time recovery', 'All stored data including Customer Data'],
          ['Payment processor (Stripe)', 'Subscription billing, invoicing, receipts, tax calculation if enabled, fraud signals', 'Billing contact, payment method, invoice data. Never PHI.'],
          ['Transactional email provider (SMTP)', 'Delivering verification, password reset, invitation, billing, and notification email', 'Email addresses and message content; message bodies are designed to avoid PHI'],
          ['Performance monitoring', 'Aggregate real-user performance measurement on public pages', 'Page timing and route data, connection metadata. No Customer Data.'],
        ],
      },
      {
        type: 'p',
        text: 'The current named list of subprocessors, with processing locations, is maintained in the Data Processing Agreement. We will give customers advance notice of a new subprocessor that will process Customer Data, as described in the Data Processing Agreement, and customers may object on the grounds set out there.',
      },
      { type: 'h3', text: 'Other disclosures' },
      {
        type: 'ul',
        items: [
          '**At your direction.** When you ask us to, for example when you enable a domain or request an export.',
          '**Within your organization.** Organization Administrators can see member lists, roles, and workspace activity. The audit log records actions taken by Authorized Users and is visible to administrators of that organization.',
          '**Legal requirements.** When we believe in good faith that disclosure is required by law, regulation, subpoena, court order, or a lawful request from a government authority; to protect the rights, safety, or security of any person; to investigate fraud or abuse; or to enforce our agreements. Where legally permitted, we will notify the affected customer before producing Customer Data so it may seek protective treatment.',
          '**Business transactions.** In connection with a merger, acquisition, financing, reorganization, or sale of assets, information may be transferred as part of that transaction, subject to this policy and to confidentiality obligations. PHI would transfer only to a successor willing to accept the obligations of the Business Associate Agreement, and we will notify customers as required by the BAA and applicable law.',
          '**With consent.** In any other case, with your consent.',
        ],
      },
      {
        type: 'h2',
        text: 'Legal compliance framework',
      },
      {
        type: 'p',
        text: 'BloomAR is a United States company serving United States healthcare organizations. The following legal frameworks are relevant to how we handle information.',
      },
      { type: 'h3', text: 'HIPAA Privacy Rule (45 C.F.R. Part 160 and Subparts A and E of Part 164)' },
      {
        type: 'p',
        text: 'When we act as a business associate, we use and disclose PHI only as permitted by the Business Associate Agreement and the Privacy Rule: to perform our obligations to the covered entity, as required by law, for our own proper management and administration (subject to the conditions in 45 C.F.R. § 164.504(e)(4)), and to carry out our legal responsibilities. We apply the minimum-necessary standard to our internal access and to any disclosure we make. We do not use or disclose PHI for marketing or fundraising, and we do not sell PHI. We require our subcontractors that handle PHI to agree to equivalent restrictions.',
      },
      {
        type: 'p',
        text: 'If you are a patient and want to access, amend, or receive an accounting of disclosures of your information, please contact the healthcare organization that submitted it. We will assist our customers in responding to those requests as required by the BAA.',
      },
      { type: 'h3', text: 'HIPAA Security Rule (45 C.F.R. Part 160 and Subpart C of Part 164)' },
      {
        type: 'p',
        text: 'We maintain administrative, physical, and technical safeguards designed to protect ePHI, described in Section 10 and in the Data Processing Agreement. BloomAR does not claim a HIPAA certification or accreditation, because HIPAA does not issue one for software products. Our safeguards are supported by documented policies and controls, and customers remain responsible for their own security risk analysis and compliance program.',
      },
      { type: 'h3', text: 'HIPAA Breach Notification Rule (45 C.F.R. Part 164 Subpart D)' },
      {
        type: 'p',
        text: 'If we discover a breach of unsecured PHI, we notify the affected customer without unreasonable delay and in no case later than 60 days after discovery, consistent with 45 C.F.R. § 164.410, and we provide the information the customer needs to meet its own notification duties to individuals, HHS, and the media. We also report security incidents that do not rise to the level of a breach, as described in the BAA. The customer is responsible for notifying affected individuals and HHS.',
      },
      { type: 'h3', text: 'California Consumer Privacy Act and California Privacy Rights Act (as amended by the CPRA)' },
      {
        type: 'p',
        text: 'The CCPA/CPRA applies to for-profit businesses meeting certain thresholds and gives California residents specific rights. Because BloomAR sells subscriptions to organizations, most information we hold about you is business-to-business contact information or information we process on behalf of a customer. Where the CCPA/CPRA applies, we act as a "business" for the information described in Section 1, role 1, and as a "service provider" for Customer Data described in role 2, in which case the customer is the "business" and you should direct requests to them. The rights and categories in Sections 7 and 8 apply to California residents where the law applies.',
      },
      { type: 'h3', text: 'Other state comprehensive privacy laws' },
      {
        type: 'p',
        text: 'Several states — including Colorado, Connecticut, Delaware, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, and Virginia, with more taking effect over time — have enacted comprehensive privacy laws. Where BloomAR is subject to one of these laws and acts as a controller, we honor the corresponding rights and our obligations as a processor for Customer Data. We do not use sensitive data for purposes requiring an opt-in beyond providing the Service. {{COUNSEL: confirm which state comprehensive privacy laws apply to BloomAR, whether any applicability threshold is met, and whether the business-to-business exemption changes the rights that must be offered}}',
      },
      { type: 'h3', text: 'State data breach notification laws' },
      {
        type: 'p',
        text: 'All 50 states, the District of Columbia, and several territories have breach notification statutes with different definitions, thresholds, timing, and regulator-notification requirements. Our internal incident procedure is designed to identify the jurisdictions involved, notify affected customers promptly, and meet the shortest applicable deadline. Where we are the party required to notify individuals directly under a state law, we will do so; otherwise we will give customers the information they need to notify.',
      },
      { type: 'h3', text: 'CAN-SPAM Act' },
      {
        type: 'p',
        text: 'Commercial email we send complies with the CAN-SPAM Act: messages identify BloomAR as the sender, include a valid physical postal address, use accurate subject lines, and include a working one-click unsubscribe that we honor within 10 business days. Transactional and relationship messages (verification, password reset, invitations, invoices, security alerts, and service notices) are not commercial email and are not subject to unsubscribe requests, because they are necessary to operate the account.',
      },
      { type: 'h3', text: 'Other laws we account for' },
      {
        type: 'ul',
        items: [
          '**Telephone Consumer Protection Act (TCPA):** we do not send marketing text messages. If we ever introduce SMS, we will obtain prior express written consent and honor opt-outs.',
          '**Anti-Kickback Statute, Stark Law, and False Claims Act:** these govern customer billing conduct, not our data practices, but they inform the acceptable-use restrictions in our Terms of Service.',
          '**42 C.F.R. Part 2:** if a customer is a federally assisted substance use disorder program, additional restrictions apply to that data. Customers must tell us before submitting Part 2 data so appropriate arrangements can be made; the Service alone does not implement Part 2 consent-management rules.',
          '**State medical-record laws:** customers are responsible for retention periods imposed on medical records in their states. BloomAR\u2019s retention schedule in Section 9 is a platform default, not a substitute for those obligations.',
        ],
      },
      {
        type: 'h2',
        text: 'Consumer and data-subject rights',
      },
      {
        type: 'p',
        text: 'Depending on where you live and whether BloomAR acts as a controller of your information, you may have the right to:',
      },
      {
        type: 'ul',
        items: [
          '**Know and access** the categories and specific pieces of personal information we hold about you, the sources, the purposes, and the categories of recipients.',
          '**Correct** inaccurate personal information.',
          '**Delete** personal information we collected from you, subject to legal exceptions.',
          '**Portability** — receive a copy of the information you provided to us in a portable, readily usable format.',
          '**Opt out** of the sale or sharing of personal information, and of targeted advertising. We do not currently engage in these activities, so there is nothing to opt out of today; if that changes, we will provide a “Do Not Sell or Share My Personal Information” mechanism before the change takes effect.',
          '**Limit the use of sensitive personal information** to the purposes permitted by law.',
          '**Non-discrimination** — we will not deny service, charge a different price, or provide a different level of service because you exercised a privacy right.',
          '**Opt out of profiling** that produces legal or similarly significant effects. We do not conduct such profiling.',
          '**Appeal** a decision we make about a privacy request, where your state requires an appeal process.',
        ],
      },
      { type: 'h3', text: 'How to make a request' },
      {
        type: 'p',
        text: 'Email [[PRIVACY_EMAIL]] with the subject line "Privacy Request," or write to us at the address in Section 19. Tell us what you want and which state you reside in. We will acknowledge your request within 10 business days and respond within 45 days, extendable once by 45 additional days where permitted, with notice. There is no charge unless a request is manifestly unfounded or excessive.',
      },
      {
        type: 'p',
        text: 'We must verify your identity before acting on a request. For an account holder, we verify by having you sign in to the account or by confirming control of the email address on file. For a request about Customer Data, we will refer you to the customer organization, because we cannot verify your identity against another organization\u2019s records and are not permitted to disclose them to you directly.',
      },
      { type: 'h3', text: 'Authorized agents' },
      {
        type: 'p',
        text: 'You may use an authorized agent to submit a request with written permission signed by you. We may still require you to verify your own identity directly, as permitted by law.',
      },
      {
        type: 'h2',
        text: 'Deletion requests and legal exceptions',
      },
      {
        type: 'p',
        text: 'We honor valid deletion requests, but we cannot delete information that we are legally required to keep or that we need for a permitted purpose. Common exceptions include: records needed to comply with a legal obligation (tax, accounting, healthcare-privacy, and anti-fraud requirements); information needed to complete a transaction or provide a service you requested; information needed to detect security incidents and protect against fraudulent or illegal activity; information needed to exercise or defend legal claims; and information subject to a litigation hold or preservation obligation.',
      },
      {
        type: 'p',
        text: 'Where an exception applies, we delete or de-identify the rest and tell you what was retained and why. Deletion from live systems does not immediately remove copies from encrypted backups; those copies are deleted on the normal backup rotation described in Section 9 and are not restored for any purpose other than disaster recovery.',
      },
      {
        type: 'h2',
        text: 'Data retention',
      },
      {
        type: 'table',
        caption: 'Retention schedule',
        headers: ['Record type', 'Retention period', 'Basis'],
        rows: [
          ['Account, organization, and profile data', 'For the life of the account, then 30 days after closure', 'Contract; Export Window in the Terms of Service'],
          ['Customer Data, including PHI', 'For the life of the subscription, then the 30-day Export Window', 'Contract and BAA; customer instruction'],
          ['Billing records, invoices, and payment history', '7 years after the transaction', 'U.S. tax and accounting record-keeping practice'],
          ['Security and authentication logs; session records', 'Up to 12 months; sessions expire after 7 days', 'Security monitoring (45 C.F.R. § 164.312(b) audit-control support)'],
          ['Audit logs of workspace activity', 'Retained for the life of the organization workspace, then archived per customer instruction', 'HIPAA audit-control and documentation requirements (45 C.F.R. § 164.316, § 164.530(j))'],
          ['Marketing and lead contact data', '24 months after last interaction, or until you opt out', 'Legitimate business interest; CAN-SPAM compliance'],
          ['Support correspondence', '24 months after the ticket closes', 'Service history and dispute resolution'],
          ['Encrypted backups', 'Rolling rotation; {{CONFIRM: backup retention window configured on the managed PostgreSQL provider (commonly 7–30 days of point-in-time recovery)}} days', 'Disaster recovery'],
          ['Verification, reset, and invitation tokens', 'Until expiry (24 hours, 1 hour, and 7 days respectively) or use', 'Security'],
        ],
      },
      {
        type: 'p',
        text: 'We may retain information longer where a legal hold, audit, regulatory inquiry, or dispute requires it. Aggregated or de-identified information that cannot reasonably be linked to an individual may be retained indefinitely.',
      },
      {
        type: 'h2',
        text: 'Data security',
      },
      {
        type: 'p',
        text: 'We apply administrative, technical, and physical safeguards intended to protect information against unauthorized access, alteration, disclosure, and destruction. The controls currently implemented in the Service include:',
      },
      {
        type: 'ul',
        items: [
          '**Encryption in transit** for connections to the application and the database, using TLS.',
          '**Password protection:** bcrypt hashing with a per-password salt; passwords are never stored or logged in plaintext.',
          '**Multi-factor authentication:** TOTP authenticator support with encrypted secret storage and hashed one-time recovery codes.',
          '**Session controls:** HTTP-only, secure session cookies; server-side session records with an 8-hour idle timeout and a 7-day absolute lifetime; the ability for a user to revoke individual sessions or all other sessions.',
          '**Organization isolation:** every operational record is bound to an organization, and server-side authorization checks are enforced on every request. PostgreSQL row-level security is enabled as defense in depth.',
          '**Role-based access:** owner, admin, manager, specialist, and read-only roles, with mutating actions blocked server-side for read-only users.',
          '**Audit logging:** structured records of authentication, administrative, and workflow actions, scoped to the organization, with credentials and sensitive identifiers redacted before storage.',
          '**Rate limiting** on authentication and other sensitive endpoints.',
          '**Least-privilege operations:** platform administration is separated from customer workspaces and does not expose claim, patient, or clinical records.',
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'What we do not claim',
        text:
          'We do not claim SOC 2 certification, HITRUST certification, ISO 27001 certification, or HIPAA certification, and we do not describe our controls as "fully HIPAA compliant" or "guaranteed secure." No method of transmission or storage is completely secure. The technical list above describes implemented controls; it is not an audit opinion, and it does not by itself establish compliance with the HIPAA Security Rule, which also requires administrative and physical safeguards, documented policies, a security risk analysis, and workforce training.',
      },
      {
        type: 'p',
        text: 'If we become aware of a security incident affecting your information, we will notify you and the affected customer organization as required by law and the Business Associate Agreement. You can report a suspected vulnerability or incident to [[SECURITY_EMAIL]]. We support coordinated disclosure and will not pursue legal action against researchers who act in good faith, avoid privacy violations and service disruption, and give us reasonable time to remediate.',
      },
      {
        type: 'h2',
        text: 'Third-party processors and subprocessors',
      },
      {
        type: 'p',
        text: 'We use the subprocessor categories listed in Section 5. Each is bound by a written agreement that requires confidentiality, security safeguards, use restrictions, and (where PHI is involved) business associate terms. We remain responsible for our subprocessors\u2019 performance to the extent required by the Business Associate Agreement and applicable law. The named list, processing locations, and the process for objecting to a new subprocessor are in the Data Processing Agreement.',
      },
      {
        type: 'p',
        text: 'Our public website loads a typeface from Google Fonts. When your browser requests that font, Google receives your IP address and browser information as a normal part of serving the file. This happens on public pages; see the Cookie Policy for how to avoid it. Pages inside signed-in workspaces use the same site configuration.',
      },
      {
        type: 'h2',
        text: 'International processing and transfers',
      },
      {
        type: 'p',
        text: 'BloomAR provides the Service to customers in the United States, and our primary infrastructure and support operations are in the United States. Information we collect is processed and stored in the United States. If any subprocessor processes data outside the United States, we will list that location in the Data Processing Agreement and rely on an appropriate transfer mechanism.',
      },
      {
        type: 'p',
        text: 'We do not currently offer the Service to customers in the European Economic Area, the United Kingdom, or Switzerland, and we do not represent that the Service is configured for the GDPR. If you are located outside the United States and use the Service, you do so on your own initiative and are responsible for compliance with local law. {{COUNSEL: confirm whether offering the Service outside the United States requires a separate legal basis, a local representative, or a transfer mechanism before any non-U.S. customer is onboarded}}',
      },
      {
        type: 'h2',
        text: 'Children\u2019s privacy',
      },
      {
        type: 'p',
        text: 'The Service is a business tool for healthcare professionals. It is not directed to children, and we do not knowingly collect personal information from anyone under 16 through the public website or by design through the Service. Where a customer\u2019s billing records include information about a minor patient, that information is Customer Data processed on the customer\u2019s instructions and is governed by the customer\u2019s agreement and the Business Associate Agreement, not by this Section. If you believe a child has provided information to us directly, contact [[PRIVACY_EMAIL]] and we will delete it.',
      },
      {
        type: 'h2',
        text: 'Marketing communications and choices',
      },
      {
        type: 'p',
        text: 'If you submit a demo or sales request, or become a customer, we may email you about the product and your account. Marketing email always includes an unsubscribe link that works without requiring you to sign in. Unsubscribing stops marketing email but does not stop transactional or service messages, which are necessary to operate your account.',
      },
      {
        type: 'p',
        text: 'You can update your profile and communication preferences in the application. To opt out of all non-essential email, email [[PRIVACY_EMAIL]]. We do not sell or rent contact lists, and we do not add customers to marketing lists on behalf of other companies.',
      },
      {
        type: 'h2',
        text: 'Cookies and similar technologies',
      },
      {
        type: 'p',
        text: 'We use a small number of cookies and browser storage entries. The only cookie required for the application to function is the `session` cookie, which is HTTP-only, secure, and used to keep you signed in. The Cookie Policy lists every cookie and storage item by name, purpose, and duration, explains the one third-party service that receives connection data on public pages, and describes how to control cookies in your browser. We do not use advertising cookies.',
      },
      { type: 'h2', text: 'Artificial-intelligence-assisted features' },
      {
        type: 'p',
        text: 'Some features produce suggestions from the data already in your workspace — for example denial-category analysis that maps a CARC/RARC code and claim context to likely reasons and next actions, or document field extraction that uses pattern matching on text you upload. These features run inside our application against your organization\u2019s data. We do not send Customer Data to a third-party generative artificial-intelligence provider unless we have disclosed that provider as a subprocessor, and we would not do so without a business associate agreement in place. AI-assisted output is a workflow aid only and must be reviewed by qualified personnel; see the disclaimer in the Terms of Service.',
      },
      {
        type: 'p',
        text: 'The same restriction applies to any future feature that would transmit Customer Data to an external AI or OCR vendor: it will not be enabled for PHI until a business associate agreement covering that vendor is in place and this policy and the Data Processing Agreement are updated.',
      },
      { type: 'h2', text: 'Privacy complaints' },
      {
        type: 'p',
        text: 'If you believe we have mishandled your information, please contact us first at [[PRIVACY_EMAIL]] with the details. We will investigate and respond within 30 days. If you are not satisfied, you may contact your state attorney general or consumer-protection agency, and — for health information — the U.S. Department of Health and Human Services Office for Civil Rights. You may also file a complaint with us on behalf of a customer organization through the same address; customers are never penalized for raising a good-faith privacy concern.',
      },
      { type: 'h2', text: 'Changes to this policy' },
      {
        type: 'p',
        text: 'We will update this policy when our practices, our subprocessors, or the law change, and we will update the "Last updated" date. Material changes will be announced by email to account holders and Organization Administrators before they take effect, and where required we will obtain consent. Prior versions are available on request.',
      },
      { type: 'h2', text: 'Contact us' },
      {
        type: 'p',
        text: 'Privacy questions, requests, and complaints:',
      },
      {
        type: 'address',
        lines: [
          `${entityFullName(E)}`,
          'Attn: Privacy',
          ...postalAddressLines(E),
          'Privacy requests: [[PRIVACY_EMAIL]]',
          'Security reports: [[SECURITY_EMAIL]]',
          'General support: [[SUPPORT_EMAIL]]',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Document status',
        text:
          'Version 1.0. Effective and last-updated dates are placeholders until publication. This policy describes the Service as implemented at the time of writing and requires confirmation by counsel for the states in which BloomAR does business.',
      },
    ],
  };
}
