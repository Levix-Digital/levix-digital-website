// Checks that the default address and the custom domain of each published site answer its home page.
// Usage: node scripts/verify-live.mjs <site>...
import { pathToFileURL } from 'node:url'
import { readDomains } from './lib/domains-config.mjs'
import { readHostingConfig, selectTargets } from './lib/hosting-config.mjs'

/**
 * @typedef {(url: string) => Promise<{ status: number, headers: { get(name: string): string | null } }>} Fetch
 * @typedef {{ fetch?: Fetch, attempts?: number, delayMs?: number, root?: string }} VerifyOptions
 */

/** @param {string} siteId */
export function liveAddress(siteId) {
  return `https://${siteId}.web.app/`
}

/** @param {string} domain */
export function domainAddress(domain) {
  return `https://${domain}/`
}

/**
 * Requests one address until it answers 200 with HTML or the attempts run out.
 * @param {string} url
 * @param {Fetch} fetcher
 * @param {number} attempts
 * @param {number} delayMs
 * @returns {Promise<string | null>} null when it answered, otherwise the last problem
 */
export async function checkAddress(url, fetcher, attempts, delayMs) {
  let problem = 'not requested'
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetcher(url)
      const type = response.headers.get('content-type') ?? ''
      if (response.status === 200 && type.includes('text/html')) return null
      problem = `status ${response.status}, ${type || 'no content type'}`
    } catch (error) {
      problem = /** @type {Error} */ (error).message
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return problem
}

/**
 * @param {string[]} sites
 * @param {VerifyOptions} options
 */
export async function main(sites, options = {}) {
  const { fetch: fetcher = fetch, attempts = 5, delayMs = 3000, root = '.' } = options
  if (sites.length === 0) throw new Error('name the sites to check')
  const config = readHostingConfig(root)
  const domains = readDomains(config, root)
  const failed = []
  for (const target of selectTargets(config, sites)) {
    const domain = domains.find((entry) => entry.target === target.name)
    const urls = [liveAddress(target.siteId), ...(domain ? [domainAddress(domain.domain)] : [])]
    for (const url of urls) {
      const problem = await checkAddress(url, fetcher, attempts, delayMs)
      if (problem === null) {
        console.log(`ok ${target.name}: ${url}`)
      } else {
        console.error(`error ${target.name}: ${url} ${problem}`)
        failed.push(url)
      }
    }
  }
  if (failed.length > 0) throw new Error(`not answering: ${failed.join(', ')}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((/** @type {Error} */ error) => {
    console.error(`error ${error.message}`)
    process.exit(1)
  })
}
