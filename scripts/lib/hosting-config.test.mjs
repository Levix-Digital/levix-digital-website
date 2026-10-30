import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readHostingConfig, selectTargets } from './hosting-config.mjs'

const config = readHostingConfig()

describe('hosting configuration', () => {
  it('has exactly one target per site of the workspace', () => {
    const sites = readdirSync('sites').sort()
    expect(config.targets.map((target) => target.name).sort()).toEqual(sites)
  })

  it('serves each site from its output folder', () => {
    for (const target of config.targets) expect(target.folder).toBe(`sites/${target.name}/dist`)
  })

  it('uses clean URLs without trailing slash', () => {
    for (const { entry } of config.targets) {
      expect(entry.cleanUrls).toBe(true)
      expect(entry.trailingSlash).toBe(false)
    }
  })

  it('revalidates pages and caches fingerprinted assets, in that order', () => {
    for (const { entry } of config.targets) {
      const rules = /** @type {{ source: string, headers: { key: string, value: string }[] }[]} */ (entry.headers)
      const cache = rules.map((rule) => [rule.source, rule.headers.find((h) => h.key === 'Cache-Control')?.value])
      expect(cache).toEqual([
        ['**', 'no-cache'],
        ['/assets/**', 'public, max-age=31536000, immutable'],
      ])
    }
  })

  it('maps the home site to the project default site', () => {
    expect(config.projectId).toBe('levix-digital')
    expect(selectTargets(config, ['home'])[0]?.siteId).toBe('levix-digital')
  })

  it('rejects an unknown site name', () => {
    expect(() => selectTargets(config, ['nope'])).toThrow('unknown site nope')
  })
})
