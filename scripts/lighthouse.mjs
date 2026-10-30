// Audits every page of every built site with Lighthouse CI and the budgets in lighthouserc.json.
// Runs inside the hosting emulator, so pages are audited at their clean URLs with the hosting
// rules: npm run lighthouse (after npm run build). Usage: node scripts/lighthouse.mjs [<site>...]
import { readdirSync } from 'node:fs'
import { join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { builtTargets } from './hosting-deploy.mjs'
import { emulatorBases } from './lib/emulator.mjs'
import { readHostingConfig } from './lib/hosting-config.mjs'
import { runCommand } from './lib/run.mjs'

export const REPORTS_DIR = '.lighthouseci'
const LHCI_ENTRY = join('node_modules', '@lhci', 'cli', 'src', 'cli.js')
const NOT_FOUND_PAGE = '404.html'

/**
 * @typedef {import('./lib/hosting-config.mjs').HostingTarget} HostingTarget
 * @typedef {import('./lib/run.mjs').Runner} Runner
 */

/**
 * The clean URL path of every prerendered page in a site's output folder: `index.html` is `/`,
 * `about.html` is `/about` and `research/index.html` is `/research`. The not-found page is left out.
 * @param {string} folder
 * @returns {string[]}
 */
export function pagePaths(folder) {
  const files = /** @type {string[]} */ (readdirSync(folder, { recursive: true }))
  return files
    .map((file) => file.split(sep).join('/'))
    .filter((file) => file.endsWith('.html') && file !== NOT_FOUND_PAGE)
    .map((file) => '/' + file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''))
    .map((path) => (path.length > 1 ? path.replace(/\/$/, '') : path))
    .sort()
}

/**
 * The Lighthouse CI arguments that audit the given pages of one site.
 * @param {HostingTarget} target
 * @param {string[]} urls
 * @returns {string[]}
 */
export function lighthouseArgs(target, urls) {
  return [
    LHCI_ENTRY,
    'autorun',
    '--config=lighthouserc.json',
    ...urls.map((url) => `--collect.url=${url}`),
    `--upload.outputDir=${REPORTS_DIR}/${target.name}`,
  ]
}

/**
 * Audits every requested site, then fails naming the sites over budget.
 * @param {string[]} argv
 * @param {{ run?: Runner, root?: string, bases?: (names: string[]) => Promise<Map<string, string>> }} options
 */
export async function main(argv, { run = runCommand, root = '.', bases = emulatorBases } = {}) {
  const config = readHostingConfig(root)
  const targets = builtTargets(config, argv, root)
  const addresses = await bases(config.targets.map((target) => target.name))
  const failed = []
  for (const target of targets) {
    const urls = pagePaths(join(root, target.folder)).map((path) => `${addresses.get(target.name)}${path}`)
    console.log(`lighthouse ${target.name}: ${urls.join(' ')}`)
    const result = await run(process.execPath, lighthouseArgs(target, urls), { stream: true })
    if (result.code !== 0) failed.push(target.name)
  }
  if (failed.length > 0) throw new Error(`over budget or not audited: ${failed.join(', ')} (reports in ${REPORTS_DIR}/)`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((/** @type {Error} */ error) => {
    console.error(`error ${error.message}`)
    process.exit(1)
  })
}
