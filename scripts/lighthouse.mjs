// Audits every built site with Lighthouse CI and the budgets in lighthouserc.json.
// Usage: node scripts/lighthouse.mjs [<site>...]
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { builtTargets } from './hosting-deploy.mjs'
import { readHostingConfig } from './lib/hosting-config.mjs'
import { runCommand } from './lib/run.mjs'

export const REPORTS_DIR = '.lighthouseci'
const LHCI_ENTRY = join('node_modules', '@lhci', 'cli', 'src', 'cli.js')

/**
 * @typedef {import('./lib/hosting-config.mjs').HostingTarget} HostingTarget
 * @typedef {import('./lib/run.mjs').Runner} Runner
 */

/**
 * The Lighthouse CI arguments that audit one site's output folder.
 * @param {HostingTarget} target
 * @returns {string[]}
 */
export function lighthouseArgs(target) {
  return [
    LHCI_ENTRY,
    'autorun',
    '--config=lighthouserc.json',
    `--collect.staticDistDir=${target.folder}`,
    `--upload.outputDir=${REPORTS_DIR}/${target.name}`,
  ]
}

/**
 * Audits every requested site, then fails naming the sites over budget.
 * @param {string[]} argv
 * @param {Runner} run
 * @param {string} root
 */
export async function main(argv, run = runCommand, root = '.') {
  const targets = builtTargets(readHostingConfig(root), argv, root)
  const failed = []
  for (const target of targets) {
    console.log(`lighthouse ${target.name}`)
    const result = await run(process.execPath, lighthouseArgs(target), { stream: true })
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
