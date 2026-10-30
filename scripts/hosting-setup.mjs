// One-time, idempotent setup of the Firebase project for the website: the hosting sites and the
// keyless deploy identity used by the repository's workflows. Run it with your own Google login
// (gcloud and the Firebase CLI), for example in Cloud Shell: npm run hosting:setup
import { pathToFileURL } from 'node:url'
import { readHostingConfig } from './lib/hosting-config.mjs'
import { FIREBASE_CLI, runCommand } from './lib/run.mjs'

/** Numeric id of Levix-Digital/levix-digital-website; unlike the name, it cannot be reused by another repository. */
export const GITHUB_REPOSITORY_ID = '1439834754'
export const POOL = 'github'
export const PROVIDER = 'github-actions'
export const SERVICE_ACCOUNT = 'hosting-deployer'
export const REQUIRED_APIS = [
  'firebasehosting.googleapis.com',
  'iam.googleapis.com',
  'iamcredentials.googleapis.com',
  'sts.googleapis.com',
]
// Hosting Admin publishes releases and channels; Service Usage Consumer lets the CLI check that the
// Hosting API is enabled before it deploys.
export const DEPLOY_ROLES = ['roles/firebasehosting.admin', 'roles/serviceusage.serviceUsageConsumer']

/**
 * @typedef {import('./lib/run.mjs').Runner} Runner
 * @typedef {{ resource: string, state: 'created' | 'exists' }} Step
 * @typedef {(url: string, token: string) => Promise<Record<string, unknown>>} FetchJson
 */

export class SetupError extends Error {}

/** @type {FetchJson} */
export async function fetchJson(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const body = await response.json()
  if (!response.ok) throw new SetupError(`${url} answered ${response.status}: ${body.error?.message ?? ''}`)
  return body
}

/**
 * @param {Runner} run
 * @param {string[]} args
 */
function gcloud(run, args) {
  return run('gcloud', [...args, '--quiet'])
}

/**
 * Runs gcloud and fails with its error output.
 * @param {Runner} run
 * @param {string[]} args
 */
async function gcloudOk(run, args) {
  const result = await gcloud(run, args)
  if (result.code !== 0) throw new SetupError(`gcloud ${args.slice(0, 4).join(' ')} failed: ${result.stderr.trim()}`)
  return result.stdout.trim()
}

/**
 * Checks project, billing and the caller's ownership before anything is changed.
 * @param {Runner} run
 * @param {string} project
 * @param {FetchJson} fetchJson
 * @returns {Promise<string>} the project number
 */
export async function preflight(run, project, fetchJson) {
  const described = await gcloud(run, ['projects', 'describe', project, '--format=value(projectNumber)'])
  if (described.code !== 0) {
    throw new SetupError(`project ${project} not found or not accessible; create it in the Firebase console first`)
  }
  // The Cloud Billing API is asked directly: `gcloud billing projects` is missing from older
  // gcloud releases.
  const token = await gcloudOk(run, ['auth', 'print-access-token'])
  const billing = await fetchJson(`https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`, token)
  if (billing.billingEnabled !== true) {
    throw new SetupError(`billing is not enabled on ${project}; switch it to the Blaze plan in the Firebase console`)
  }
  const account = await gcloudOk(run, ['config', 'get-value', 'account'])
  const owners = await gcloudOk(run, [
    'projects', 'get-iam-policy', project, '--flatten=bindings[].members',
    '--filter=bindings.role=roles/owner', '--format=value(bindings.members)',
  ])
  if (!owners.split(/\s+/).includes(`user:${account}`)) {
    throw new SetupError(`${account} is not an owner of ${project}; run the setup with an owner account`)
  }
  return described.stdout.trim()
}

/**
 * @param {Runner} run
 * @param {string} project
 * @returns {Promise<Step[]>}
 */
async function ensureApis(run, project) {
  const enabled = (await gcloudOk(run, ['services', 'list', '--enabled', `--project=${project}`, '--format=value(config.name)']))
    .split(/\s+/)
  const missing = REQUIRED_APIS.filter((api) => !enabled.includes(api))
  if (missing.length > 0) await gcloudOk(run, ['services', 'enable', ...missing, `--project=${project}`])
  return REQUIRED_APIS.map((api) => ({ resource: `API ${api}`, state: missing.includes(api) ? 'created' : 'exists' }))
}

/**
 * @param {Runner} run
 * @param {string} project
 * @param {string[]} siteIds
 * @returns {Promise<Step[]>}
 */
async function ensureSites(run, project, siteIds) {
  const listed = await run(FIREBASE_CLI, ['hosting:sites:list', '--project', project, '--json'])
  if (listed.code !== 0) throw new SetupError(`listing hosting sites failed: ${listed.stderr.trim()}`)
  /** @type {{ name: string }[]} */
  const sites = JSON.parse(listed.stdout).result?.sites ?? []
  const existing = sites.map((site) => site.name.split('/').pop())
  /** @type {Step[]} */
  const steps = []
  for (const siteId of siteIds) {
    if (existing.includes(siteId)) {
      steps.push({ resource: `hosting site ${siteId}`, state: 'exists' })
      continue
    }
    const created = await run(FIREBASE_CLI, ['hosting:sites:create', siteId, '--project', project, '--non-interactive'])
    if (created.code !== 0) {
      throw new SetupError(`creating hosting site ${siteId} failed (the id may be taken; change it in .firebaserc): ${created.stderr.trim()}`)
    }
    steps.push({ resource: `hosting site ${siteId}`, state: 'created' })
  }
  return steps
}

