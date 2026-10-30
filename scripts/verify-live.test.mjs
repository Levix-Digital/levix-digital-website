import { describe, expect, it, vi } from 'vitest'
import { checkAddress, liveAddress, main } from './verify-live.mjs'

/** A response with a status and a content type. */
function response(/** @type {number} */ status, type = 'text/html; charset=utf-8') {
  return { status, headers: { get: (/** @type {string} */ name) => (name === 'content-type' ? type : null) } }
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
})

describe('main', () => {
  it('checks the default address of each named site', async () => {
    const fetcher = vi.fn(async () => response(200))
    await main(['home', 'gedo'], { fetch: fetcher, attempts: 1, delayMs: 0 })
    expect(fetcher.mock.calls.map((call) => /** @type {unknown[]} */ (call)[0])).toEqual([liveAddress('levix-digital'), liveAddress('levix-gedo')])
  })

  it('fails naming the sites that do not answer', async () => {
    const fetcher = async (/** @type {string} */ url) => response(url.includes('gedo') ? 404 : 200)
    await expect(main(['home', 'gedo'], { fetch: fetcher, attempts: 1, delayMs: 0 })).rejects.toThrow('not answering: gedo')
  })

  it('refuses no sites and unknown sites', async () => {
    await expect(main([], { attempts: 1 })).rejects.toThrow('name the sites to check')
    await expect(main(['forklift'], { attempts: 1 })).rejects.toThrow('unknown site forklift')
  })
})
