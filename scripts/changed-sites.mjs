// Prints the sites a push publishes: from the files changed between two commits, or from a
// manual list. Usage:
//   node scripts/changed-sites.mjs --base <sha> --head <sha>
//   node scripts/changed-sites.mjs --sites "<site> <site>"   (empty: every site)
import { pathToFileURL } from 'node:url'
import { readHostingConfig, selectTargets } from './lib/hosting-config.mjs'
import { runCommand } from './lib/run.mjs'

/**
 * @typedef {import('./lib/run.mjs').Runner} Runner
 * @typedef {{ base: string | null, head: string | null, sites: string | null }} ChangedOptions
 */

/** Paths that change no site: documentation, specifications and tool settings. */
const NO_SITE = [/^docs\//, /^specs\//, /^\.specify\//, /^\.claude\//, /^tests\/MANUAL_TESTS\.md$/, /^[^/]+\.md$/, /^LICENSE$/, /^\.github\/workflows\/preview\.yml$/]
const SITE_FILE = /^sites\/([^/]+)\//

/**
 * The sites the changed paths affect, in the order of `sites`: a file of one site selects that
 * site, a file in NO_SITE selects none, and any other file selects every site.
 * @param {string[]} paths
 * @param {string[]} sites
 * @returns {{ sites: string[], reasons: string[] }}
 */
export function sitesForPaths(paths, sites) {
  const selected = new Set()
  const reasons = []
  for (const path of paths) {
    const site = path.match(SITE_FILE)?.[1]
    if (site !== undefined && sites.includes(site)) {
      selected.add(site)
      reasons.push(`${path}: ${site}`)
    } else if (NO_SITE.some((pattern) => pattern.test(path))) {
      reasons.push(`${path}: no site`)
    } else {
      sites.forEach((name) => selected.add(name))
      reasons.push(`${path}: every site`)
    }
  }
  return { sites: sites.filter((name) => selected.has(name)), reasons }
}

/**
 * @param {string[]} argv
 * @returns {ChangedOptions}
 */
export function parseArgs(argv) {
  /** @type {ChangedOptions} */
  const options = { base: null, head: null, sites: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const value = argv[i + 1]
    if (arg !== '--base' && arg !== '--head' && arg !== '--sites') throw new Error(`unknown option ${arg}`)
    if (value === undefined) throw new Error(`${arg} needs a value`)
    options[/** @type {'base' | 'head' | 'sites'} */ (arg.slice(2))] = value
    i++
  }
  if (options.sites === null && options.head === null) throw new Error('give --base and --head, or --sites')
  return options
}

/**
 * @param {string[]} argv
 * @param {Runner} run
 * @param {string} root
 * @returns {Promise<{ sites: string[], reasons: string[] }>}
 */
export async function changedSites(argv, run = runCommand, root = '.') {
  const options = parseArgs(argv)
  const config = readHostingConfig(root)
  const all = config.targets.map((target) => target.name)
  if (options.sites !== null) {
    const names = options.sites.split(/\s+/).filter(Boolean)
    return { sites: selectTargets(config, names).map((target) => target.name), reasons: [names.length ? 'chosen by hand' : 'every site chosen by hand'] }
  }
  const base = options.base ?? ''
  if (/^0*$/.test(base)) return { sites: all, reasons: ['no previous commit: every site'] }
  const known = await run('git', ['cat-file', '-e', `${base}^{commit}`])
  if (known.code !== 0) return { sites: all, reasons: [`${base} is not in the history: every site`] }
  const diff = await run('git', ['diff', '--name-only', base, /** @type {string} */ (options.head)])
  if (diff.code !== 0) throw new Error(`git diff failed: ${diff.stderr.trim()}`)
  return sitesForPaths(diff.stdout.split('\n').filter(Boolean), all)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  changedSites(process.argv.slice(2))
    .then(({ sites, reasons }) => {
      for (const reason of reasons) console.error(reason)
      console.error(sites.length ? `sites: ${sites.join(' ')}` : 'sites: none')
      if (sites.length) console.log(sites.join('\n'))
    })
    .catch((/** @type {Error} */ error) => {
      console.error(`error ${error.message}`)
      process.exit(1)
    })
}
