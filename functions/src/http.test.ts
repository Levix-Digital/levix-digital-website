import { describe, expect, it } from 'vitest'
import { createHandler, type HttpRequest, type HttpResponse } from './http'
import { linkToken, testService } from './test-support'

class FakeResponse implements HttpResponse {
  statusCode = 200
  headers: Record<string, string> = {}
  body: unknown = undefined
  status(code: number) {
    this.statusCode = code
    return this
  }
  set(name: string, value: string) {
    this.headers[name] = value
    return this
  }
  json(body: unknown) {
    this.body = body
  }
  end() {}
}

const ORIGIN = 'https://gedo.levix.digital'
const signup = { email: 'ana@example.com', product: 'gedo', consent: true, consentVersion: '2026-11-13', page: `${ORIGIN}/`, website: '' }

function setup() {
  const service = testService()
  const logs: { route: string; status: number; result: string }[] = []
  const handle = createHandler(service, (entry) => logs.push(entry))
  async function call(path: string, body: unknown, overrides: Partial<HttpRequest> = {}) {
    const response = new FakeResponse()
    await handle({ method: 'POST', path, headers: { origin: ORIGIN, 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }, body, ...overrides }, response)
    return response
  }
  return { service, logs, call }
}

describe('releaseSignup handler', () => {
  it('refuses other origins without CORS headers', async () => {
    const { call, service } = setup()
    const response = await call('/subscribe', signup, { headers: { origin: 'https://evil.example' } })
    expect(response.statusCode).toBe(403)
    expect(response.headers['Access-Control-Allow-Origin']).toBeUndefined()
    expect(service.store.subscriptions.size).toBe(0)
  })

  it('answers the preflight of a product site', async () => {
    const { call } = setup()
    const response = await call('/subscribe', undefined, { method: 'OPTIONS' })
    expect(response.statusCode).toBe(204)
    expect(response.headers).toMatchObject({ 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST' })
  })

  it('accepts a signup and answers the same for a repeat', async () => {
    const { call, service } = setup()
    const first = await call('/subscribe', signup)
    const second = await call('/subscribe', signup)
    expect([first.statusCode, first.body]).toEqual([202, { status: 'check-inbox' }])
    expect([second.statusCode, second.body]).toEqual([202, { status: 'check-inbox' }])
    expect(service.store.mails).toHaveLength(1)
  })

  it('names the invalid fields', async () => {
    const { call } = setup()
    const response = await call('/subscribe', { ...signup, consent: false })
    expect([response.statusCode, response.body]).toEqual([400, { error: 'invalid', fields: ['consent'] }])
  })

  it('answers a bot as accepted and stores nothing', async () => {
    const { call, service } = setup()
    const response = await call('/subscribe', { ...signup, website: 'x' })
    expect(response.statusCode).toBe(202)
    expect(service.store.subscriptions.size).toBe(0)
  })

  it('limits a client to ten signups an hour', async () => {
    const { call } = setup()
    for (let i = 0; i < 10; i++) await call('/subscribe', { ...signup, email: `a${i}@example.com` })
    const response = await call('/subscribe', signup)
    expect([response.statusCode, response.body]).toEqual([429, { error: 'rate-limited' }])
  })

  it('confirms and unsubscribes through the links of the email', async () => {
    const { call, service } = setup()
    await call('/subscribe', signup)
    const text = service.store.mails[0]!.message.text
    const confirmed = await call('/confirm', { token: linkToken(text, 'confirm') })
    expect([confirmed.statusCode, confirmed.body]).toEqual([200, { status: 'confirmed', product: 'gedo' }])
    const expired = await call('/confirm', { token: 'nonsense' })
    expect([expired.statusCode, expired.body]).toEqual([410, { error: 'expired' }])
    const gone = await call('/unsubscribe/', { token: linkToken(text, 'unsubscribe') })
    expect([gone.statusCode, gone.body]).toEqual([200, { status: 'unsubscribed' }])
    expect(service.store.subscriptions.size).toBe(0)
  })

  it('counts the address the front end appended, not the ones the client sent', async () => {
    const { call } = setup()
    for (let i = 0; i < 10; i++) {
      await call('/subscribe', { ...signup, email: `a${i}@example.com` }, { headers: { origin: ORIGIN, 'x-forwarded-for': `198.51.100.${i}, 203.0.113.7` } })
    }
    const response = await call('/subscribe', signup, { headers: { origin: ORIGIN, 'x-forwarded-for': '192.0.2.1, 203.0.113.7' } })
    expect(response.statusCode).toBe(429)
  })

  it('unsubscribes with one click from a mail client, without an origin', async () => {
    const { call, service } = setup()
    await call('/subscribe', signup)
    const mail = service.store.mails[0]!
    const address = new URL(mail.headers['List-Unsubscribe']!.slice(1, -1))
    expect(address.pathname).toBe('/releaseSignup/one-click-unsubscribe')
    const viaGet = await call('/one-click-unsubscribe', undefined, { method: 'GET', headers: {}, query: { token: address.searchParams.get('token') } })
    expect(viaGet.statusCode).toBe(405)
    expect(service.store.subscriptions.size).toBe(1)
    const response = await call('/one-click-unsubscribe', 'List-Unsubscribe=One-Click', { headers: {}, query: { token: address.searchParams.get('token') } })
    expect([response.statusCode, response.body]).toEqual([200, { status: 'unsubscribed' }])
    expect(service.store.subscriptions.size).toBe(0)
  })

  it('refuses other methods and routes', async () => {
    const { call } = setup()
    expect((await call('/subscribe', undefined, { method: 'GET' })).statusCode).toBe(405)
    expect((await call('/other', {})).statusCode).toBe(404)
  })

  it('answers 500 when storage fails and logs the error, never the address', async () => {
    const { call, service, logs } = setup()
    service.store.change = async () => {
      throw new Error('storage down')
    }
    const response = await call('/subscribe', signup)
    expect([response.statusCode, response.body]).toEqual([500, { error: 'unavailable' }])
    expect(logs.at(-1)).toMatchObject({ route: '/subscribe', status: 500, result: 'error' })
    expect(JSON.stringify(logs)).not.toContain('ana@example.com')
  })
})
