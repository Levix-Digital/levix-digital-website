import { describe, expect, it } from 'vitest'
import { isValidEmail, normalizeEmail, validateSignup } from './validation'

const body = { email: ' Ana@Example.COM ', product: 'gedo', consent: true, consentVersion: '2026-11-13', page: 'https://gedo.levix.digital/', website: '' }

describe('validateSignup', () => {
  it('accepts a complete request and keeps the consent wording shown', () => {
    const result = validateSignup(body)
    expect(result).toEqual({
      kind: 'valid',
      request: {
        email: 'ana@example.com',
        product: 'gedo',
        consentVersion: '2026-11-13',
        consentText: expect.stringContaining('release candidates of Gedo'),
        page: 'https://gedo.levix.digital/',
      },
    })
  })

  it.each([
    [{ ...body, email: 'not-an-address' }, ['email']],
    [{ ...body, email: undefined }, ['email']],
    [{ ...body, consent: false }, ['consent']],
    [{ ...body, consent: 'true' }, ['consent']],
    [{ ...body, consentVersion: '1999-01-01' }, ['consent']],
    [{ ...body, product: 'home' }, ['product', 'consent']],
    [null, ['email', 'product', 'consent']],
  ])('names what is wrong', (input, fields) => {
    expect(validateSignup(input)).toEqual({ kind: 'invalid', fields })
  })

  it('treats a filled honeypot as a bot', () => {
    expect(validateSignup({ ...body, website: 'https://spam.example' })).toEqual({ kind: 'bot' })
  })

  it('falls back to the product site when the page is not an https address', () => {
    const result = validateSignup({ ...body, page: 'javascript:alert(1)' })
    expect(result.kind === 'valid' && result.request.page).toBe('https://gedo.levix.digital')
  })
})

describe('email addresses', () => {
  it.each(['a@b.co', 'first.last+tag@sub.example.org'])('accepts %s', (email) => expect(isValidEmail(email)).toBe(true))
  it.each(['a@b', 'a b@c.co', '@b.co', 'a@.co', `${'a'.repeat(250)}@b.co`])('refuses %s', (email) =>
    expect(isValidEmail(email)).toBe(false),
  )
  it('normalizes case and spaces', () => expect(normalizeEmail('  A@B.Co ')).toBe('a@b.co'))
})
