import type { LegalDocument } from './types.ts';
import { LEGAL_ENTITY, entityFullName, postalAddressOneLine } from './entity.ts';

const E = LEGAL_ENTITY;

export function dpaDocument(): LegalDocument {
  return {
    slug: 'dpa',
    title: 'Data Processing Agreement',
    shortTitle: 'DPA',
    summary:
      'The processor terms that apply to personal data BloomRCM handles for a customer organization — separate from, and additional to, HIPAA business associate obligations.',
    effectiveDate: '[[EFFECTIVE_DATE]]',
    lastUpdated: '[[LAST_UPDATED_DATE]]',
    version: '1.0',
    appliesTo: 'Customer organizations that are controllers of personal data processed in the Service, and any customer that requires a signed processor agreement.',
    executable: true,
    related: ['terms', 'privacy', 'baa', 'cookies'],
    blocks: [
      {
        type: 'callout',
        tone: 'warn',
        title: 'This document is a processor agreement, not a substitute for the BAA',
        text:
          'This DPA governs personal data that is not Protected Health Information, and the general processor relationship. PHI is governed by the Business Associate Agreement, which must be executed separately. Executing this DPA does not make BloomRCM a HIPAA business associate, and the existence of either document is not evidence of HIPAA certification or of a completed security risk analysis.',
      },
      { type: 'h2', text: 'Parties and structure' },
      {
        type: 'p',
        text: `This Data Processing Agreement ("**DPA**") forms part of the agreement between the customer organization identified in the applicable order form, checkout, or account registration ("**Customer**") and ${entityFullName(
          E
        )}, whose principal place of business is ${postalAddressOneLine(
          E
        )} ("**BloomRCM**" or "**Processor**"). It applies automatically to the extent Customer submits personal data to the Service, and it is effective on the later of the effective date of the underlying agreement and the date Customer first submits personal data.`,
      },
      {
        type: 'p',
        text: 'Customer may be a "controller," "business," or equivalent under applicable law; BloomRCM acts as a "processor," "service provider," or "business associate" as the context requires. Where BloomRCM processes PHI, the Business Associate Agreement applies and this DPA operates alongside it for non-PHI personal data.',
      },
      { type: 'h2', text: 'Definitions' },
      {
        type: 'dl',
        items: [
          {
            term: 'Personal Data',
            def: 'Any information relating to an identified or identifiable natural person that Customer submits to the Service, excluding Protected Health Information governed by the Business Associate Agreement.',
          },
          {
            term: 'Protected Health Information (PHI)',
            def: 'As defined in 45 C.F.R. § 160.103, governed exclusively by the Business Associate Agreement when executed.',
          },
          {
            term: 'Processing',
            def: 'Any operation performed on Personal Data, including collection, recording, storage, retrieval, use, disclosure, transmission, alteration, and deletion.',
          },
          {
            term: 'Subprocessor',
            def: 'A third party engaged by BloomRCM to process Personal Data on BloomRCM\u2019s behalf in connection with the Service.',
          },
          {
            term: 'Data Subject',
            def: 'The individual to whom Personal Data relates, including Customer\u2019s patients, subscribers, employees, and Authorized Users.',
          },
          {
            term: 'Supervisory or Regulatory Authority',
            def: 'A government body with jurisdiction over the processing, including a state attorney general, a state privacy agency, and the U.S. Department of Health and Human Services Office for Civil Rights for HIPAA matters.',
          },
        ],
      },
      { type: 'h2', text: 'Processing details' },
      {
        type: 'table',
        caption: 'Subject matter, duration, and scope of processing',
        headers: ['Item', 'Detail'],
        rows: [
          ['Subject matter', 'Provision of the BloomAR Manager billing and accounts-receivable platform, including storage, workflow processing, reporting, document intake, and support.'],
          [
            'Duration',
            'For the term of the underlying agreement, plus the 30-day post-termination Export Window, plus any period required by law or by the Business Associate Agreement. Processing ends when Personal Data is deleted or returned.',
          ],
          [
            'Purpose',
            'To provide, secure, maintain, and support the Service as instructed by Customer through its configuration and use of the Service; to prevent fraud and abuse; to comply with law; and for BloomRCM\u2019s own proper management and administration as permitted by the Business Associate Agreement where PHI is involved.',
          ],
          [
            'Nature of processing',
            'Hosted storage and retrieval, workflow state changes, document parsing and field extraction, computation of derived workflow values, reporting and export generation, audit logging, and transmission to the subprocessors listed in Section 8.',
          ],
          [
            'Types of Personal Data',
            'Identification and contact data (name, work email, phone); account and authentication data (hashed password, session records, IP address, user-agent, MFA enrollment state); organization data (name, type, country, time zone, domains); billing and subscription data (plan, status, invoice records, payment processor identifiers); health and billing data relating to patients and subscribers (patient and subscriber names, member identifiers, dates of service, diagnosis and procedure codes, charge, payment, and balance amounts, payer information, authorization and referral numbers, denial details, and uploaded documents such as EOBs and denial letters) — this category is PHI when it is transmitted or maintained in electronic media for a covered entity or business associate; employment and workforce data of Authorized Users to the extent submitted.',
          ],
          [
            'Categories of Data Subjects',
            'Customer\u2019s workforce and Authorized Users; Customer\u2019s patients and subscribers; providers whose claims are processed; guarantors and responsible parties where recorded.',
          ],
          [
            'Special categories / sensitive data',
            'Health data, which is treated as PHI and governed by the Business Associate Agreement. BloomRCM does not intentionally process data revealing racial or ethnic origin, religious beliefs, sexual orientation, citizenship or immigration status, genetic data, biometric data, or precise geolocation, and Customer must not submit such data unless it is strictly necessary for a billing workflow and lawful.',
          ],
        ],
      },
      { type: 'h2', text: 'Customer instructions' },
      {
        type: 'p',
        text: 'BloomRCM will process Personal Data only on Customer\u2019s documented instructions, which comprise: the underlying agreement, this DPA, the Business Associate Agreement where applicable, Customer\u2019s configuration and use of the Service, and any written instruction Customer issues through the support channel or an executed order form. BloomRCM will not process Personal Data for its own purposes, will not sell it, will not use it for advertising or profiling, and will not disclose it except as described in this DPA.',
      },
      {
        type: 'p',
        text: 'BloomRCM will promptly inform Customer if, in its opinion, an instruction would violate applicable law, and may suspend performance of that instruction until it is confirmed or modified. BloomRCM is not required to follow an instruction that would require it to break the law or compromise the security of another customer\u2019s data.',
      },
      { type: 'h2', text: 'Processor obligations' },
      {
        type: 'ul',
        items: [
          'Process Personal Data only as instructed, and implement appropriate technical and organizational measures as described in Section 7.',
          'Ensure that personnel authorized to process Personal Data are subject to confidentiality obligations that survive their engagement.',
          'Assist Customer in responding to Data Subject requests, as described in Section 10.',
          'Assist Customer with security, breach notification, impact assessments, and regulator consultations, as described in Sections 13 to 16.',
          'Notify Customer of a Personal Data Breach without undue delay, as described in Section 11.',
          'Engage subprocessors only as permitted by Section 8, and impose equivalent obligations on them.',
          'At Customer\u2019s choice, delete or return Personal Data at the end of the provision of services, as described in Section 15 and Section 16.',
          'Make available the information reasonably necessary to demonstrate compliance, and allow for audits as described in Section 17.',
          'Not create a link between Personal Data and data from other sources, and not retain Personal Data longer than necessary for the instructed purpose.',
          'Maintain records of its processing activities as required by applicable law and make them available to a regulator on request.',
        ],
      },
      { type: 'h2', text: 'Confidentiality' },
      {
        type: 'p',
        text: 'BloomRCM will treat all Personal Data as confidential information of Customer, will restrict access to personnel who need it to perform the services, and will require those personnel to be bound by written confidentiality obligations. Access to production data is limited to personnel with an operational need, is logged where technically feasible, and is not granted to platform-administration functions that only require workspace metadata. BloomRCM will not access Customer Data for any purpose other than providing and securing the Service, responding to a Customer request, or complying with law, except where the Business Associate Agreement permits access for proper management and administration.',
      },
      { type: 'h2', text: 'Technical and organizational security measures' },
      {
        type: 'p',
        text: 'BloomRCM maintains the following measures, which are implemented in the Service as described. This list is factual as of the date of this document; measures may be updated provided the overall level of protection is not reduced.',
      },
      {
        type: 'table',
        caption: 'Implemented safeguards',
        headers: ['Control area', 'Measure'],
        rows: [
          ['Encryption in transit', 'TLS for all connections to the application and to the managed database, using the provider\u2019s required SSL mode.'],
          ['Encryption at rest', 'Storage-level encryption provided by the managed PostgreSQL and hosting providers. {{CONFIRM: confirm the specific at-rest encryption and key-management configuration of the database and hosting providers, and whether database-level field encryption is used for any identifier}} '],
          ['Authentication', 'Bcrypt password hashing (cost 12); TOTP multi-factor authentication with AES-256-GCM encrypted secrets and SHA-256 hashed recovery codes; rate limiting on authentication endpoints.'],
          ['Session management', 'Server-side session records with unique token identifiers; HTTP-only and secure session cookie; 8-hour server-side idle timeout; 7-day absolute lifetime; user-initiated session revocation.'],
          ['Authorization and tenant isolation', 'Server-side membership checks on every request; organization-scoped queries on all operational tables; PostgreSQL row-level security enabled as defense in depth; read-only role enforcement; suspended-organization blocking.'],
          ['Audit logging', 'Structured audit records for authentication, administrative, and workflow events, scoped to the organization, with credentials and sensitive identifiers redacted before storage.'],
          ['Backups and resilience', 'Managed database backups with point-in-time recovery. {{CONFIRM: backup frequency, retention window, restore testing cadence, and stated recovery objectives}} '],
          ['Personnel and access', 'Least-privilege access to production systems; secrets held in the hosting environment rather than in source control. {{CONFIRM: documented access-review cadence, background-check policy, and workforce security training program}} '],
          ['Vulnerability management', 'Dependency and framework updates; a coordinated-disclosure channel at [[SECURITY_EMAIL]]. {{CONFIRM: whether automated dependency scanning, penetration testing, or a vulnerability-management policy is in place and on what cadence}} '],
          ['Logging and monitoring', 'Application and infrastructure logs for error and abuse detection. {{CONFIRM: alerting, log-retention, and incident-detection tooling}} '],
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Honest limitation',
        text:
          'Several items above are marked for confirmation because they depend on the hosting and database providers\u2019 configurations and on operator practices rather than on application code. Those confirmations must be completed, and the underlying policies documented, before this DPA is presented as evidence of a mature security program. BloomRCM does not hold SOC 2, HITRUST, or ISO 27001 certification as of this version, and nothing in this DPA should be read to imply one.',
      },
      { type: 'h2', text: 'Subprocessor authorization' },
      {
        type: 'p',
        text: 'Customer provides general written authorization for BloomRCM to engage subprocessors to process Personal Data, subject to this Section. BloomRCM will: (a) select subprocessors that can provide an appropriate level of protection; (b) enter into a written agreement with each subprocessor that imposes data-protection obligations no less protective than this DPA and, where PHI is processed, business associate obligations; (c) remain liable to Customer for its subprocessors\u2019 performance to the extent required by applicable law; and (d) maintain the list below.',
      },
      {
        type: 'table',
        caption: 'Current subprocessors',
        headers: ['Subprocessor', 'Service provided', 'Data categories', 'Location'],
        rows: [
          ['Vercel Inc.', 'Application hosting, edge delivery, performance monitoring', 'All data transmitted through the Service; technical logs', 'United States'],
          ['Managed PostgreSQL provider (Neon or equivalent)', 'Primary database, backups, point-in-time recovery', 'All stored data, including PHI', 'United States'],
          ['Stripe, Inc.', 'Subscription billing, invoicing, receipts, fraud signals', 'Billing contact, payment method, invoice records. No PHI.', 'United States'],
          ['Transactional email provider via SMTP configuration', 'Verification, password reset, invitation, billing, and notification email', 'Email addresses and message content. Message bodies are designed to avoid PHI.', 'United States'],
        ],
      },
      {
        type: 'p',
        text: 'BloomRCM will give Customer at least 30 days\u2019 advance notice by email to Organization Administrators before adding or replacing a subprocessor that will process Personal Data. Customer may object in writing within that period on reasonable data-protection grounds. If the parties cannot resolve the objection within 30 days, Customer may terminate the affected subscription and receive a pro-rata refund of prepaid fees for the unused portion. Continued use of the Service after the notice period constitutes acceptance.',
      },
      { type: 'h2', text: 'Subprocessor flow-down obligations' },
      {
        type: 'p',
        text: 'Each subprocessor agreement must, at a minimum, require the subprocessor to: process Personal Data only on BloomRCM\u2019s documented instructions, which must themselves be consistent with Customer\u2019s instructions; implement appropriate security measures; impose confidentiality obligations on personnel; assist with Data Subject requests and breach notification; permit BloomRCM to audit or obtain independent assurance; delete or return data at the end of the engagement; and — where PHI is involved — accept the same restrictions and conditions that apply to BloomRCM under 45 C.F.R. § 164.504(e)(1)(ii), including the obligations in 45 C.F.R. §§ 164.308, 164.310, 164.312, 164.316 and 164.502(e).',
      },
      { type: 'h2', text: 'Assistance with Data Subject requests' },
      {
        type: 'p',
        text: 'BloomRCM will, to the extent technically possible and taking into account the nature of the processing, assist Customer in responding to requests from Data Subjects to access, correct, delete, restrict, port, or object to the processing of Personal Data. Self-serve tools in the Service let Customer export and modify records directly. Where a request requires operator assistance, BloomRCM will respond to Customer\u2019s request within 10 business days and will not respond to the Data Subject directly unless Customer instructs it to or the law requires it.',
      },
      {
        type: 'p',
        text: 'If BloomRCM receives a request directly from a Data Subject or a regulator concerning Personal Data, it will, unless legally prohibited, redirect the requester to Customer and notify Customer promptly.',
      },
      { type: 'h2', text: 'Security incident notification' },
      {
        type: 'p',
        text: 'BloomRCM will notify Customer without undue delay after confirming a Security Incident — that is, any actual or reasonably suspected unauthorized acquisition, access, use, or disclosure of Personal Data, or any event that materially compromises the confidentiality, integrity, or availability of the Service. Notification will be provided by email to Organization Administrators and the security contact Customer designates.',
      },
      {
        type: 'p',
        text: 'The notification will include, to the extent known: the nature of the incident, the categories and approximate volume of Personal Data affected, the date or period of the incident, the likely consequences, the measures taken or proposed to address it and mitigate harm, and a point of contact. Where the information is not all available at once, BloomRCM will provide it in phases and will update Customer as the investigation progresses.',
      },
      {
        type: 'p',
        text: 'BloomRCM will not notify Data Subjects or a regulator about Customer\u2019s data without Customer\u2019s prior written consent except where BloomRCM is itself legally required to do so. BloomRCM will document the incident, its response, and the remediation, and will make that documentation available to Customer.',
      },
      { type: 'h2', text: 'Personal data breach cooperation' },
      {
        type: 'p',
        text: 'BloomRCM will cooperate with Customer in meeting Customer\u2019s obligations to notify Data Subjects and regulators under applicable state breach-notification laws (and, for PHI, under 45 C.F.R. Part 164 Subpart D and the Business Associate Agreement), including by providing the content needed for the notices, reasonably assisting with remediation and credit monitoring decisions where appropriate, and participating in post-incident reviews. BloomRCM will bear the reasonable costs of its own investigation and remediation, and the parties\u2019 liability for a breach caused by BloomRCM is subject to the limitation of liability in the Terms of Service except where that limitation is unenforceable under applicable law.',
      },
      { type: 'h2', text: 'Data protection impact assessments and regulatory cooperation' },
      {
        type: 'p',
        text: 'BloomRCM will provide reasonable assistance to Customer, at Customer\u2019s cost where the effort is substantial and agreed in advance, in connection with any data protection impact assessment, security risk analysis, or prior consultation with a regulatory authority that Customer is required to conduct. This includes providing the information in Sections 6 to 10 and answering reasonable written questionnaires.',
      },
      {
        type: 'p',
        text: 'BloomRCM will cooperate with a Supervisory or Regulatory Authority in the performance of its tasks where legally required, and will notify Customer of a request for Customer Data from a regulator unless prohibited by law. BloomRCM will challenge an overbroad request where it has reasonable grounds, and will disclose only the minimum necessary to comply.',
      },
      { type: 'h2', text: 'International data transfers' },
      {
        type: 'p',
        text: 'BloomRCM processes Personal Data in the United States, and each subprocessor is listed with its processing location in Section 8. Customer is responsible for determining whether transferring Personal Data to the United States is permitted for its organization and for putting in place any required transfer mechanism. BloomRCM will not transfer Personal Data to a jurisdiction other than those listed without notice under Section 8.',
      },
      {
        type: 'p',
        text: '{{COUNSEL: if any customer is located in the EEA, UK, Switzerland, or another jurisdiction with transfer restrictions, a separate module addressing the applicable standard contractual clauses or adequacy mechanism must be added to this DPA before that customer is onboarded}}',
      },
      { type: 'h2', text: 'Data retention and deletion' },
      {
        type: 'p',
        text: 'BloomRCM will retain Personal Data for the term of the agreement and for the 30-day Export Window after termination, and will then delete it in accordance with the retention schedule in the Privacy Policy, unless Customer instructs otherwise in writing before the window closes or unless retention is required by law.',
      },
      {
        type: 'p',
        text: 'Where BloomRCM is required by law to retain Personal Data, or where Personal Data is subject to a legal hold or an audit obligation, BloomRCM will isolate it from active processing, restrict access to it, and continue to protect it under this DPA until it can be deleted.',
      },
      {
        type: 'p',
        text: 'Customer acknowledges that BloomRCM does not currently operate an automated archival-purge job, and that deletion at the end of the retention period is carried out through a documented operator procedure upon request or scheduled review. Deletion from live systems does not remove copies from encrypted backups before the backup rotation completes.',
      },
      { type: 'h2', text: 'Data return and export' },
      {
        type: 'p',
        text: 'During the term, and during the Export Window after termination, Customer may export Personal Data using the Service\u2019s CSV and Excel exports or by requesting a full export from [[SUPPORT_EMAIL]]. BloomRCM will provide a full export in a structured, commonly used, machine-readable format within 30 days of a written request made before the end of the Export Window. BloomRCM may charge a reasonable fee for an export requiring substantial bespoke engineering effort, quoted in advance.',
      },
      { type: 'h2', text: 'Audit rights' },
      {
        type: 'p',
        text: 'BloomRCM will make available the information reasonably necessary to demonstrate compliance with this DPA, and will respond to a written security questionnaire at intervals of no more than once per twelve months. Where Customer requires more, the parties may agree in writing to an audit, which will be: conducted during normal business hours with at least 30 days\u2019 written notice; limited to the systems and records relevant to the Service; performed so as not to compromise the confidentiality or security of other customers\u2019 data; subject to a written confidentiality agreement; and at Customer\u2019s expense, unless the audit reveals a material breach of this DPA, in which case BloomRCM bears the reasonable cost.',
      },
      {
        type: 'p',
        text: 'BloomRCM is not required to provide access to information that would compromise the security of the Service, breach another customer\u2019s confidentiality, or violate law. Where an independent third-party report or certification becomes available, BloomRCM may satisfy an audit request by providing it under a non-disclosure agreement.',
      },
      { type: 'h2', text: 'Liability allocation' },
      {
        type: 'p',
        text: 'Each party\u2019s liability arising out of this DPA is subject to the limitation of liability in the Terms of Service, except to the extent that limitation is unenforceable under applicable law. Each party is responsible for its own non-compliance with applicable data-protection law, and BloomRCM is responsible for the acts and omissions of its subprocessors as if they were its own.',
      },
      {
        type: 'p',
        text: 'Where a fine, penalty, or damages award results from processing carried out at Customer\u2019s specific written instruction that BloomRCM had identified in writing as likely to violate law, Customer will reimburse BloomRCM for that amount, to the extent permitted by law.',
      },
      { type: 'h2', text: 'Term and termination' },
      {
        type: 'p',
        text: 'This DPA remains in force for as long as BloomRCM processes Personal Data for Customer. It terminates automatically when the underlying agreement ends and the retention and deletion obligations in Section 15 are satisfied. Either party may terminate this DPA for material breach by the other that is not cured within 30 days of written notice, and BloomRCM may suspend processing if continuing would violate law.',
      },
      {
        type: 'p',
        text: 'Sections that by their nature should survive termination — including those on confidentiality, deletion and return, liability, audit record retention, and order of precedence — survive.',
      },
      { type: 'h2', text: 'Relationship to HIPAA business associate obligations' },
      {
        type: 'p',
        text: 'This DPA and the Business Associate Agreement address overlapping but distinct obligations, and it is important not to conflate them:',
      },
      {
        type: 'table',
        caption: 'HIPAA business associate obligations compared with general processor obligations',
        headers: ['Topic', 'HIPAA Business Associate Agreement', 'This DPA'],
        rows: [
          ['Scope of data', 'PHI and ePHI only', 'All personal data that is not PHI, plus the general processor relationship'],
          ['Controlling law', '45 C.F.R. Parts 160 and 164, including the Privacy, Security, and Breach Notification Rules', 'State comprehensive privacy and breach-notification laws; general contract law'],
          ['Core use restriction', 'Permitted uses and disclosures only as set out in 45 C.F.R. § 164.504(e) and the BAA', 'Processing only on documented instructions'],
          ['Individual rights', 'Access, amendment, and accounting of disclosures under 45 C.F.R. § 164.524, § 164.526, § 164.528', 'Access, correction, deletion, portability, and opt-out rights under state law'],
          ['Breach timing', 'Notify the covered entity without unreasonable delay and no later than 60 days after discovery (45 C.F.R. § 164.410)', 'Notify without undue delay after confirmation; cooperate with state-law notification'],
          ['Subcontractors', 'Must agree to the same restrictions and conditions (45 C.F.R. § 164.502(e)(1)(ii), § 164.504(e)(1)(ii))', 'Must be bound by obligations no less protective than this DPA'],
          ['Return or destruction', 'Return or destroy PHI if feasible; if not, extend protections and limit further use (45 C.F.R. § 164.504(e)(2)(ii)(I))', 'Delete or return personal data at the end of the Export Window'],
          ['Regulator', 'HHS Office for Civil Rights', 'State attorneys general and state privacy agencies'],
        ],
      },
      {
        type: 'p',
        text: 'If the same data is both PHI and personal data under a state privacy law, the Business Associate Agreement governs the PHI aspects, and this DPA governs the remainder. The Business Associate Agreement controls in the event of conflict regarding PHI.',
      },
      { type: 'h2', text: 'Order of precedence' },
      {
        type: 'p',
        text: 'In the event of a conflict, the following order applies: (1) the Business Associate Agreement, for PHI; (2) this DPA, for personal data that is not PHI; (3) a written order form, for commercial terms; (4) the Terms of Service; (5) the Privacy Policy. Mandatory provisions of applicable law prevail over all of the above to the extent they cannot be varied by contract.',
      },
      { type: 'h2', text: 'Execution' },
      {
        type: 'p',
        text: 'This DPA takes effect when Customer accepts the Terms of Service and submits personal data, and needs no separate signature for self-serve subscriptions. A countersigned copy for procurement or vendor-management purposes is available on request from [[LEGAL_NOTICES_EMAIL]].',
      },
      {
        type: 'signatures',
        parties: [
          {
            role: 'BloomRCM (Processor)',
            rows: [
              'Signature: ______________________________',
              'Name: ______________________________',
              'Title: ______________________________',
              `${entityFullName(E)}`,
              'Date: ______________________________',
            ],
          },
          {
            role: 'Customer (Controller)',
            rows: [
              'Signature: ______________________________',
              'Name: ______________________________',
              'Title: ______________________________',
              'Organization: ______________________________',
              'Date: ______________________________',
            ],
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Document status',
        text:
          'Version 1.0. This DPA is drafted for a U.S. SaaS provider and is intended for execution. Items marked for confirmation depend on hosting-provider configuration and operator practice, and must be completed before this document is presented to a customer as evidence of a security program.',
      },
    ],
  };
}
