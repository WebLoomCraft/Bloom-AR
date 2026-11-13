import { LEGAL_ENTITY, type LegalEntity } from './entity.ts';

/**
 * Replaces the business-identity tokens that appear across the documents with
 * values from the environment.
 *
 * A token whose value has not been configured stays in place, so the rendered
 * page shows an obviously unfinished `[[TOKEN]]` rather than a plausible fake
 * detail. This is deliberate: a legal agreement must never invent an address,
 * an email, or a governing-law state.
 */
const TOKEN_MAP: Record<string, keyof LegalEntity> = {
  '[[LEGAL_ENTITY_NAME]]': 'legalName',
  '[[LEGAL_DBA]]': 'dba',
  '[[LEGAL_ADDRESS_LINE1]]': 'addressLine1',
  '[[LEGAL_ADDRESS_LINE2]]': 'addressLine2',
  '[[LEGAL_CITY]]': 'city',
  '[[LEGAL_REGION]]': 'region',
  '[[LEGAL_POSTAL_CODE]]': 'postalCode',
  '[[LEGAL_COUNTRY]]': 'country',
  '[[LEGAL_INCORPORATION_STATE]]': 'incorporationState',
  '[[SUPPORT_EMAIL]]': 'supportEmail',
  '[[SUPPORT_PHONE]]': 'supportPhone',
  '[[PRIVACY_EMAIL]]': 'privacyEmail',
  '[[SECURITY_EMAIL]]': 'securityEmail',
  '[[LEGAL_NOTICES_EMAIL]]': 'legalEmail',
  '[[GOVERNING_STATE]]': 'governingState',
  '[[VENUE_COUNTY]]': 'venue',
  '[[WEBSITE]]': 'website',
};

/**
 * Tokens whose value is genuinely optional (a second address line, a phone
 * number, a DBA that duplicates the legal name). When these are unconfigured
 * they are removed rather than left on the page, so the reader is never shown a
 * bracket that has no answer. No optional token appears in a signature block or
 * anywhere a blank value would change the meaning of the clause.
 */
const OPTIONAL_TOKENS = new Set(['[[LEGAL_ADDRESS_LINE2]]']);

export function resolveEntityTokens(
  text: string,
  entity: LegalEntity = LEGAL_ENTITY
): string {
  // Resolve longest tokens first so [[LEGAL_ADDRESS_LINE1]] is never clipped.
  const tokens = Object.keys(TOKEN_MAP).sort((a, b) => b.length - a.length);
  let out = text;
  for (const token of tokens) {
    const value = entity[TOKEN_MAP[token]];
    if (typeof value === 'string' && value && !value.includes('[[')) {
      out = out.split(token).join(value);
    }
  }
  // Drop optional tokens that have no configured value, then tidy the
  // punctuation/whitespace they leave behind (e.g. an empty address line).
  for (const token of OPTIONAL_TOKENS) {
    if (out.includes(token)) out = out.split(token).join('\u0000');
  }
  if (out.includes('\u0000')) {
    out = out
      .split('\n')
      .map((line) => (line.includes('\u0000') ? line.replace(/\u0000/g, '').replace(/\s+$/, '') : line))
      .filter((line) => line.trim() !== '')
      .join('\n');
  }
  return out;
}

/** Applies token resolution across every string in an arbitrary structure. */
export function resolveDeep<T>(value: T, entity: LegalEntity = LEGAL_ENTITY): T {
  if (typeof value === 'string') return resolveEntityTokens(value, entity) as unknown as T;
  if (Array.isArray(value))
    return (value as unknown[])
      .map((v) => resolveDeep(v, entity))
      .filter((v) => !(typeof v === 'string' && v.trim() === '')) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveDeep(v, entity);
    }
    return out as T;
  }
  return value;
}
