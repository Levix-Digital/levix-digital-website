import { beforeEach, describe, expect, it } from 'vitest'
import type { ReleaseProduct, ReleaseResult } from '../packages/content/src/releases.ts'
import { clearReleaseCache, releaseInfo } from './release-info.ts'

const product: ReleaseProduct = {
  id: 'sample',
  status: 'available',
  releases: { repository: 'Levix-Digital/sample-releases', downloads: { linux: 'sample' } },
}
const found: ReleaseResult = {
  release: { version: 'v1.2.3', url: 'https://example.test/v1.2.3', publishedAt: null, prerelease: false, downloads: [] },
  warnings: [],
}

interface Hooks {
  config: (config: { root?: string }, env: { command: string }) => Promise<{ define: Record<string, string> }>
  configResolved: (config: { build: { ssr?: unknown } }) => void
  generateBundle: (this: { emitFile: (file: Record<string, unknown>) => void }) => void
}

function setup(result: ReleaseResult, lookup = (id: string) => (id === 'sample' ? product : null)) {
  const reads: ReleaseProduct[] = []
  const logs: string[] = []
  const plugin = releaseInfo({
    lookup,
    read: (p) => {
      reads.push(p)
      return Promise.resolve(result)
    },
    now: () => new Date('2026-11-13T16:00:00Z'),
    log: (line) => logs.push(line),
  }) as unknown as Hooks
  return { plugin, reads, logs }
}

function emitted(plugin: Hooks): Record<string, unknown>[] {
  const files: Record<string, unknown>[] = []
  plugin.generateBundle.call({ emitFile: (file) => files.push(file) })
  return files
}

describe('releaseInfo', () => {
  beforeEach(() => clearReleaseCache())

  it('reads the release on build, defines it for the page and emits release.json', async () => {
    const { plugin, reads } = setup(found)
    const config = await plugin.config({ root: '/repo/sites/sample' }, { command: 'build' })
    expect(JSON.parse(config.define.__LEVIX_RELEASE__ as string)).toEqual(found.release)
    expect(reads).toEqual([product])
    plugin.configResolved({ build: {} })
    const files = emitted(plugin)
    expect(files).toHaveLength(1)
    expect(files[0]?.fileName).toBe('release.json')
    expect(JSON.parse(files[0]?.source as string)).toEqual({
      product: 'sample',
      status: 'available',
      repository: 'Levix-Digital/sample-releases',
      version: 'v1.2.3',
      builtAt: '2026-11-13T16:00:00.000Z',
    })
  })

  it('reads once for the client and the server build of a site, and emits only in the client build', async () => {
    const { plugin, reads } = setup(found)
    await plugin.config({ root: '/repo/sites/sample' }, { command: 'build' })
    await plugin.config({ root: '/repo/sites/sample' }, { command: 'build' })
    expect(reads).toHaveLength(1)
    plugin.configResolved({ build: { ssr: 'src/main.ts' } })
    expect(emitted(plugin)).toEqual([])
  })

  it('reads nothing on the dev server', async () => {
    const { plugin, reads } = setup(found)
    const config = await plugin.config({ root: '/repo/sites/sample' }, { command: 'serve' })
    expect(config.define.__LEVIX_RELEASE__).toBe('null')
    expect(reads).toEqual([])
  })

  it('logs a failure and publishes no version', async () => {
    const { plugin, logs } = setup({ release: null, warnings: ['sample: release not read (HTTP 500)'] })
    const config = await plugin.config({ root: '/repo/sites/sample' }, { command: 'build' })
    expect(config.define.__LEVIX_RELEASE__).toBe('null')
    expect(logs).toEqual(['release info: sample: release not read (HTTP 500)'])
    plugin.configResolved({ build: {} })
    expect(JSON.parse(emitted(plugin)[0]?.source as string).version).toBeNull()
  })

  it('does nothing for a site that is not a product', async () => {
    const { plugin, reads } = setup(found)
    const config = await plugin.config({ root: '/repo/sites/home' }, { command: 'build' })
    expect(config.define.__LEVIX_RELEASE__).toBe('null')
    expect(reads).toEqual([])
    plugin.configResolved({ build: {} })
    expect(emitted(plugin)).toEqual([])
  })
})
