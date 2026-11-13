import type { LegalDocument } from './types.ts';
import { LEGAL_ENTITY, entityFullName, postalAddressOneLine } from './entity.ts';

const E = LEGAL_ENTITY;

export function baaDocument(): LegalDocument {
  return {
    slug: 'baa',
    title: 'HIPAA Business Associate Agreement',
    shortTitle: 'BAA',
    summary:
      'The HIPAA business associate terms that apply when BloomRCM handles PHI for a covered entity or another business associate. Must be executed before PHI is submitted.',
    effectiveDate: '[[EFFECTIVE_DATE]]',
    lastUpdated: '[[LAST_UPDATED_DATE]]',
    version: '1.0',
    appliesTo:
      'Covered entities (medical practices, physician groups, healthcare organizations) and business associates that will submit PHI, and their BloomRCM subscription.',
    executable: true,
    related: ['terms', 'privacy', 'dpa'],
    blocks: [
      {
        type: 'callout',
        tone: 'warn',
        title: 'Read this before submitting PHI',
        text:
          'Do not submit Protected Health Information to BloomAR Manager until a Business Associate Agreement covering your organization has been executed. Where no BAA is in force, BloomRCM is not acting as your business associate, and you must not upload claims, patient identifiers, or clinical documents.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'What this agreement does not mean',
        text:
          'Signing this agreement does not mean BloomRCM is “HIPAA certified” — HIPAA does not issue certification for software. It does not mean BloomRCM has completed a security risk analysis on your behalf, and it does not transfer any of your own HIPAA obligations (workforce training, risk analysis, policies, minimum-necessary determinations, or notification to individuals) to BloomRCM. Section 4 of this document describes the actual technical capabilities of the Service so you can assess whether they meet your requirements.',
      },
      { type: 'h2', text: 'Parties and background' },
      {
        type: 'p',
        text: `This Business Associate Agreement ("**BAA**") is entered into by and between the entity identified as Customer in the applicable BloomAR Manager subscription ("**Covered Entity**" or "**Business Associate**," as applicable, and "**Customer**") and ${entityFullName(
          E
        )}, with its principal place of business at ${postalAddressOneLine(
          E
        )} ("**Business Associate**" or "**BloomRCM**").`,
      },
      {
        type: 'p',
        text: 'Customer operates as, or on behalf of, a covered entity under the Health Insurance Portability and Accountability Act of 1996 and its implementing regulations at 45 C.F.R. Parts 160 and 164 ("**HIPAA**"). Customer wishes to use the BloomAR Manager software service for medical billing and accounts-receivable management, and in doing so may disclose Protected Health Information to BloomRCM. The parties intend this BAA to satisfy 45 C.F.R. § 164.504(e) and § 164.314(a), and to bind BloomRCM as a business associate (and, where Customer is itself a business associate, as a subcontractor under 45 C.F.R. § 164.502(e)(1)(ii)).',
      },
      { type: 'h2', text: 'Definitions' },
      {
        type: 'p',
        text: 'Capitalized terms not defined here have the meanings given in 45 C.F.R. Parts 160 and 164. In addition:',
      },
      {
        type: 'dl',
        items: [
          {
            term: 'Protected Health Information or PHI',
            def: 'Protected health information as defined in 45 C.F.R. § 160.103, including electronic protected health information, that BloomRCM creates, receives, maintains, or transmits on behalf of Customer under the Agreement.',
          },
          {
            term: 'The Agreement',
            def: 'The BloomAR Manager Terms of Service, together with any applicable order form or subscription agreement and this BAA.',
          },
          {
            term: 'Individual',
            def: 'A natural person who is the subject of PHI, including a patient, subscriber, or guarantor.',
          },
          {
            term: 'Secretary',
            def: 'The Secretary of the U.S. Department of Health and Human Services ("HHS"), or the Secretary\u2019s designee, including the Office for Civil Rights.',
          },
          {
            term: 'Security Incident',
            def: 'As defined in 45 C.F.R. § 164.304: the attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations in an information system.',
          },
          {
            term: 'Breach',
            def: 'As defined in 45 C.F.R. § 164.402: the acquisition, access, use, or disclosure of unsecured PHI in a manner not permitted by the Privacy Rule that compromises the security or privacy of the PHI, subject to the exclusions in that section.',
          },
          {
            term: 'Unsecured PHI',
            def: 'PHI that has not been rendered unusable, unreadable, or indecipherable to unauthorized persons through a technology or methodology specified in HHS guidance under 45 C.F.R. § 164.402.',
          },
          {
            term: 'Subcontractor',
            def: 'A person or entity to whom BloomRCM delegates a function, activity, or service involving PHI, other than a member of BloomRCM\u2019s workforce.',
          },
          {
            term: 'Minimum Necessary',
            def: 'The standard in 45 C.F.R. § 164.502(b) and § 164.514(d), as applied to BloomRCM\u2019s use, disclosure, and requests for PHI.',
          },
        ],
      },
      { type: 'h2', text: 'Permitted uses and disclosures' },
      {
        type: 'p',
        text: 'BloomRCM may use and disclose PHI only as follows, and only to the extent necessary to perform its obligations under the Agreement:',
      },
      {
        type: 'ol',
        items: [
          'To provide the Service to Customer, including storing and retrieving records, executing workflow operations Customer initiates, generating reports and exports that Customer requests, performing document text extraction on files Customer uploads, and computing derived workflow values such as aging buckets, denial-category suggestions, and priority indicators.',
          'To perform BloomRCM\u2019s obligations under the Agreement, including support, troubleshooting, security monitoring, backup, disaster recovery, and quality assurance.',
          'As required by law, provided BloomRCM complies with Section 6, Reporting impermissible uses and disclosures.',
          'For BloomRCM\u2019s proper management and administration and to carry out BloomRCM\u2019s legal responsibilities, subject to the conditions in 45 C.F.R. § 164.504(e)(4) — that is, only where the disclosure is required by law, or where BloomRCM obtains reasonable assurances in writing from the recipient that the information will be held confidentially, used and disclosed only for the purpose for which it was disclosed, and that any further breach will be reported to BloomRCM.',
          'To a Subcontractor in accordance with Section 8.',
          'As directed by Customer in writing.',
        ],
      },
      {
        type: 'p',
        text: 'BloomRCM may also create and use de-identified information in accordance with 45 C.F.R. § 164.514(b), provided it does not re-identify that information and does not attempt to contact any Individual based on it. Where Customer permits, BloomRCM may use a limited data set for public-health, research, or operational purposes only under a data use agreement meeting 45 C.F.R. § 164.514(e).',
      },
      { type: 'h2', text: 'Actual capabilities of the Service' },
      {
        type: 'p',
        text: 'So that Customer can evaluate whether the Service meets its needs, the following describes what BloomAR Manager actually does today. These statements are factual descriptions of the implementation, not compliance representations.',
      },
      {
        type: 'dl',
        items: [
          {
            term: 'Data stored',
            def: 'Claims, claim status history, notes, patient and subscriber identifiers, payer data, charges, payments and allocations, remittance (ERA/835) transactions, authorization and referral records, coding requests, tasks, sign-offs, chat messages, notifications, e-signature records, OCR field-extraction results, and uploaded documents held as encoded file data in the database. Customers should avoid uploading documents that are not needed for the billing workflow.',
          },
          {
            term: 'Isolation between customers',
            def: 'Every operational record is bound to an organization identifier. Server-side authorization checks every request against the signed-in user\u2019s active organization membership. PostgreSQL row-level security is enabled on operational tables as defense in depth. Platform administration functions are separated and expose workspace metadata only — not claim, patient, or clinical records.',
          },
          {
            term: 'Access control',
            def: 'Organization-scoped roles (owner, admin, billing manager, billing specialist, AR specialist, and read-only) are enforced server-side. Read-only members cannot perform mutating operations. Suspended workspaces are blocked from operational endpoints.',
          },
          {
            term: 'Authentication',
            def: 'Bcrypt password hashing, optional TOTP multi-factor authentication with encrypted secrets and hashed recovery codes, per-session identifiers with server-side revocation, an 8-hour server-side idle timeout, and a 7-day absolute session lifetime. Single sign-on (SAML/OIDC) is not currently offered.',
          },
          {
            term: 'Encryption',
            def: 'TLS protects data in transit between the browser, the application, and the database. Encryption at rest is provided at the storage layer by the managed hosting and database providers. Application-level field encryption is used for TOTP secrets only; other fields, including identifiers, are not field-level encrypted. {{CONFIRM: confirm and document the providers\u2019 at-rest encryption, key management, and backup encryption configuration before representing specific encryption standards to a customer}} ',
          },
          {
            term: 'Audit controls',
            def: 'Authentication events, administrative changes, workflow transitions, document uploads, payment postings, and coding edits are written to an organization-scoped audit log with user, role, timestamp, IP address, and user-agent where available. Credentials and high-risk identifiers are redacted before storage. Audit logs are available to organization administrators and are exportable.',
          },
          {
            term: 'Automated analysis features',
            def: 'Denial analysis maps claim denial codes and claim context to likely reasons and suggested next actions using deterministic rules and a CARC/RARC code catalog. Document intake extracts fields from uploaded text using pattern matching. Neither feature transmits PHI to a third-party generative artificial-intelligence provider in the current implementation. Any future change to that would require a new subprocessor disclosure and a business associate agreement covering that provider before the feature is enabled for PHI.',
          },
          {
            term: 'Not provided',
            def: 'The Service does not currently provide: automated retention or purge workflows; a self-serve full-organization export of every record type; single sign-on; hardware security key support; customer-managed encryption keys; or a documented business-continuity test report. Customer must plan its own retention, export, and contingency procedures accordingly.',
          },
        ],
      },
      { type: 'h2', text: 'Prohibited uses and disclosures' },
      {
        type: 'p',
        text: 'BloomRCM will not:',
      },
      {
        type: 'ul',
        items: [
          'Use or disclose PHI in a manner that would violate Subpart E of 45 C.F.R. Part 164 if done by a covered entity, except as permitted by Section 3.',
          'Use or disclose PHI for its own marketing, advertising, sale, or fundraising purposes, or in exchange for remuneration.',
          'Use or disclose PHI for underwriting or eligibility determinations, or in a manner that would constitute a sale of PHI under 45 C.F.R. § 164.502(a)(5)(ii).',
          'Use PHI to train, fine-tune, or improve any machine-learning model outside Customer\u2019s own workspace, or transmit PHI to a third party for that purpose.',
          'De-identify PHI and use or disclose it for its own purposes except as permitted by Section 3, or attempt to re-identify de-identified data.',
          'Access PHI except as necessary to perform its obligations or as required by law.',
          'Disclose PHI to a Subcontractor except as permitted by Section 8.',
        ],
      },
      { type: 'h2', text: 'Obligations of the business associate' },
      { type: 'h3', text: 'Safeguards' },
      {
        type: 'p',
        text: 'BloomRCM will implement and maintain administrative, physical, and technical safeguards that reasonably and appropriately protect the confidentiality, integrity, and availability of the electronic PHI it creates, receives, maintains, or transmits on behalf of Customer, in accordance with 45 C.F.R. § 164.308 (administrative safeguards), § 164.310 (physical safeguards), and § 164.312 (technical safeguards), and will comply with Subpart C of Part 164 as it applies to a business associate. The implemented controls are described in Section 4 and in BloomRCM\u2019s published security documentation.',
      },
      {
        type: 'p',
        text: 'BloomRCM will review and modify its safeguards as needed to continue to provide reasonable and appropriate protection, and will maintain written security policies and procedures as required by 45 C.F.R. § 164.316. BloomRCM will conduct a security risk analysis of its own environment as required by 45 C.F.R. § 164.308(a)(1)(ii)(A); that analysis addresses BloomRCM\u2019s own systems and does not replace Customer\u2019s risk analysis obligations. {{CONFIRM: state the date of the most recent completed security risk analysis and whether a remediation plan is documented — a customer\u2019s procurement process will ask for this}}',
      },
      { type: 'h3', text: 'Minimum necessary' },
      {
        type: 'p',
        text: 'BloomRCM will make reasonable efforts to use, disclose, and request only the minimum amount of PHI necessary to accomplish the intended purpose, in accordance with 45 C.F.R. § 164.502(b) and § 164.514(d). Customer is responsible for determining what is minimum necessary for its own workflows, for limiting what it uploads, and for configuring user roles so that each Authorized User sees only what their function requires.',
      },
      { type: 'h3', text: 'Reporting impermissible uses and disclosures' },
      {
        type: 'p',
        text: 'BloomRCM will report to Customer, without unreasonable delay and in no case later than five business days after discovery, any use or disclosure of PHI that is not permitted by this BAA or by the Privacy Rule, of which BloomRCM becomes aware. Where the impermissible use or disclosure constitutes a Breach of Unsecured PHI, Section 7 governs timing and content, and the Breach notification requirements of 45 C.F.R. § 164.410 control.',
      },
      { type: 'h3', text: 'Reporting security incidents' },
      {
        type: 'p',
        text: 'BloomRCM will report to Customer any Security Incident involving electronic PHI of which it becomes aware. The parties acknowledge that this obligation applies to actual Security Incidents and, consistent with 45 C.F.R. § 164.314(a)(2)(i)(C), that attempted but unsuccessful unauthorized access, use, disclosure, modification, or destruction — such as routine pings, port scans, or blocked brute-force attempts — do not require individual reporting unless they result in actual compromise. BloomRCM will maintain a log of such unsuccessful attempts and make a summary available to Customer on request, and will report any incident that results in or reasonably appears to have resulted in unauthorized access to PHI.',
      },
      { type: 'h3', text: 'Mitigation' },
      {
        type: 'p', 
        text: 'BloomRCM will mitigate, to the extent practicable, any harmful effect known to it that results from a use or disclosure of PHI in violation of this BAA or the Privacy Rule, as required by 45 C.F.R. § 164.530(f) as applied to a business associate.',
      },
      { type: 'h3', text: 'Compliance with law and assistance' },
      {
        type: 'p',
        text: 'BloomRCM will comply with applicable requirements of the Privacy Rule, the Security Rule, and the Breach Notification Rule that apply to it as a business associate, and will carry out its obligations under this BAA in compliance with those rules. BloomRCM will comply with any additional restriction on the use or disclosure of PHI that Customer is required to impose under 45 C.F.R. § 164.522 or applicable state law, provided Customer notifies BloomRCM in writing of the restriction before it applies and the Service is capable of honoring it; if it is not, the parties will discuss an appropriate arrangement.',
      },
      { type: 'h3', text: 'Workforce and access management' },
      {
        type: 'p',
        text: 'BloomRCM will ensure that its workforce members who handle PHI are trained on its privacy and security policies, are subject to confidentiality obligations, and have access to PHI only as necessary to perform their duties. BloomRCM will maintain a sanctions policy for workforce members who violate its policies.',
      },
      { type: 'h2', text: 'Breach notification' },
      {
        type: 'p',
        text: 'Following the discovery of a Breach of Unsecured PHI, BloomRCM will notify Customer without unreasonable delay and in no case later than 60 calendar days after discovery, consistent with 45 C.F.R. § 164.410. Discovery is deemed to occur on the first day the Breach is known or by exercising reasonable diligence would have been known to BloomRCM or, where applicable, to any of its Subcontractors.',
      },
      {
        type: 'p',
        text: 'The notification will include, to the extent known: the identification of each Individual whose Unsecured PHI was or is reasonably believed to have been acquired, accessed, used, or disclosed; a description of what happened, including the date of the Breach and the date of discovery; the types of Unsecured PHI involved (for example name, member identifier, date of service, diagnosis code, charge amount); the steps Individuals should take to protect themselves; a brief description of what BloomRCM is doing to investigate, mitigate, and prevent recurrence; and contact information for questions.',
      },
      {
        type: 'p',
        text: 'BloomRCM will supplement an initial notification if additional information becomes available, and will provide updates as reasonably requested while the investigation proceeds. BloomRCM will coordinate with Customer on the timing and content of any notice to Individuals, HHS, or the media, and will not make a public statement identifying Customer without Customer\u2019s prior consent unless required by law. As between the parties, Customer is responsible for notifying affected Individuals, HHS, and the media as required by 45 C.F.R. §§ 164.400–414, and for determining whether the Breach constitutes a reportable event. BloomRCM will bear the reasonable costs of its own investigation, remediation, and notice content preparation; liability for the Breach itself is allocated under the Agreement.',
      },
      {
        type: 'p',
        text: 'BloomRCM maintains an incident-response procedure that addresses identification, containment, eradication, recovery, and post-incident review. {{CONFIRM: document the incident-response plan and the names of the Security Officer and Privacy Officer, since 45 C.F.R. § 164.308(a)(2) requires a designated security official and customers will ask for this}}',
      },
      { type: 'h2', text: 'Subcontractors' },
      {
        type: 'p',
        text: 'BloomRCM may disclose PHI to a Subcontractor only in accordance with 45 C.F.R. § 164.502(e)(1)(ii) and § 164.504(e)(2)(ii)(D). BloomRCM will enter into a written agreement with each Subcontractor that creates, receives, maintains, or transmits PHI on BloomRCM\u2019s behalf, and that agreement will:',
      },
      {
        type: 'ul',
        items: [
          'Describe the permitted and required uses and disclosures of PHI, consistent with this BAA and requiring the Subcontractor to use or disclose PHI only as permitted by this BAA or as required by law.',
          'Require the Subcontractor to implement reasonable and appropriate safeguards for electronic PHI, consistent with 45 C.F.R. §§ 164.308, 164.310, and 164.312.',
          'Require the Subcontractor to report Security Incidents and Breaches to BloomRCM without unreasonable delay.',
          'Require the Subcontractor to comply with the applicable requirements of the Privacy Rule that apply to it, and to make its internal practices, books, and records available to the Secretary for compliance determination.',
          'Require the Subcontractor to return or destroy PHI at termination where feasible, and to extend protections where it is not.',
          'Impose on the Subcontractor the same restrictions and conditions that apply to BloomRCM under this BAA.',
        ],
      },
      {
        type: 'p',
        text: 'The Subcontractors that may handle PHI as part of the Service are the managed hosting provider, the managed PostgreSQL database provider, and any configured transactional email provider. Payment processing is handled by Stripe and does not receive PHI. BloomRCM remains responsible for its Subcontractors\u2019 performance of these obligations. BloomRCM will notify Customer before engaging a new Subcontractor that will handle PHI, giving at least 30 days\u2019 opportunity to object on reasonable grounds.',
      },
      { type: 'h2', text: 'Individual rights' },
      { type: 'h3', text: 'Access' },
      {
        type: 'p',
        text: 'BloomRCM will make PHI available to Customer, and will make any PHI in its possession available to an Individual, in the form and format requested, as necessary for Customer to meet its obligations under 45 C.F.R. § 164.524. Self-serve exports and record views satisfy most requests. Where an Individual requests access and BloomRCM receives the request directly, BloomRCM will refer the request to Customer within five business days and will not respond to the Individual without Customer\u2019s written instruction, unless required by law.',
      },
      { type: 'h3', text: 'Amendment' },
      {
        type: 'p',
        text: 'BloomRCM will make PHI available to Customer for amendment and will incorporate any amendment or record of the amendment as directed by Customer, as necessary for Customer to meet its obligations under 45 C.F.R. § 164.526. Records created by the Service may be edited by Authorized Users with appropriate permissions; amendment history is preserved in the audit log and status history where the record type supports it.',
      },
      { type: 'h3', text: 'Accounting of disclosures' },
      {
        type: 'p',
        text: 'BloomRCM will maintain and make available the information necessary for Customer to provide an accounting of disclosures of PHI as required by 45 C.F.R. § 164.528. This includes information collected by the Service\u2019s audit log, which records user, role, action, entity, IP address, user-agent, and timestamp for covered events. Customer acknowledges that the audit log is designed for security oversight and operational accountability, and that it may not capture every disclosure in the exact form required for an accounting; BloomRCM will cooperate in reconstructing a complete accounting from available records and will provide additional detail on request.',
      },
      { type: 'h3', text: 'Restrictions and confidential communications' },
      {
        type: 'p',
        text: 'BloomRCM will support Customer in honoring a restriction on use or disclosure agreed to under 45 C.F.R. § 164.522(a) and a request for confidential communications under § 164.522(b), to the extent the Service supports the restriction. Customer must notify BloomRCM of a restriction that affects how records in the Service may be used.',
      },
      { type: 'h2', text: 'HHS access, audit, and compliance cooperation' },
      {
        type: 'p',
        text: 'BloomRCM will make its internal practices, books, and records relating to the use and disclosure of PHI available to the Secretary for purposes of determining Customer\u2019s and BloomRCM\u2019s compliance with the Privacy Rule and the Security Rule, as required by 45 C.F.R. § 164.504(e)(2)(ii)(H). Nothing in this Section obligates BloomRCM to make available information that would compromise the security of other customers\u2019 data; BloomRCM may satisfy a request by providing masked, aggregated, or redacted records where the requested information concerns other customers, and will inform the Secretary of the reason for any redaction.',
      },
      {
        type: 'p',
        text: 'BloomRCM will cooperate with Customer and with HHS in any investigation, audit, or compliance review relating to PHI, and will provide reasonable assistance and documentation.',
      },
      { type: 'h2', text: 'Documentation and record retention' },
      {
        type: 'p',
        text: 'BloomRCM will maintain the documentation required by 45 C.F.R. § 164.316 and, as a business associate, will maintain the documentation of its policies, procedures, and actions relevant to this BAA for six years from the date of the last effective date of a document or the date last in effect, whichever is later, consistent with 45 C.F.R. § 164.530(j) as applied to a business associate.',
      },
      {
        type: 'p',
        text: 'Where the documentation relates to PHI or to Customer\u2019s systems, BloomRCM will make it available to Customer on request. Customer is responsible for its own six-year documentation retention and for retaining such records after termination.',
      },
      { type: 'h2', text: 'Return or destruction of protected health information' },
      {
        type: 'p',
        text: 'Upon termination of the Agreement for any reason, or otherwise upon Customer\u2019s written request, BloomRCM will, if feasible, return or destroy all PHI received from Customer, or created, maintained, or received by BloomRCM on Customer\u2019s behalf, that BloomRCM still maintains in any form, and will retain no copies.',
      },
      {
        type: 'p',
        text: 'In practice, this means: for 30 days after termination, Customer may export its records and request a full export; after that window, BloomRCM will delete PHI from live systems upon Customer\u2019s written request or through its documented termination procedure; and encrypted backup copies are deleted on the normal backup rotation and are not otherwise restored. BloomRCM does not currently run an automated purge job, so deletion from live systems is performed through an operator procedure and confirmed in writing to Customer within 30 days of the request.',
      },
      { type: 'h2', text: 'PHI that cannot reasonably be returned or destroyed' },
      {
        type: 'p',
        text: 'If return or destruction of PHI is not feasible — for example where PHI is contained in encrypted backups pending rotation, in security and audit logs that must be retained for six years, or in records subject to a legal hold — BloomRCM will: (a) extend the protections of this BAA to that PHI for as long as it is maintained; (b) limit further use and disclosure of it to the purposes that make return or destruction infeasible; and (c) destroy the PHI when destruction becomes feasible. BloomRCM will identify the categories of retained PHI and the reason for retention in writing to Customer on request.',
      },
      { type: 'h2', text: 'Permitted disclosures to management and administration' },
      {
        type: 'p',
        text: 'BloomRCM may use PHI for its own proper management and administration, and may disclose PHI for those purposes to a third party, only as permitted by 45 C.F.R. § 164.504(e)(4). That is: the disclosure must be required by law; or BloomRCM must obtain reasonable written assurances from the recipient that the PHI will be held confidentially, used and disclosed only for the purposes for which it was disclosed, and that the recipient will report any breach of confidentiality to BloomRCM. BloomRCM will not disclose PHI for its own business purposes beyond what those provisions allow.',
      },
      { type: 'h2', text: 'Term, termination, and material breach' },
      {
        type: 'p',
        text: 'This BAA takes effect on the earlier of the date it is executed and the date Customer first submits PHI, and remains in effect until the Agreement terminates and all PHI is returned or destroyed under Sections 13 and 14.',
      },
      {
        type: 'p',
        text: 'If BloomRCM materially breaches this BAA, Customer may terminate the Agreement immediately upon written notice if BloomRCM has not cured the breach within 30 days of receiving written notice describing it, except that Customer may terminate immediately if cure is not possible. If termination of the Agreement is not feasible, Customer will report the breach to the Secretary, as provided in 45 C.F.R. § 164.504(e)(1)(ii).',
      },
      {
        type: 'p',
        text: 'If Customer materially breaches this BAA or the Privacy Rule in a way that exposes BloomRCM to liability, BloomRCM may suspend processing or terminate the Agreement as provided in the Terms of Service. Suspension for a privacy or security emergency may be immediate where necessary to prevent an ongoing impermissible use or disclosure.',
      },
      { type: 'h2', text: 'Interpretation, precedence, and amendment' },
      {
        type: 'p',
        text: 'This BAA is intended to comply with 45 C.F.R. §§ 164.314(a) and 164.504(e) and will be interpreted consistently with those provisions. Where this BAA conflicts with the Terms of Service, the Data Processing Agreement, or any other document regarding PHI, this BAA controls. Where this BAA conflicts with a requirement of HIPAA, HIPAA controls, and BloomRCM will be deemed to have amended this BAA to the minimum extent necessary to comply.',
      },
      {
        type: 'p',
        text: 'The parties may amend this BAA in writing. BloomRCM may amend it unilaterally to the extent necessary to comply with a change in law or regulation, by giving Customer at least 30 days\u2019 written notice; Customer may object in writing before the amendment takes effect, and if the parties cannot agree, Customer may terminate under Section 15.',
      },
      {
        type: 'p',
        text: 'This BAA is governed by the law of the State of [[GOVERNING_STATE]], except that the interpretation and performance of HIPAA obligations are governed by federal law. Nothing in this BAA creates rights in any Individual or third party.',
      },
      { type: 'h2', text: 'Effective date and signature' },
      {
        type: 'p',
        text: 'This BAA is effective as of the date of the last signature below. By signing, each party represents that it has authority to bind its organization, and Customer represents that it has identified the PHI it intends to submit and determined that BloomRCM\u2019s capabilities in Section 4 are appropriate for that PHI.',
      },
      {
        type: 'signatures',
        parties: [
          {
            role: 'Covered Entity / Business Associate (Customer)',
            rows: [
              'Organization: ______________________________',
              'Signature: ______________________________',
              'Name: ______________________________',
              'Title: ______________________________',
              'Address: ______________________________',
              'Email: ______________________________',
              'Date: ______________________________',
            ],
          },
          {
            role: 'Business Associate (BloomRCM)',
            rows: [
              `Entity: ${entityFullName(E)}`,
              'Signature: ______________________________',
              'Name: ______________________________',
              'Title: ______________________________',
              `Address: ${postalAddressOneLine(E)}`,
              'Email: [[LEGAL_NOTICES_EMAIL]]',
              'Date: ______________________________',
            ],
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'How to execute this agreement',
        text:
          'Email [[LEGAL_NOTICES_EMAIL]] to request a countersigned copy. BloomRCM will return a fully executed version, record the execution date, and enable the HIPAA workflow features your plan includes. Keep the executed copy with your HIPAA documentation for six years.',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: 'Remaining pre-execution requirements',
        text:
          'Before this BAA is signed with a real customer, the items marked for confirmation in Sections 4 and 6 must be completed: the encryption configuration of the hosting and database providers, the date of the most recent security risk analysis, the incident-response procedure, and the named Security and Privacy Officers. Counsel should also confirm that the five-business-day reporting window and the 30-day cure period match BloomRCM\u2019s actual operational capacity to meet them.',
      },
    ],
  };
}
