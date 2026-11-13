import { basename } from 'node:path'
import type { Plugin } from 'vite'
import {
  type ReadOptions,
  type ReleaseInfo,
  type ReleaseProduct,
  type ReleaseResult,
  readRelease,
  releaseMarker,
} from '../packages/content/src/releases.ts'

/** What the plugin needs to know about the site's product; `null` for a site that is not a product. */
export type ProductLookup = (siteId: string) => ReleaseProduct | null

export interface ReleaseInfoOptions {
  readonly lookup: ProductLookup
  readonly read?: (product: ReleaseProduct, options: ReadOptions) => Promise<ReleaseResult>
  readonly token?: string | undefined
  readonly now?: () => Date
  readonly log?: (line: string) => void
}

/**
 * Reads the latest release of the site's product while the site is built (FEAT-016, ADR-0016):
 * the page gets it as `__LEVIX_RELEASE__` (read by `buildRelease` of `@levix/ui`) and the site
 * publishes `/release.json`, which the release refresh compares. Outside a build (dev server, tests)
 * nothing is read and the release is `null`. A failure is logged and gives `null` too.
 */
export function releaseInfo(options: ReleaseInfoOptions): Plugin {
  const read = options.read ?? readRelease
  const log = options.log ?? ((line: string) => console.warn(line))
  let product: ReleaseProduct | null = null
  let release: ReleaseInfo | null = null
  let ssr = false

  return {
    name: 'levix-release-info',
    async config(config, env) {
      product = options.lookup(basename(config.root ?? process.cwd()))
      release = null
      if (env.command === 'build' && product !== null) {
        // The client and the server builds of one site run in one process: read once.
        const result = await cachedRead(product, () =>
          read(product as ReleaseProduct, options.token ? { token: options.token } : {}),
        )
        for (const warning of result.warnings) log(`release info: ${warning}`)
        release = result.release
      }
      return { define: { __LEVIX_RELEASE__: JSON.stringify(release) } }
    },
    configResolved(resolved) {
      ssr = Boolean(resolved.build.ssr)
    },
    generateBundle() {
      if (product === null || ssr) return
      const marker = releaseMarker(product, release, (options.now ?? (() => new Date()))())
      this.emitFile({ type: 'asset', fileName: 'release.json', source: `${JSON.stringify(marker, null, 2)}\n` })
    },
  }
}

const reads = new Map<string, Promise<ReleaseResult>>()

function cachedRead(product: ReleaseProduct, read: () => Promise<ReleaseResult>): Promise<ReleaseResult> {
  const key = `${product.id}:${product.status}:${product.releases.repository}`
  let pending = reads.get(key)
  if (pending === undefined) {
    pending = read()
    reads.set(key, pending)
  }
  return pending
}

/** Forgets the cached reads; for tests. */
export function clearReleaseCache(): void {
  reads.clear()
}
