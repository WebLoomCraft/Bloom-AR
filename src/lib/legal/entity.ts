/**
 * Business identity used across every legal document, the site footer, and the
 * /legal index.
 *
 * NOTHING here is invented. Any value that has not been supplied by the
 * operating business renders as a clearly flagged placeholder such as
 * [[LEGAL_ENTITY_NAME]] instead of a plausible-looking fake detail.
 *
 * Operators set these in the hosting environment (Vercel → Settings →
 * Environment Variables) and redeploy. They can also be supplied through the
 * `site_settings` document by a platform administrator for support contacts.
 */

const clean = (raw: string | undefined): string | null => {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (!v || /^(todo|tbd|change[-_ ]?me|example|xxx+)$/i.test(v)) return null;
  return v;
};

const env = (key: string): string | null => clean(process.env[key]);

export const BUSINESS_UNKNOWN = 'unknown' as const;

export interface LegalEntity {
  /** Registered legal name of the operating company, e.g. "Acme Health Systems, Inc." */
  legalName: string;
  /** Tradename used for the product, e.g. "BloomAR Manager" */
  dba: string;
  /** Street address for legal notices */
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  /** Registered agent / state of incorporation, if any */
  incorporationState: string;
  /** Public support channel */
  supportEmail: string;
  supportPhone: string;
  /** Privacy-rights contact (access/deletion requests) */
  privacyEmail: string;
  /** Security incident / vulnerability reporting contact */
  securityEmail: string;
  /** Legal notices, subpoenas, litigation hold */
  legalEmail: string;
  /** State whose law governs the Terms and DPA */
  governingState: string;
  /** County/venue placeholder, if the entity specifies one */
  venue: string;
  /** Optional website root used in notices */
  website: string;
}

const PLACEHOLDER = (name: string) => `[[${name}]]`;

export const LEGAL_ENTITY: LegalEntity = {
  legalName: env('LEGAL_ENTITY_NAME') ?? PLACEHOLDER('LEGAL_ENTITY_NAME'),
  dba: env('LEGAL_DBA') ?? 'BloomAR Manager',
  addressLine1: env('LEGAL_ADDRESS_LINE1') ?? PLACEHOLDER('LEGAL_ADDRESS_LINE1'),
  addressLine2: env('LEGAL_ADDRESS_LINE2'),
  city: env('LEGAL_CITY') ?? PLACEHOLDER('LEGAL_CITY'),
  region: env('LEGAL_REGION') ?? PLACEHOLDER('LEGAL_REGION'),
  postalCode: env('LEGAL_POSTAL_CODE') ?? PLACEHOLDER('LEGAL_POSTAL_CODE'),
  country: env('LEGAL_COUNTRY') ?? 'United States',
  incorporationState: env('LEGAL_INCORPORATION_STATE') ?? PLACEHOLDER('LEGAL_INCORPORATION_STATE'),
  supportEmail:
    env('LEGAL_SUPPORT_EMAIL') ?? env('NEXT_PUBLIC_SUPPORT_EMAIL') ?? PLACEHOLDER('SUPPORT_EMAIL'),
  supportPhone:
    env('LEGAL_SUPPORT_PHONE') ?? env('NEXT_PUBLIC_SUPPORT_PHONE') ?? PLACEHOLDER('SUPPORT_PHONE'),
  privacyEmail: env('LEGAL_PRIVACY_EMAIL') ?? PLACEHOLDER('PRIVACY_EMAIL'),
  securityEmail: env('LEGAL_SECURITY_EMAIL') ?? PLACEHOLDER('SECURITY_EMAIL'),
  legalEmail: env('LEGAL_NOTICES_EMAIL') ?? PLACEHOLDER('LEGAL_NOTICES_EMAIL'),
  governingState: env('LEGAL_GOVERNING_STATE') ?? PLACEHOLDER('GOVERNING_STATE'),
  venue: env('LEGAL_VENUE') ?? PLACEHOLDER('VENUE_COUNTY'),
  website: env('NEXT_PUBLIC_APP_URL') ?? 'bloomar.example',
};

/** Full legal name followed by the product name, e.g. "Acme, Inc. d/b/a BloomAR Manager". */
export function entityFullName(entity: LegalEntity = LEGAL_ENTITY): string {
  return `${entity.legalName} d/b/a ${entity.dba}`;
}

/** Single-line postal address used in notices and the footer. */
export function postalAddressLines(entity: LegalEntity = LEGAL_ENTITY): string[] {
  const second = [entity.city, entity.region, entity.postalCode].filter(Boolean).join(', ');
  return [entity.addressLine1, entity.addressLine2, second, entity.country].filter(
    (line): line is string => Boolean(line)
  );
}

export function postalAddressOneLine(entity: LegalEntity = LEGAL_ENTITY): string {
  return postalAddressLines(entity).join(', ');
}

/** True when any business-identity value is still a placeholder. */
export function missingBusinessInfo(entity: LegalEntity = LEGAL_ENTITY): string[] {
  const fields: Array<[string, string]> = [
    ['legal name', entity.legalName],
    ['street address', entity.addressLine1],
    ['city', entity.city],
    ['state/region', entity.region],
    ['postal code', entity.postalCode],
    ['state of incorporation', entity.incorporationState],
    ['support email', entity.supportEmail],
    ['support phone', entity.supportPhone],
    ['privacy email', entity.privacyEmail],
    ['security email', entity.securityEmail],
    ['legal notices email', entity.legalEmail],
    ['governing law state', entity.governingState],
    ['venue county', entity.venue],
  ];
  return fields.filter(([, v]) => v.includes('[[')).map(([k]) => k);
}
