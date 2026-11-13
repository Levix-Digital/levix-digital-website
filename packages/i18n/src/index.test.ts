import { describe, expect, it } from 'vitest'
import { CONSENT_VERSION, SOURCE_LANGUAGE, availabilityStrings, layoutStrings } from './index'

describe('@levix/i18n', () => {
  it('uses English as the source language', () => {
    expect(SOURCE_LANGUAGE).toBe('en')
  })

  it('has the text of the shared layout, none of it empty', () => {
    expect(Object.keys(layoutStrings).sort()).toEqual(
      [
        'layout.by',
        'layout.contact',
        'layout.menu',
        'layout.nav',
        'layout.products',
        'layout.skip',
        'theme.dark',
        'theme.legend',
        'theme.light',
        'theme.system',
      ].sort(),
    )
    for (const text of Object.values(layoutStrings)) expect(text.trim()).not.toBe('')
  })
})

describe('availability strings', () => {
  it('has a label for each status and none of the text is empty', () => {
    for (const status of ['available', 'preview', 'in-development']) {
      expect(availabilityStrings[`availability.status.${status}` as keyof typeof availabilityStrings]).toBeTruthy()
      expect(availabilityStrings[`availability.note.${status}` as keyof typeof availabilityStrings]).toContain('{product}')
    }
    for (const text of Object.values(availabilityStrings)) expect(text.trim()).not.toBe('')
  })

  it('states purpose, sender and withdrawal in the consent wording (CASL)', () => {
    const consent = availabilityStrings['signup.consent']
    expect(consent).toContain('Levix Digital Inc.')
    expect(consent).toContain('release candidates of {product}')
    expect(consent).toContain('withdraw my consent at any time')
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
