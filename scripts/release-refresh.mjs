// Keeps the product sites on their latest release (FEAT-016): reads the /release.json each product
// site publishes, compares its version with the latest release of the product, and starts the
// production deploy for the sites that differ.
// Usage: node scripts/release-refresh.mjs [--dry-run]
// Environment: GITHUB_TOKEN (reads releases and starts the deploy), GITHUB_REPOSITORY (owner/name),
// GITHUB_REF_NAME (branch to deploy, default main), GITHUB_STEP_SUMMARY (optional report file).
import { appendFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readRelease } from '../packages/content/src/releases.ts'

/**
 * @typedef {import('../packages/content/src/releases.ts').FetchLike} FetchLike
 * @typedef {import('../packages/content/src/releases.ts').ReleaseMarker} ReleaseMarker
 * @typedef {{ site: string, action: 'deploy' | 'current' | 'skip' | 'error', detail: string }} SiteCheck
 * @typedef {{ fetch?: FetchLike & ((url: string, init?: Record<string, unknown>) => Promise<{ ok: boolean, status: number, json(): Promise<unknown> }>), token?: string, root?: string, log?: (line: string) => void }} WatchOptions
 */

const DEPLOY_WORKFLOW = 'deploy.yml'

/**
 * The product sites and their production addresses, from domains.json (every site but the home).
 * @param {string} root
 * @returns {{ site: string, domain: string }[]}
 */
export function productSites(root) {
  /** @type {Record<string, string>} */
  const domains = JSON.parse(readFileSync(join(root, 'domains.json'), 'utf8'))
  return Object.entries(domains)
    .filter(([site]) => site !== 'home')
    .map(([site, domain]) => ({ site, domain }))
}

/**
 * Checks one site: its published marker against the latest release of its product.
 * @param {{ site: string, domain: string }} entry
 * @param {WatchOptions} options
 * @returns {Promise<SiteCheck>}
 */
export async function checkSite(entry, options) {
  const fetcher = options.fetch ?? /** @type {never} */ (fetch)
  /** @type {unknown} */
  let marker
  try {
    const response = await fetcher(`https://${entry.domain}/release.json`, { headers: { 'cache-control': 'no-cache' } })
    if (response.status === 404) return { site: entry.site, action: 'skip', detail: 'publishes no release.json yet' }
    if (!response.ok) return { site: entry.site, action: 'error', detail: `release.json answered HTTP ${response.status}` }
    marker = await response.json()
  } catch (error) {
    return { site: entry.site, action: 'error', detail: `release.json not read (${/** @type {Error} */ (error).message})` }
  }
  if (!isMarker(marker)) return { site: entry.site, action: 'error', detail: 'release.json is malformed' }
  if (marker.status === 'in-development') return { site: entry.site, action: 'skip', detail: 'product in development' }

  const product = { id: marker.product, status: marker.status, releases: { repository: marker.repository } }
  const { release, warnings } = await readRelease(product, {
    fetch: fetcher,
    ...(options.token ? { token: options.token } : {}),
  })
  if (release === null) return { site: entry.site, action: 'error', detail: warnings.join('; ') || 'no release' }
  if (release.version === marker.version) return { site: entry.site, action: 'current', detail: release.version }
  return { site: entry.site, action: 'deploy', detail: `${marker.version ?? 'no version'} -> ${release.version}` }
}

/**
 * Starts the deploy workflow for the given sites.
 * @param {string[]} sites
 * @param {{ repository: string, ref: string, token: string }} target
 * @param {WatchOptions} options
 */
export async function dispatchDeploy(sites, target, options) {
  const fetcher = options.fetch ?? /** @type {never} */ (fetch)
  const url = `https://api.github.com/repos/${target.repository}/actions/workflows/${DEPLOY_WORKFLOW}/dispatches`
  const response = await fetcher(url, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${target.token}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify({ ref: target.ref, inputs: { sites: sites.join(' ') } }),
  })
  if (!response.ok) throw new Error(`deploy of ${sites.join(' ')} not started (HTTP ${response.status})`)
}

/**
 * @param {string[]} args
 * @param {WatchOptions & { env?: NodeJS.ProcessEnv }} options
 * @returns {Promise<{ checks: SiteCheck[], deployed: string[] }>}
 */
export async function main(args, options = {}) {
  const env = options.env ?? process.env
  const log = options.log ?? ((line) => console.log(line))
  const dryRun = args.includes('--dry-run')
  const token = options.token ?? env.GITHUB_TOKEN ?? ''
  const watchOptions = { ...options, ...(token ? { token } : {}) }

  const checks = []
  for (const entry of productSites(options.root ?? '.')) {
    const check = await checkSite(entry, watchOptions)
    log(`${check.action} ${check.site}: ${check.detail}`)
    checks.push(check)
  }
  const deployed = checks.filter((check) => check.action === 'deploy').map((check) => check.site)

  if (deployed.length > 0 && !dryRun) {
    const repository = env.GITHUB_REPOSITORY
    if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are needed to start the deploy')
    await dispatchDeploy(deployed, { repository, ref: env.GITHUB_REF_NAME || 'main', token }, watchOptions)
    log(`deploy started for: ${deployed.join(' ')}`)
  } else if (deployed.length === 0) {
    log('every product site is on its latest release')
  }

  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, summary(checks, deployed, dryRun))
  return { checks, deployed }
}

/**
 * @param {SiteCheck[]} checks
 * @param {string[]} deployed
 * @param {boolean} dryRun
 */
export function summary(checks, deployed, dryRun) {
  const rows = checks.map((check) => `| ${check.site} | ${check.action} | ${check.detail} |`)
  const outcome =
    deployed.length === 0
      ? 'No site to deploy.'
      : `${dryRun ? 'Would deploy' : 'Deploy started for'}: ${deployed.join(', ')}.`
  return ['## Release refresh', '', '| Site | Result | Detail |', '|---|---|---|', ...rows, '', outcome, ''].join('\n')
}

/**
 * @param {unknown} value
 * @returns {value is ReleaseMarker}
 */
function isMarker(value) {
  if (typeof value !== 'object' || value === null) return false
  const marker = /** @type {Record<string, unknown>} */ (value)
  return (
    typeof marker.product === 'string' &&
    typeof marker.repository === 'string' &&
    ['available', 'preview', 'in-development'].includes(/** @type {string} */ (marker.status)) &&
    (marker.version === null || typeof marker.version === 'string')
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).then(
    ({ checks }) => {
      // A site that could not be checked is reported, and the run fails so it is noticed; the
      // sites that could be checked were already handled.
      if (checks.some((check) => check.action === 'error')) process.exitCode = 1
    },
    (/** @type {Error} */ error) => {
      console.error(`error ${error.message}`)
      process.exit(1)
    },
  )
}
