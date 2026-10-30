// Publishes built sites to their Firebase Hosting sites, live or to a preview channel.
// Usage: node scripts/hosting-deploy.mjs [--channel <id>] [<site>...]
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readHostingConfig, selectTargets } from './lib/hosting-config.mjs'
import { FIREBASE_CLI, runCommand } from './lib/run.mjs'

export const PREVIEW_EXPIRES = '7d'
export const PREVIEW_MARKER = '<!-- hosting-preview -->'

/**
 * @typedef {import('./lib/hosting-config.mjs').HostingConfig} HostingConfig
 * @typedef {import('./lib/hosting-config.mjs').HostingTarget} HostingTarget
 * @typedef {import('./lib/run.mjs').Runner} Runner
 * @typedef {{ channel: string | null, sites: string[] }} DeployOptions
 */

/**
 * @param {string[]} argv
 * @returns {DeployOptions}
 */
export function parseArgs(argv) {
  /** @type {DeployOptions} */
  const options = { channel: null, sites: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = /** @type {string} */ (argv[i])
    if (arg === '--channel') {
      const channel = argv[++i]
      if (!channel || channel.startsWith('-')) throw new Error('--channel needs a channel id')
      options.channel = channel
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown option ${arg}`)
    } else {
      options.sites.push(arg)
    }
  }
  return options
}

/**
 * The requested targets, refusing any whose build is missing.
 * @param {HostingConfig} config
 * @param {string[]} sites
 * @param {string} root
 * @returns {HostingTarget[]}
 */
export function builtTargets(config, sites, root = '.') {
  const targets = selectTargets(config, sites)
  const unbuilt = targets.filter((target) => !existsSync(join(root, target.folder, 'index.html')))
  if (unbuilt.length > 0) {
    const names = unbuilt.map((target) => target.name).join(', ')
    throw new Error(`not built: ${names} (run npm run build first)`)
  }
  return targets
}

/**
 * The Firebase CLI arguments for a live or preview deploy.
 * @param {HostingConfig} config
 * @param {HostingTarget[]} targets
 * @param {string | null} channel
 * @returns {string[]}
 */
export function deployArgs(config, targets, channel) {
  const project = ['--project', config.projectId, '--non-interactive']
  if (channel === null) {
    return ['deploy', '--only', targets.map((target) => `hosting:${target.name}`).join(','), ...project]
  }
  const only = targets.map((target) => target.name).join(',')
  return ['hosting:channel:deploy', channel, '--only', only, '--expires', PREVIEW_EXPIRES, '--no-authorized-domains', '--json', ...project]
}

/**
 * Markdown table of the preview addresses, from the CLI's JSON output.
 * @param {HostingConfig} config
 * @param {string} channel
 * @param {string} cliJson
 * @returns {string}
 */
export function previewTable(config, channel, cliJson) {
  const parsed = JSON.parse(cliJson)
  if (parsed.status !== 'success') throw new Error(`preview deploy failed: ${parsed.error ?? cliJson}`)
  /** @type {Record<string, { site: string, url: string, expireTime: string }>} */
  const results = parsed.result
  // The CLI keys each result by the target name; older versions keyed it by the site id.
  const rows = config.targets.flatMap((target) => {
    const result = results[target.name] ?? results[target.siteId]
    return result ? [`| ${target.name} | ${result.url} | ${result.expireTime.slice(0, 10)} |`] : []
  })
  return [
    PREVIEW_MARKER,
    `### Preview \`${channel}\``,
    '',
    '| Site | Address | Expires |',
    '|---|---|---|',
    ...rows,
    '',
  ].join('\n')
}

/**
 * @param {string[]} argv
 * @param {Runner} run
 * @param {string} root
 */
export async function main(argv, run = runCommand, root = '.') {
  const options = parseArgs(argv)
  const config = readHostingConfig(root)
  const targets = builtTargets(config, options.sites, root)
  const preview = options.channel !== null
  const result = await run(FIREBASE_CLI, deployArgs(config, targets, options.channel), { stream: !preview })
  if (result.code !== 0) {
    if (preview) process.stderr.write(result.stdout + result.stderr)
    throw new Error(`firebase exited with code ${result.code}`)
  }
  if (preview) process.stdout.write(previewTable(config, /** @type {string} */ (options.channel), result.stdout))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((/** @type {Error} */ error) => {
    console.error(`error ${error.message}`)
    process.exit(1)
  })
}
