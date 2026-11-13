import { describe, expect, it } from 'vitest'
import { MAX_SIGNUPS_PER_CLIENT_PER_HOUR } from './limits'
import { clientOverLimit, confirm, subscribe, unsubscribe } from './subscriptions'
import { linkToken, testService } from './test-support'
import type { SignupRequest } from './validation'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const request: SignupRequest = {
  email: 'ana@example.com',
  product: 'gedo',
  consentVersion: '2026-11-13',
  consentText: 'I agree to receive emails from Levix Digital Inc. about release candidates of Gedo.',
  page: 'https://gedo.levix.digital/',
}

function onlyRecord(service: ReturnType<typeof testService>) {
  const records = [...service.store.subscriptions.values()]
  expect(records).toHaveLength(1)
  return records[0]!
}

describe('subscribe', () => {
  it('stores a pending subscription with its consent and queues the confirmation email', async () => {
    const service = testService()
    expect(await subscribe(service, request)).toBe('queued')
    const record = onlyRecord(service)
    expect(record).toMatchObject({
      email: 'ana@example.com',
      product: 'gedo',
      state: 'pending',
      consent: { version: '2026-11-13', text: request.consentText, page: request.page, givenAt: service.now() },
      expiresAt: new Date(service.now().getTime() + 7 * DAY),
    })
    expect(service.store.mails).toHaveLength(1)
    expect(service.store.mails[0]?.to).toBe('ana@example.com')
  })

  it('sends nothing again within 24 hours, and a fresh link after', async () => {
    const service = testService()
    await subscribe(service, request)
    service.advance(23 * HOUR)
    expect(await subscribe(service, request)).toBe('unchanged')
    expect(service.store.mails).toHaveLength(1)
    service.advance(2 * HOUR)
    expect(await subscribe(service, request)).toBe('queued')
    expect(service.store.mails).toHaveLength(2)
    const [first, second] = service.store.mails.map((mail) => linkToken(mail.message.text, 'confirm'))
    expect(second).not.toBe(first)
    expect((await confirm(service, first)).status).toBe('expired')
    expect((await confirm(service, second)).status).toBe('confirmed')
  })

  it('keeps the unsubscribe link of an earlier email working after a repeated signup', async () => {
    const service = testService()
    await subscribe(service, request)
    service.advance(25 * HOUR)
    await subscribe(service, request)
    const [first, second] = service.store.mails.map((mail) => linkToken(mail.message.text, 'unsubscribe'))
    expect(second).toBe(first)
    await unsubscribe(service, first)
    expect(service.store.subscriptions.size).toBe(0)
  })

  it('leaves a confirmed subscription as it is and sends nothing', async () => {
    const service = testService()
    await subscribe(service, request)
    await confirm(service, linkToken(service.store.mails[0]!.message.text, 'confirm'))
    service.advance(3 * DAY)
    expect(await subscribe(service, request)).toBe('unchanged')
    expect(service.store.mails).toHaveLength(1)
    expect(onlyRecord(service).state).toBe('confirmed')
  })

  it('keeps one subscription per product', async () => {
    const service = testService()
    await subscribe(service, request)
    await subscribe(service, { ...request, product: 'aurora' })
    expect(service.store.subscriptions.size).toBe(2)
    expect(service.store.mails).toHaveLength(2)
  })
})

describe('confirm', () => {
  it('confirms within 7 days, drops the expiry and answers the same when repeated', async () => {
    const service = testService()
    await subscribe(service, request)
    const token = linkToken(service.store.mails[0]!.message.text, 'confirm')
    service.advance(6 * DAY)
    expect(await confirm(service, token)).toEqual({ status: 'confirmed', product: 'gedo' })
    const record = onlyRecord(service)
    expect(record.state).toBe('confirmed')
    expect(record.confirmedAt).toEqual(service.now())
    expect(record.expiresAt).toBeUndefined()
    expect(await confirm(service, token)).toEqual({ status: 'confirmed', product: 'gedo' })
  })

  it('refuses a link after 7 days, a wrong secret and a malformed token', async () => {
    const service = testService()
    await subscribe(service, request)
    const token = linkToken(service.store.mails[0]!.message.text, 'confirm')
    const [id] = token.split('.')
    expect(await confirm(service, `${id}.${'A'.repeat(43)}`)).toEqual({ status: 'expired' })
    expect(await confirm(service, 'nonsense')).toEqual({ status: 'expired' })
    service.advance(7 * DAY + 1)
    expect(await confirm(service, token)).toEqual({ status: 'expired' })
    expect(onlyRecord(service).state).toBe('pending')
  })

  it('does not accept the unsubscribe link as a confirmation', async () => {
    const service = testService()
    await subscribe(service, request)
    expect(await confirm(service, linkToken(service.store.mails[0]!.message.text, 'unsubscribe'))).toEqual({ status: 'expired' })
  })
})

describe('unsubscribe', () => {
  it('deletes the subscription at once, pending or confirmed, and is harmless when repeated', async () => {
    const service = testService()
    await subscribe(service, request)
    const mail = service.store.mails[0]!.message.text
    await confirm(service, linkToken(mail, 'confirm'))
    await unsubscribe(service, linkToken(mail, 'unsubscribe'))
    expect(service.store.subscriptions.size).toBe(0)
    await expect(unsubscribe(service, linkToken(mail, 'unsubscribe'))).resolves.toBeUndefined()
  })

  it('deletes nothing with the confirmation link or a wrong secret', async () => {
    const service = testService()
    await subscribe(service, request)
    const mail = service.store.mails[0]!.message.text
    await unsubscribe(service, linkToken(mail, 'confirm'))
    await unsubscribe(service, 'nonsense')
    expect(service.store.subscriptions.size).toBe(1)
  })
})

describe('client limit', () => {
  it('allows ten signups per client per hour, then refuses until the next hour', async () => {
    const service = testService('2026-11-13T12:05:00Z')
    for (let i = 0; i < MAX_SIGNUPS_PER_CLIENT_PER_HOUR; i++) expect(await clientOverLimit(service, '203.0.113.7')).toBe(false)
    expect(await clientOverLimit(service, '203.0.113.7')).toBe(true)
    expect(await clientOverLimit(service, '198.51.100.1')).toBe(false)
    service.advance(HOUR)
    expect(await clientOverLimit(service, '203.0.113.7')).toBe(false)
  })

  it('never stores the client address itself', async () => {
    const service = testService()
    await clientOverLimit(service, '203.0.113.7')
    expect([...service.store.counters.keys()].join()).not.toContain('203.0.113.7')
  })
})
