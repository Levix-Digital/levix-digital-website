// Reads domains.json: the custom domain of each hosting target.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** The DNS zone every custom domain belongs to. */
export const ZONE = 'levix.digital'

/**
 * @typedef {import('./hosting-config.mjs').HostingConfig} HostingConfig
 * @typedef {{ target: string, siteId: string, domain: string }} CustomDomain
 */

/**
 * Checks the domain list against the hosting targets: one domain per target, each used once.
 * @param {Record<string, unknown>} domains
 * @param {HostingConfig} config
 * @returns {CustomDomain[]}
 */
export function resolveDomains(domains, config) {
  const unknown = Object.keys(domains).filter((name) => !config.targets.some((target) => target.name === name))
  if (unknown.length > 0) throw new Error(`domains.json names unknown sites: ${unknown.join(', ')}`)
  /** @type {CustomDomain[]} */
  const resolved = []
  for (const target of config.targets) {
    const domain = domains[target.name]
    if (typeof domain !== 'string' || domain === '') throw new Error(`domains.json has no domain for ${target.name}`)
    if (domain !== ZONE && !domain.endsWith(`.${ZONE}`)) throw new Error(`domain ${domain} is outside ${ZONE}`)
    if (resolved.some((entry) => entry.domain === domain)) throw new Error(`domain ${domain} is listed twice`)
    resolved.push({ target: target.name, siteId: target.siteId, domain })
  }
  return resolved
}

/**
 * @param {HostingConfig} config
 * @param {string} [root] repository root
 * @returns {CustomDomain[]}
 */
export function readDomains(config, root = '.') {
  return resolveDomains(JSON.parse(readFileSync(join(root, 'domains.json'), 'utf8')), config)
}
