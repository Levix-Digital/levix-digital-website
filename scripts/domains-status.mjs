// Read-only check of the custom domains: for each domain in domains.json, the states Firebase
// Hosting reports (ownership, host, certificate) and the DNS records it still asks for.
// Run it with your own Google login: npm run domains:status [-- <site>...]
import { pathToFileURL } from 'node:url'
import { readDomains, ZONE } from './lib/domains-config.mjs'
import { readHostingConfig, selectTargets } from './lib/hosting-config.mjs'
import { runCommand } from './lib/run.mjs'

export const ACTIVE = { ownership: 'OWNERSHIP_ACTIVE', host: 'HOST_ACTIVE', certificate: 'CERT_ACTIVE' }

/**
 * @typedef {import('./lib/run.mjs').Runner} Runner
 * @typedef {import('./lib/domains-config.mjs').CustomDomain} CustomDomain
 * @typedef {(url: string, token: string, project: string) => Promise<{ status: number, body: Record<string, any> }>} GetJson
 * @typedef {{ action: 'add' | 'remove', type: string, host: string, value: string }} RecordRow
 * @typedef {{ domain: CustomDomain, active: boolean, line: string, records: RecordRow[] }} DomainReport
 */

/** @type {GetJson} */
export async function getJson(url, token, project) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'x-goog-user-project': project } })
  return { status: response.status, body: await response.json() }
}

/**
 * The host of a record as it is entered in the zone: `@` for the apex, the labels before it otherwise.
 * @param {string} name
 */
export function zoneHost(name) {
  const bare = name.replace(/\.$/, '')
  if (bare === ZONE) return '@'
  return bare.endsWith(`.${ZONE}`) ? bare.slice(0, -ZONE.length - 1) : bare
}

/**
 * The records Firebase asks to add (desired) and to remove (discovered).
 * @param {Record<string, any>} customDomain
 * @returns {RecordRow[]}
 */
export function recordRows(customDomain) {
  const updates = customDomain.requiredDnsUpdates ?? {}
  /** @type {RecordRow[]} */
  const rows = []
  for (const [list, wanted, action] of /** @type {const} */ ([['desired', 'ADD', 'add'], ['discovered', 'REMOVE', 'remove']])) {
    for (const set of updates[list] ?? []) {
      for (const record of set.records ?? []) {
        if (record.requiredAction !== wanted) continue
        rows.push({ action, type: record.type, host: zoneHost(record.domainName ?? set.domainName), value: record.rdata })
      }
    }
  }
  return rows
}

/**
 * @param {CustomDomain} domain
 * @param {{ status: number, body: Record<string, any> }} answer
 * @returns {DomainReport}
 */
export function describeDomain(domain, answer) {
  const label = `${domain.domain} (${domain.target})`
  if (answer.status === 404) {
    return { domain, active: false, line: `${label} not connected to ${domain.siteId}`, records: [] }
  }
  if (answer.status !== 200) {
    return { domain, active: false, line: `${label} answered ${answer.status}: ${answer.body.error?.message ?? ''}`, records: [] }
  }
  const body = answer.body
  const states = { ownership: body.ownershipState, host: body.hostState, certificate: body.cert?.state }
  const active = Object.entries(ACTIVE).every(([key, value]) => states[/** @type {keyof typeof ACTIVE} */ (key)] === value)
  const checked = body.requiredDnsUpdates?.checkTime ? `  checked ${body.requiredDnsUpdates.checkTime}` : ''
  const line = `${label}  ownership ${states.ownership ?? '-'}  host ${states.host ?? '-'}  certificate ${states.certificate ?? '-'}${checked}`
  return { domain, active, line, records: recordRows(body) }
}

/**
 * @param {Runner} run
 * @param {string} project
 * @param {CustomDomain[]} domains
 * @param {GetJson} get
 * @returns {Promise<DomainReport[]>}
 */
export async function domainsStatus(run, project, domains, get = getJson) {
  const token = await run('gcloud', ['auth', 'print-access-token', '--quiet'])
  if (token.code !== 0) throw new Error(`gcloud auth print-access-token failed: ${token.stderr.trim()}`)
  /** @type {DomainReport[]} */
  const reports = []
  for (const domain of domains) {
    const url = `https://firebasehosting.googleapis.com/v1beta1/projects/${project}/sites/${domain.siteId}/customDomains/${domain.domain}`
    reports.push(describeDomain(domain, await get(url, token.stdout.trim(), project)))
  }
  return reports
}

/** @param {DomainReport[]} reports */
export function formatReports(reports) {
  return reports.flatMap((report) => [
    `${report.active ? 'ok   ' : 'error'} ${report.line}`,
    ...report.records.map((row) => `  ${row.action.padEnd(7)} ${row.type.padEnd(6)} ${row.host.padEnd(16)} ${row.value}`),
  ]).join('\n')
}

/**
 * @param {string[]} sites
 * @param {{ run?: Runner, get?: GetJson, root?: string, log?: (text: string) => void }} options
 */
export async function main(sites, options = {}) {
  const { run = runCommand, get = getJson, root = '.', log = console.log } = options
  const config = readHostingConfig(root)
  const names = selectTargets(config, sites).map((target) => target.name)
  const domains = readDomains(config, root).filter((domain) => names.includes(domain.target))
  const reports = await domainsStatus(run, config.projectId, domains, get)
  log(formatReports(reports))
  const pending = reports.filter((report) => !report.active).map((report) => report.domain.domain)
  if (pending.length > 0) throw new Error(`not active: ${pending.join(', ')}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((/** @type {Error} */ error) => {
    console.error(`error ${error.message}`)
    process.exit(1)
  })
}
