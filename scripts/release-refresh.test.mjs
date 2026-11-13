import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkSite, main, productSites } from './release-refresh.mjs'

/**
 * A fake network: release.json of each domain and the latest release of each repository.
 * @param {Record<string, unknown>} markers domain -> marker (undefined: 404)
 * @param {Record<string, string>} latest repository -> tag
 * @param {{ url: string, init?: Record<string, unknown> }[]} calls
 */
function network(markers, latest, calls = [], dispatchStatus = 204) {
  return (/** @type {string} */ url, /** @type {Record<string, unknown> | undefined} */ init) => {
    calls.push({ url, ...(init ? { init } : {}) })
    const respond = (/** @type {number} */ status, /** @type {unknown} */ body) =>
      Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })
    const site = url.match(/^https:\/\/([^/]+)\/release\.json$/)?.[1]
    if (site !== undefined) return markers[site] === undefined ? respond(404, {}) : respond(200, markers[site])
    if (url.endsWith('/dispatches')) return respond(dispatchStatus, {})
    const repo = url.match(/repos\/([^/]+\/[^/]+)\/releases/)?.[1] ?? ''
    const tag = latest[repo]
    if (tag === undefined) return respond(404, {})
    const release = { tag_name: tag, html_url: `https://github.com/${repo}/releases/tag/${tag}`, draft: false, prerelease: false, published_at: null, assets: [] }
    return respond(200, url.endsWith('/latest') ? release : [release])
  }
}

function project() {
  const root = mkdtempSync(join(tmpdir(), 'release-refresh-'))
  writeFileSync(
    join(root, 'domains.json'),
    JSON.stringify({ home: 'levix.digital', anycontext: 'anycontext.levix.digital', gedo: 'gedo.levix.digital' }),
  )
  return root
}

const anycontext = (/** @type {string | null} */ version) => ({
  product: 'anycontext',
  status: 'available',
  repository: 'Levix-Digital/any-context-releases',
  version,
  builtAt: '2026-11-13T10:00:00.000Z',
})
const gedo = { product: 'gedo', status: 'in-development', repository: 'Levix-Digital/gedo-releases', version: null, builtAt: 'x' }

const env = { GITHUB_TOKEN: 'tok', GITHUB_REPOSITORY: 'Levix-Digital/levix-digital-website', GITHUB_REF_NAME: 'main' }

describe('productSites', () => {
  it('lists every site of domains.json but the home', () => {
    expect(productSites(project())).toEqual([
      { site: 'anycontext', domain: 'anycontext.levix.digital' },
      { site: 'gedo', domain: 'gedo.levix.digital' },
    ])
  })
})

describe('checkSite', () => {
  const entry = { site: 'anycontext', domain: 'anycontext.levix.digital' }

  it('asks for a deploy when the published version is older', async () => {
    const fetcher = network({ 'anycontext.levix.digital': anycontext('v0.45.1') }, { 'Levix-Digital/any-context-releases': 'v0.45.2' })
    expect(await checkSite(entry, { fetch: fetcher })).toEqual({ site: 'anycontext', action: 'deploy', detail: 'v0.45.1 -> v0.45.2' })
  })

  it('asks for a deploy when the site was built without a version', async () => {
    const fetcher = network({ 'anycontext.levix.digital': anycontext(null) }, { 'Levix-Digital/any-context-releases': 'v1.0.0' })
    expect((await checkSite(entry, { fetch: fetcher })).action).toBe('deploy')
  })

  it('leaves a current site alone', async () => {
    const fetcher = network({ 'anycontext.levix.digital': anycontext('v1.0.0') }, { 'Levix-Digital/any-context-releases': 'v1.0.0' })
    expect((await checkSite(entry, { fetch: fetcher })).action).toBe('current')
  })

  it('skips a site without release.json and a product in development', async () => {
    expect((await checkSite(entry, { fetch: network({}, {}) })).action).toBe('skip')
    const calls = /** @type {{ url: string }[]} */ ([])
    const result = await checkSite({ site: 'gedo', domain: 'gedo.levix.digital' }, { fetch: network({ 'gedo.levix.digital': gedo }, {}, calls) })
    expect(result.action).toBe('skip')
    expect(calls.map((call) => call.url)).toEqual(['https://gedo.levix.digital/release.json'])
  })

  it('reports a malformed marker and an unreadable release', async () => {
    expect((await checkSite(entry, { fetch: network({ 'anycontext.levix.digital': { product: 1 } }, {}) })).action).toBe('error')
    const result = await checkSite(entry, { fetch: network({ 'anycontext.levix.digital': anycontext('v1') }, {}) })
    expect(result).toEqual({
      site: 'anycontext',
      action: 'error',
      detail: 'anycontext: release of Levix-Digital/any-context-releases not read (no published release)',
    })
  })

  it('reports a site that cannot be reached', async () => {
    const result = await checkSite(entry, { fetch: () => Promise.reject(new Error('ECONNRESET')) })
    expect(result).toEqual({ site: 'anycontext', action: 'error', detail: 'release.json not read (ECONNRESET)' })
  })
})

