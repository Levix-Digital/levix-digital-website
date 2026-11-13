import { CONSENT_VERSION, availabilityStrings } from '@levix/i18n'
import { describe, expect, it } from 'vitest'
import { CONSENT_TEXTS, consentText } from './consent'

describe('consent', () => {
  it('keeps the wording the form shows today under its version', () => {
    expect(CONSENT_TEXTS[CONSENT_VERSION]).toBe(availabilityStrings['signup.consent'])
  })

  it('names the product in the stored wording', () => {
    expect(consentText(CONSENT_VERSION, 'Gedo')).toContain('release candidates of Gedo.')
    expect(consentText('1999-01-01', 'Gedo')).toBeUndefined()
  })
})
