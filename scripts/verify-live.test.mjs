import { describe, expect, it, vi } from 'vitest'
import { SECURITY_HEADERS } from './lib/security-headers.mjs'
import { checkAddress, domainAddress, liveAddress, main } from './verify-live.mjs'

/** A response with a status, a content type and the security headers, with some overridden. */
function response(/** @type {number} */ status, type = 'text/html; charset=utf-8', /** @type {Record<string, string | null>} */ overrides = {}) {
  /** @type {Map<string, string | null>} */
  const headers = new Map([['content-type', type]])
  for (const header of SECURITY_HEADERS) headers.set(header.key.toLowerCase(), header.value)
  for (const [name, value] of Object.entries(overrides)) headers.set(name.toLowerCase(), value)
  return { status, headers: { get: (/** @type {string} */ name) => headers.get(name.toLowerCase()) ?? null } }
}

describe('checkAddress', () => {
  it('accepts a 200 HTML answer', async () => {
    expect(await checkAddress('u', async () => response(200), 1, 0)).toBeNull()
  })

  it('retries until the site answers', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response(404)).mockResolvedValueOnce(response(200))
    expect(await checkAddress('u', fetcher, 3, 0)).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('reports the last status, a wrong content type or a network error', async () => {
    expect(await checkAddress('u', async () => response(503), 2, 0)).toBe('status 503, text/html; charset=utf-8')
    expect(await checkAddress('u', async () => response(200, 'application/json'), 1, 0)).toBe('status 200, application/json')
    expect(await checkAddress('u', async () => { throw new Error('getaddrinfo ENOTFOUND') }, 1, 0)).toBe('getaddrinfo ENOTFOUND')
  })

  it('reports security headers that are missing or different', async () => {
    const changed = response(200, undefined, {
      'X-Frame-Options': null,
      'Strict-Transport-Security': 'max-age=31556926; includeSubDomains; preload',
    })
    expect(await checkAddress('u', async () => changed, 1, 0)).toBe(
      'Strict-Transport-Security is "max-age=31556926; includeSubDomains; preload", X-Frame-Options is missing',
    )
  })
})

describe('main', () => {
  it('checks the default address and the domain of each named site', async () => {
    const fetcher = vi.fn(async () => response(200))
    await main(['home', 'gedo'], { fetch: fetcher, attempts: 1, delayMs: 0 })
    expect(fetcher.mock.calls.map((call) => /** @type {unknown[]} */ (call)[0])).toEqual([
      liveAddress('levix-digital'), domainAddress('levix.digital'), liveAddress('levix-gedo'), domainAddress('gedo.levix.digital'),
    ])
  })

  it('fails naming the addresses that do not answer', async () => {
    const fetcher = async (/** @type {string} */ url) => response(url === 'https://gedo.levix.digital/' ? 404 : 200)
    await expect(main(['home', 'gedo'], { fetch: fetcher, attempts: 1, delayMs: 0 })).rejects.toThrow('not answering: https://gedo.levix.digital/')
  })

  it('refuses no sites and unknown sites', async () => {
    await expect(main([], { attempts: 1 })).rejects.toThrow('name the sites to check')
    await expect(main(['forklift'], { attempts: 1 })).rejects.toThrow('unknown site forklift')
  })
})
