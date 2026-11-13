import { describe, expect, it } from 'vitest'
import { type FetchLike, type ReleaseProduct, readRelease, releaseMarker, validateReleaseSource } from './releases'

const source = {
  repository: 'Levix-Digital/sample-releases',
  downloads: { windows: 'sample-installer.exe', linux: 'sample-installer' },
}

function release(tag: string, extra: Record<string, unknown> = {}) {
  return {
    tag_name: tag,
    html_url: `https://github.com/Levix-Digital/sample-releases/releases/tag/${tag}`,
    draft: false,
    prerelease: false,
    published_at: '2026-11-10T12:00:00Z',
    assets: [
      { name: 'sample-installer.exe', browser_download_url: `https://example.test/${tag}/sample-installer.exe` },
      { name: 'sample-installer', browser_download_url: `https://example.test/${tag}/sample-installer` },
    ],
    ...extra,
  }
}

function fakeFetch(status: number, body: unknown, calls: { url: string; headers?: Record<string, string> }[] = []): FetchLike {
  return (url, init) => {
    calls.push({ url, ...(init?.headers ? { headers: init.headers } : {}) })
    return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })
  }
}

const available: ReleaseProduct = { id: 'sample', status: 'available', releases: source }

describe('readRelease', () => {
  it('reads the latest release of an available product with one link per declared system', async () => {
    const calls: { url: string; headers?: Record<string, string> }[] = []
    const result = await readRelease(available, { fetch: fakeFetch(200, release('v1.2.3'), calls), token: 't0ken' })
    expect(calls[0]?.url).toBe('https://api.github.com/repos/Levix-Digital/sample-releases/releases/latest')
    expect(calls[0]?.headers?.authorization).toBe('Bearer t0ken')
    expect(result.warnings).toEqual([])
    expect(result.release).toEqual({
      version: 'v1.2.3',
      url: 'https://github.com/Levix-Digital/sample-releases/releases/tag/v1.2.3',
      publishedAt: '2026-11-10T12:00:00Z',
      prerelease: false,
      downloads: [
        { platform: 'windows', url: 'https://example.test/v1.2.3/sample-installer.exe' },
        { platform: 'linux', url: 'https://example.test/v1.2.3/sample-installer' },
      ],
    })
  })

  it('sends no authorization without a token', async () => {
    const calls: { url: string; headers?: Record<string, string> }[] = []
    await readRelease(available, { fetch: fakeFetch(200, release('v1.0.0'), calls) })
    expect(calls[0]?.headers?.authorization).toBeUndefined()
  })

  it('reads the newest published release of a preview, pre-releases included, skipping drafts', async () => {
    const calls: { url: string }[] = []
    const list = [release('v2.0.0-rc.2', { draft: true }), release('v2.0.0-rc.1', { prerelease: true }), release('v1.9.0')]
    const result = await readRelease({ ...available, status: 'preview' }, { fetch: fakeFetch(200, list, calls) })
    expect(calls[0]?.url).toBe('https://api.github.com/repos/Levix-Digital/sample-releases/releases?per_page=10')
    expect(result.release?.version).toBe('v2.0.0-rc.1')
    expect(result.release?.prerelease).toBe(true)
  })

  it('reads nothing for a product in development', async () => {
    const calls: { url: string }[] = []
    const result = await readRelease({ ...available, status: 'in-development' }, { fetch: fakeFetch(200, [], calls) })
    expect(calls).toEqual([])
    expect(result).toEqual({ release: null, warnings: [] })
  })

  it('skips a system whose installer is missing and says which', async () => {
    const body = release('v1.2.3', { assets: [{ name: 'sample-installer', browser_download_url: 'https://example.test/l' }] })
    const result = await readRelease(available, { fetch: fakeFetch(200, body) })
    expect(result.release?.downloads).toEqual([{ platform: 'linux', url: 'https://example.test/l' }])
    expect(result.warnings).toEqual(['sample: v1.2.3 has no asset "sample-installer.exe" for windows'])
  })

  it('gives only the version when the product declares no installers', async () => {
    const result = await readRelease(
      { ...available, releases: { repository: source.repository } },
      { fetch: fakeFetch(200, release('v3.0.0')) },
    )
    expect(result.release?.version).toBe('v3.0.0')
    expect(result.release?.downloads).toEqual([])
  })

  it.each([
    [404, 'no published release'],
    [403, 'HTTP 403'],
    [500, 'HTTP 500'],
  ])('falls back with the cause on HTTP %i', async (status, cause) => {
    const result = await readRelease(available, { fetch: fakeFetch(status, {}) })
    expect(result.release).toBeNull()
    expect(result.warnings).toEqual([`sample: release of Levix-Digital/sample-releases not read (${cause})`])
  })

  it('falls back on a network error', async () => {
    const result = await readRelease(available, { fetch: () => Promise.reject(new Error('getaddrinfo ENOTFOUND')) })
    expect(result.release).toBeNull()
    expect(result.warnings[0]).toContain('getaddrinfo ENOTFOUND')
  })

  it('falls back when a preview has only drafts or the answer is malformed', async () => {
    const preview: ReleaseProduct = { ...available, status: 'preview' }
    expect((await readRelease(preview, { fetch: fakeFetch(200, [release('v1', { draft: true })]) })).release).toBeNull()
    expect((await readRelease(available, { fetch: fakeFetch(200, { message: 'x' }) })).release).toBeNull()
  })

  it('never shows a pre-release for an available product', async () => {
    const result = await readRelease(available, { fetch: fakeFetch(200, release('v1.0.0-rc.1', { prerelease: true })) })
    expect(result.release).toBeNull()
  })

  it('uses another API address when given', async () => {
    const calls: { url: string }[] = []
    await readRelease(available, { fetch: fakeFetch(200, release('v1'), calls), apiBase: 'http://localhost:9/' })
    expect(calls[0]?.url).toBe('http://localhost:9/repos/Levix-Digital/sample-releases/releases/latest')
  })
})

describe('validateReleaseSource', () => {
  it('accepts a repository and known systems', () => {
    expect(validateReleaseSource('sample', source)).toEqual([])
  })

  it('names each problem', () => {
    expect(
      validateReleaseSource('sample', {
        repository: 'not a repo',
        downloads: { windows: ' ', beos: 'x' } as never,
      }),
    ).toEqual([
      'sample: releases repository "not a repo" is not owner/name',
      'sample: empty asset name for windows',
      'sample: unknown platform "beos"',
    ])
  })
})

describe('releaseMarker', () => {
  it('records the version shown, or none', () => {
    const at = new Date('2026-11-13T16:00:00Z')
    expect(releaseMarker(available, null, at)).toEqual({
      product: 'sample',
      status: 'available',
      repository: 'Levix-Digital/sample-releases',
      version: null,
      builtAt: '2026-11-13T16:00:00.000Z',
    })
  })
})
