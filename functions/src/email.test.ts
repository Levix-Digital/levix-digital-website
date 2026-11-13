import { describe, expect, it } from 'vitest'
import { confirmationEmail } from './email'
import { PRODUCTS } from './products'
import { testSender as sender } from './test-support'

describe('confirmationEmail', () => {
  const now = new Date('2026-11-13T12:00:00Z')
  const mail = confirmationEmail({ to: 'ana@example.com', product: PRODUCTS.gedo, confirmToken: 'c.t', unsubscribeToken: 'u.t', sender, now })

  it('names the product and links to its confirmation page', () => {
    expect(mail.to).toBe('ana@example.com')
    expect(mail.from).toBe(sender.from)
    expect(mail.message.subject).toBe('Confirm: Gedo release candidates from Levix Digital')
    expect(mail.message.text).toContain('https://gedo.levix.digital/subscription/confirm#c.t')
    expect(mail.message.html).toContain('href="https://gedo.levix.digital/subscription/confirm#c.t"')
  })

  it('identifies the sender and carries the unsubscribe link in both bodies and the header (CASL)', () => {
    for (const body of [mail.message.text, mail.message.html]) {
      expect(body).toContain('Levix Digital Inc., 31 Masters Square SE, Calgary, Alberta, Canada')
      expect(body).toContain('contact@levix.digital')
      expect(body).toContain('https://gedo.levix.digital/subscription/unsubscribe#u.t')
    }
    expect(mail.headers['List-Unsubscribe']).toBe('<https://gedo.levix.digital/subscription/unsubscribe#u.t>')
  })

  it('is deleted after 30 days', () => {
    expect(mail.deleteAt.toISOString()).toBe('2026-12-13T12:00:00.000Z')
  })
})
