// Reads the hosting configuration: firebase.json (what each target serves) and .firebaserc
// (the project and the hosting site of each target).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * @typedef {{ name: string, siteId: string, folder: string, entry: Record<string, unknown> }} HostingTarget
 * @typedef {{ projectId: string, targets: HostingTarget[] }} HostingConfig
 */

/**
 * @param {string} [root] repository root
 * @returns {HostingConfig}
 */
export function readHostingConfig(root = '.') {
  const firebase = JSON.parse(readFileSync(join(root, 'firebase.json'), 'utf8'))
  const rc = JSON.parse(readFileSync(join(root, '.firebaserc'), 'utf8'))
  const projectId = rc.projects?.default
  if (!projectId) throw new Error('.firebaserc has no default project')
  const sites = rc.targets?.[projectId]?.hosting ?? {}
  const targets = (firebase.hosting ?? []).map((/** @type {Record<string, any>} */ entry) => {
    const name = entry.target
    const siteId = sites[name]?.[0]
    if (!siteId) throw new Error(`hosting target "${name}" has no site in .firebaserc`)
    return { name, siteId, folder: entry.public, entry }
  })
  return { projectId, targets }
}

/**
 * Resolves site names to targets; no names means every target.
 * @param {HostingConfig} config
 * @param {string[]} names
 * @returns {HostingTarget[]}
 */
export function selectTargets(config, names) {
  if (names.length === 0) return config.targets
  const unknown = names.filter((name) => !config.targets.some((target) => target.name === name))
  if (unknown.length > 0) {
    const known = config.targets.map((target) => target.name).join(', ')
    throw new Error(`unknown site ${unknown.join(', ')} (sites: ${known})`)
  }
  return config.targets.filter((target) => names.includes(target.name))
}
