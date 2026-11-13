import { describe, expect, it } from 'vitest'
import { createSecret, makeToken, parseToken, sameSecret, sha256, subscriptionId } from './tokens'

describe('tokens', () => {
  const id = subscriptionId('ana@example.com', 'gedo')

  it('derives one id per address and product', () => {
    expect(id).toMatch(/^[0-9a-f]{64}$/)
    expect(subscriptionId('ana@example.com', 'gedo')).toBe(id)
    expect(subscriptionId('ana@example.com', 'aurora')).not.toBe(id)
  })

  it('round-trips a token', () => {
    const secret = createSecret()
    expect(parseToken(makeToken(id, secret))).toEqual({ id, secret })
    expect(createSecret()).not.toBe(secret)
  })

  it.each([undefined, 42, '', 'abc.def', `${id}`, `${id}.short`, `${id}.${createSecret()}.extra`, `../${id}.${createSecret()}`])(
    'refuses the malformed token %s',
    (token) => expect(parseToken(token)).toBeUndefined(),
  )

  it('compares secrets', () => {
    expect(sameSecret(sha256('a'), sha256('a'))).toBe(true)
    expect(sameSecret(sha256('a'), sha256('b'))).toBe(false)
    expect(sameSecret('a', 'ab')).toBe(false)
  })
})
