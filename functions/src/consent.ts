/**
 * Every consent wording the signup form has shown, by version, so each subscription keeps the exact text it was
 * given with (CASL proof of consent). The current one equals `signup.consent` of `@levix/i18n` (checked by a test).
 */
export const CONSENT_TEXTS: Readonly<Record<string, string>> = {
  '2026-11-13':
    'I agree to receive emails from Levix Digital Inc. about release candidates of {product}. I can withdraw my consent at any time with the unsubscribe link in every email.',
}

/** The consent wording of a version for a product, or undefined for an unknown version. */
export function consentText(version: string, productName: string): string | undefined {
  return CONSENT_TEXTS[version]?.replaceAll('{product}', productName)
}
