import { describe, expect, it, vi } from 'vitest'
import { createReleaseSignupClient } from './client'

const ENDPOINT = 'https://example.test/releaseSignup'
const input = { email: 'a@b.co', product: 'gedo', consent: true, consentVersion: '2026-11-13', page: 'https://gedo.levix.digital/', website: '' }

function answering(status: number, body: unknown = {}) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }))
}

describe('createReleaseSignupClient', () => {
  it('posts JSON to the route', async () => {
    const fetcher = answering(202, { status: 'check-inbox' })
    await createReleaseSignupClient(ENDPOINT, fetcher).subscribe(input)
    expect(fetcher).toHaveBeenCalledWith(`${ENDPOINT}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  })

  it.each([
    [202, {}, { kind: 'check-inbox' }],
    [400, { error: 'invalid', fields: ['email', 7] }, { kind: 'invalid', fields: ['email'] }],
    [429, {}, { kind: 'rate-limited' }],
    [500, {}, { kind: 'unavailable' }],
    [403, 'not json', { kind: 'unavailable' }],
  ])('reads a %i signup answer', async (status, body, outcome) => {
    expect(await createReleaseSignupClient(ENDPOINT, answering(status, body)).subscribe(input)).toEqual(outcome)
  })

  it('maps confirm and unsubscribe answers', async () => {
    expect(await createReleaseSignupClient(ENDPOINT, answering(200)).confirm('t')).toBe('confirmed')
    expect(await createReleaseSignupClient(ENDPOINT, answering(410)).confirm('t')).toBe('expired')
    expect(await createReleaseSignupClient(ENDPOINT, answering(500)).confirm('t')).toBe('unavailable')
    expect(await createReleaseSignupClient(ENDPOINT, answering(200)).unsubscribe('t')).toBe('unsubscribed')
    expect(await createReleaseSignupClient(ENDPOINT, answering(500)).unsubscribe('t')).toBe('unavailable')
  })

  it('turns a network failure into unavailable', async () => {
    const failing = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    expect(await createReleaseSignupClient(ENDPOINT, failing).subscribe(input)).toEqual({ kind: 'unavailable' })
    expect(await createReleaseSignupClient(ENDPOINT, failing).confirm('t')).toBe('unavailable')
  })
})
