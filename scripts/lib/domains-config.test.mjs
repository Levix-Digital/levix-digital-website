import { describe, expect, it } from 'vitest'
import { readHostingConfig } from './hosting-config.mjs'
import { readDomains, resolveDomains } from './domains-config.mjs'

const config = readHostingConfig()
const valid = {
  home: 'levix.digital',
  anycontext: 'anycontext.levix.digital',
  devcycle: 'devcycle.levix.digital',
  gedo: 'gedo.levix.digital',
  aurora: 'aurora.levix.digital',
}

describe('domains configuration', () => {
  it('gives the apex to the home site and a subdomain to each product site', () => {
    expect(readDomains(config).map(({ target, siteId, domain }) => [target, siteId, domain])).toEqual([
      ['home', 'levix-digital', 'levix.digital'],
      ['anycontext', 'levix-anycontext', 'anycontext.levix.digital'],
      ['devcycle', 'levix-devcycle', 'devcycle.levix.digital'],
      ['gedo', 'levix-gedo', 'gedo.levix.digital'],
      ['aurora', 'levix-aurora', 'aurora.levix.digital'],
    ])
  })

  it('refuses unknown sites, missing or repeated domains and domains outside the zone', () => {
    expect(() => resolveDomains({ ...valid, forklift: 'forklift.levix.digital' }, config)).toThrow('unknown sites: forklift')
    expect(() => resolveDomains({ ...valid, gedo: undefined }, config)).toThrow('no domain for gedo')
    expect(() => resolveDomains({ ...valid, gedo: 'aurora.levix.digital' }, config)).toThrow('listed twice')
    expect(() => resolveDomains({ ...valid, gedo: 'gedo.example.com' }, config)).toThrow('outside levix.digital')
  })
})
