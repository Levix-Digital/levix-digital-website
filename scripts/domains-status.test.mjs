import { describe, expect, it, vi } from 'vitest'
import { describeDomain, domainsStatus, formatReports, main, recordRows, zoneHost } from './domains-status.mjs'

const GEDO = { target: 'gedo', siteId: 'levix-gedo', domain: 'gedo.levix.digital' }
const active = { ownershipState: 'OWNERSHIP_ACTIVE', hostState: 'HOST_ACTIVE', cert: { state: 'CERT_ACTIVE' } }
/** What Firebase answered for a proxied subdomain on 2026-10-30. */
const proxied = {
  ownershipState: 'OWNERSHIP_MISSING',
  hostState: 'HOST_ACTIVE',
  cert: { state: 'CERT_VALIDATING' },
  requiredDnsUpdates: {
    checkTime: '2026-10-30T22:06:00Z',
    desired: [{ domainName: 'gedo.levix.digital', records: [
      { domainName: 'gedo.levix.digital.', type: 'CNAME', rdata: 'levix-gedo.web.app.', requiredAction: 'ADD' },
      { domainName: 'gedo.levix.digital.', type: 'TXT', rdata: 'hosting-site=levix-gedo', requiredAction: 'NONE' },
    ] }],
    discovered: [{ domainName: 'gedo.levix.digital', records: [
      { domainName: 'gedo.levix.digital.', type: 'A', rdata: '104.21.96.10', requiredAction: 'REMOVE' },
    ] }],
  },
}
const ok = { code: 0, stdout: 'token\n', stderr: '' }

describe('zoneHost', () => {
  it('writes hosts relative to the zone', () => {
    expect(zoneHost('levix.digital.')).toBe('@')
    expect(zoneHost('gedo.levix.digital.')).toBe('gedo')
    expect(zoneHost('_acme-challenge.gedo.levix.digital')).toBe('_acme-challenge.gedo')
  })
})

describe('recordRows', () => {
  it('lists the records to add and to remove and hides the ones with no action', () => {
    expect(recordRows(proxied)).toEqual([
      { action: 'add', type: 'CNAME', host: 'gedo', value: 'levix-gedo.web.app.' },
      { action: 'remove', type: 'A', host: 'gedo', value: '104.21.96.10' },
    ])
    expect(recordRows(active)).toEqual([])
  })
})

describe('describeDomain', () => {
  it('is active only with active ownership, host and certificate', () => {
    expect(describeDomain(GEDO, { status: 200, body: active }).active).toBe(true)
    for (const change of [{ ownershipState: 'OWNERSHIP_PENDING' }, { hostState: 'HOST_CONFLICT' }, { cert: { state: 'CERT_PROPAGATING' } }]) {
      expect(describeDomain(GEDO, { status: 200, body: { ...active, ...change } }).active).toBe(false)
    }
  })

  it('names the states and when Firebase checked them', () => {
    expect(describeDomain(GEDO, { status: 200, body: proxied }).line).toBe(
      'gedo.levix.digital (gedo)  ownership OWNERSHIP_MISSING  host HOST_ACTIVE  certificate CERT_VALIDATING  checked 2026-10-30T22:06:00Z')
  })

  it('reports a domain that is not connected and other errors', () => {
    expect(describeDomain(GEDO, { status: 404, body: {} })).toMatchObject({ active: false, line: 'gedo.levix.digital (gedo) not connected to levix-gedo' })
    expect(describeDomain(GEDO, { status: 403, body: { error: { message: 'denied' } } }).line).toBe('gedo.levix.digital (gedo) answered 403: denied')
  })
})

describe('domainsStatus', () => {
  it('asks Firebase for each domain with the caller token', async () => {
    const get = vi.fn(async () => ({ status: 200, body: active }))
    await domainsStatus(async () => ok, 'levix-digital', [GEDO], get)
    expect(get).toHaveBeenCalledWith(
      'https://firebasehosting.googleapis.com/v1beta1/projects/levix-digital/sites/levix-gedo/customDomains/gedo.levix.digital', 'token', 'levix-digital')
  })

  it('stops when there is no login', async () => {
    await expect(domainsStatus(async () => ({ code: 1, stdout: '', stderr: 'no account' }), 'p', [GEDO])).rejects.toThrow('no account')
  })
})

describe('main', () => {
  it('succeeds when every domain is active', async () => {
    const log = vi.fn()
    await main([], { run: async () => ok, get: async () => ({ status: 200, body: active }), log })
    expect(String(log.mock.calls[0]?.[0]).split('\n')).toHaveLength(5)
  })

  it('fails naming the domains that are not active, with their records', async () => {
    const log = vi.fn()
    const get = async (/** @type {string} */ url) => ({ status: 200, body: url.endsWith('gedo.levix.digital') ? proxied : active })
    await expect(main(['home', 'gedo'], { run: async () => ok, get, log })).rejects.toThrow('not active: gedo.levix.digital')
    expect(log.mock.calls[0]?.[0]).toContain('  add     CNAME  gedo             levix-gedo.web.app.')
  })

  it('formats an active domain as ok', () => {
    expect(formatReports([describeDomain(GEDO, { status: 200, body: active })])).toMatch(/^ok {4}gedo\.levix\.digital/)
  })
})