describe('main', () => {
  it('starts one deploy with exactly the sites that differ, and writes the summary', async () => {
    const root = project()
    const summaryFile = join(root, 'summary.md')
    const calls = /** @type {{ url: string, init?: Record<string, unknown> }[]} */ ([])
    const fetcher = network(
      { 'anycontext.levix.digital': anycontext('v1.0.0'), 'gedo.levix.digital': gedo },
      { 'Levix-Digital/any-context-releases': 'v1.1.0' },
      calls,
    )
    const result = await main([], { root, fetch: fetcher, env: { ...env, GITHUB_STEP_SUMMARY: summaryFile }, log: () => {} })
    expect(result.deployed).toEqual(['anycontext'])
    const dispatch = calls.filter((call) => call.url.endsWith('/dispatches'))
    expect(dispatch).toHaveLength(1)
    expect(dispatch[0]?.url).toBe('https://api.github.com/repos/Levix-Digital/levix-digital-website/actions/workflows/deploy.yml/dispatches')
    expect(JSON.parse(/** @type {string} */ (dispatch[0]?.init?.body))).toEqual({ ref: 'main', inputs: { sites: 'anycontext' } })
    expect(readFileSync(summaryFile, 'utf8')).toContain('Deploy started for: anycontext.')
  })

  it('starts nothing when every site is current, or on a dry run', async () => {
    const calls = /** @type {{ url: string }[]} */ ([])
    const current = network({ 'anycontext.levix.digital': anycontext('v1.0.0') }, { 'Levix-Digital/any-context-releases': 'v1.0.0' }, calls)
    expect((await main([], { root: project(), fetch: current, env, log: () => {} })).deployed).toEqual([])
    const newer = network({ 'anycontext.levix.digital': anycontext('v0.9.0') }, { 'Levix-Digital/any-context-releases': 'v1.0.0' }, calls)
    expect((await main(['--dry-run'], { root: project(), fetch: newer, env, log: () => {} })).deployed).toEqual(['anycontext'])
    expect(calls.some((call) => call.url.endsWith('/dispatches'))).toBe(false)
  })

  it('fails when the deploy cannot be started', async () => {
    const fetcher = network({ 'anycontext.levix.digital': anycontext('v0.9.0') }, { 'Levix-Digital/any-context-releases': 'v1.0.0' }, [], 403)
    await expect(main([], { root: project(), fetch: fetcher, env, log: () => {} })).rejects.toThrow(
      'deploy of anycontext not started (HTTP 403)',
    )
  })

  it('needs the repository and the token to deploy', async () => {
    const fetcher = network({ 'anycontext.levix.digital': anycontext('v0.9.0') }, { 'Levix-Digital/any-context-releases': 'v1.0.0' })
    await expect(main([], { root: project(), fetch: fetcher, env: {}, log: () => {} })).rejects.toThrow('GITHUB_REPOSITORY and GITHUB_TOKEN')
  })
})
