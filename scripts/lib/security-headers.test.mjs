import { describe, expect, it } from 'vitest'
import { readHostingConfig } from './hosting-config.mjs'
import { SECURITY_HEADERS, headerDifferences } from './security-headers.mjs'

/** @typedef {{ source: string, headers: { key: string, value: string }[] }} HeaderRule */

const NAMES = new Set(SECURITY_HEADERS.map((header) => header.key.toLowerCase()))

describe('headerDifferences', () => {
  const policy = new Map(SECURITY_HEADERS.map((header) => [header.key, header.value]))

  it('finds nothing when every header matches', () => {
    expect(headerDifferences((name) => policy.get(name))).toEqual([])
  })

  it('names missing and different headers', () => {
    const served = new Map(policy)
    served.delete('X-Frame-Options')
    served.set('Referrer-Policy', 'no-referrer')
    expect(headerDifferences((name) => served.get(name) ?? null)).toEqual([
      'X-Frame-Options is missing',
      'Referrer-Policy is "no-referrer"',
    ])
  })

  it('allows no inline code or eval in the content security policy', () => {
    const csp = policy.get('Content-Security-Policy') ?? ''
    expect(csp).not.toContain('unsafe-')
    expect(csp).toContain("frame-ancestors 'none'")
  })
})

describe('firebase.json', () => {
  for (const { name, entry } of readHostingConfig().targets) {
    const rules = /** @type {HeaderRule[]} */ (entry.headers)

    it(`${name} serves exactly the security headers on every path`, () => {
      const all = rules.find((rule) => rule.source === '**')
      const configured = new Map((all?.headers ?? []).map((header) => [header.key, header.value]))
      expect(headerDifferences((key) => configured.get(key))).toEqual([])
    })

    it(`${name} sets security headers only on the ** rule`, () => {
      for (const rule of rules) {
        const security = rule.headers.filter((header) => NAMES.has(header.key.toLowerCase()))
        expect(security.length).toBe(rule.source === '**' ? SECURITY_HEADERS.length : 0)
      }
    })
  }
})