/**
 * Describes a resource and creates it when the description fails.
 * @param {Runner} run
 * @param {string} resource
 * @param {string[]} describeArgs
 * @param {string[]} createArgs
 * @returns {Promise<Step>}
 */
async function ensureResource(run, resource, describeArgs, createArgs) {
  if ((await gcloud(run, describeArgs)).code === 0) return { resource, state: 'exists' }
  await gcloudOk(run, createArgs)
  return { resource, state: 'created' }
}

/**
 * Adds a role binding when the policy does not have it yet.
 * @param {Runner} run
 * @param {string} resource
 * @param {string[]} target the gcloud command group and resource, e.g. ['projects', 'my-project']
 * @param {string} role
 * @param {string} member
 * @param {string[]} extra
 * @returns {Promise<Step>}
 */
async function ensureBinding(run, resource, target, role, member, extra = []) {
  const [group, name] = /** @type {[string, string]} */ (target)
  const policy = JSON.parse(await gcloudOk(run, [...group.split(' '), 'get-iam-policy', name, ...extra, '--format=json']))
  /** @type {{ role: string, members: string[] }[]} */
  const bindings = policy.bindings ?? []
  if (bindings.some((binding) => binding.role === role && binding.members.includes(member))) {
    return { resource, state: 'exists' }
  }
  const condition = group === 'projects' ? ['--condition=None'] : []
  await gcloudOk(run, [...group.split(' '), 'add-iam-policy-binding', name, `--role=${role}`, `--member=${member}`, ...condition, ...extra])
  return { resource, state: 'created' }
}

/**
 * @param {Runner} run
 * @param {string} project
 * @param {string[]} siteIds
 * @param {(step: Step) => void} report
 * @param {FetchJson} getJson
 * @returns {Promise<{ provider: string, serviceAccount: string }>}
 */
export async function setup(run, project, siteIds, report = () => {}, getJson = fetchJson) {
  const projectNumber = await preflight(run, project, getJson)
  const location = ['--location=global', `--project=${project}`]
  const serviceAccount = `${SERVICE_ACCOUNT}@${project}.iam.gserviceaccount.com`
  const poolName = `projects/${projectNumber}/locations/global/workloadIdentityPools/${POOL}`
  const provider = `${poolName}/providers/${PROVIDER}`
  const repositoryMember = `principalSet://iam.googleapis.com/${poolName}/attribute.repository_id/${GITHUB_REPOSITORY_ID}`

  for (const step of await ensureApis(run, project)) report(step)
  for (const step of await ensureSites(run, project, siteIds)) report(step)
  report(await ensureResource(run, `identity pool ${POOL}`,
    ['iam', 'workload-identity-pools', 'describe', POOL, ...location],
    ['iam', 'workload-identity-pools', 'create', POOL, ...location, '--display-name=GitHub Actions']))
  report(await ensureResource(run, `identity provider ${PROVIDER}`,
    ['iam', 'workload-identity-pools', 'providers', 'describe', PROVIDER, `--workload-identity-pool=${POOL}`, ...location],
    ['iam', 'workload-identity-pools', 'providers', 'create-oidc', PROVIDER, `--workload-identity-pool=${POOL}`, ...location,
      '--display-name=GitHub repository',
      '--issuer-uri=https://token.actions.githubusercontent.com',
      '--attribute-mapping=google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository=assertion.repository',
      `--attribute-condition=assertion.repository_id=='${GITHUB_REPOSITORY_ID}'`]))
  report(await ensureResource(run, `service account ${serviceAccount}`,
    ['iam', 'service-accounts', 'describe', serviceAccount, `--project=${project}`],
    ['iam', 'service-accounts', 'create', SERVICE_ACCOUNT, `--project=${project}`, '--display-name=Hosting deployer']))
  for (const role of DEPLOY_ROLES) {
    report(await ensureBinding(run, `${role} for ${SERVICE_ACCOUNT}`, ['projects', project], role, `serviceAccount:${serviceAccount}`))
  }
  report(await ensureBinding(run, `repository may act as ${SERVICE_ACCOUNT}`, ['iam service-accounts', serviceAccount],
    'roles/iam.workloadIdentityUser', repositoryMember, [`--project=${project}`]))
  return { provider, serviceAccount }
}

async function main() {
  const config = readHostingConfig()
  const siteIds = config.targets.map((target) => target.siteId)
  const result = await setup(runCommand, config.projectId, siteIds, (step) => console.log(`${step.state.padEnd(7)} ${step.resource}`))
  console.log('\nRepository variables (GitHub, Settings, Secrets and variables, Actions, Variables):')
  console.log(`FIREBASE_WIF_PROVIDER=${result.provider}`)
  console.log(`FIREBASE_DEPLOY_SERVICE_ACCOUNT=${result.serviceAccount}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((/** @type {Error} */ error) => {
    console.error(`error ${error.message}`)
    process.exit(1)
  })
}
