import { describe, expect, it } from 'vitest'
import { DEPLOY_ROLES, GITHUB_REPOSITORY_ID, REQUIRED_APIS, setup } from './hosting-setup.mjs'

const PROJECT = 'levix-digital'
const SITES = ['levix-digital', 'levix-anycontext']
const OWNER = 'owner@example.com'

/** A fake Google project answering the gcloud and firebase commands the setup runs. */
function fakeCloud({ billing = true, owner = true } = {}) {
  const state = {
    apis: new Set(['firebasehosting.googleapis.com']),
    sites: new Set(['levix-digital']),
    resources: new Set(),
    /** @type {Map<string, { role: string, members: string[] }[]>} */
    policies: new Map([['project', [{ role: 'roles/owner', members: owner ? [`user:${OWNER}`] : [] }]]]),
  }
  /** @type {string[]} */
  const calls = []
  const ok = (stdout = '') => ({ code: 0, stdout, stderr: '' })
  const fail = { code: 1, stdout: '', stderr: 'NOT_FOUND' }

  /** @type {import('./lib/run.mjs').Runner} */
  async function run(command, args) {
    const line = `${command.includes('firebase') ? 'firebase' : 'gcloud'} ${args.filter((a) => a !== '--quiet').join(' ')}`
    calls.push(line)
    if (line.startsWith('gcloud projects describe')) return ok('123456\n')
    if (line.startsWith('gcloud auth print-access-token')) return ok('token\n')
    if (line.startsWith('gcloud config get-value account')) return ok(`${OWNER}\n`)
    if (line.includes('get-iam-policy') && line.includes('--filter=bindings.role=roles/owner')) {
      return ok(state.policies.get('project')?.find((b) => b.role === 'roles/owner')?.members.join('\n') ?? '')
    }
    if (line.startsWith('gcloud services list')) return ok([...state.apis].join('\n'))
    if (line.startsWith('gcloud services enable')) {
      for (const api of args.slice(2)) if (api.endsWith('.googleapis.com')) state.apis.add(api)
      return ok()
    }
    if (line.startsWith('firebase hosting:sites:list')) {
      return ok(JSON.stringify({ status: 'success', result: { sites: [...state.sites].map((s) => ({ name: `projects/${PROJECT}/sites/${s}` })) } }))
    }
    if (line.startsWith('firebase hosting:sites:create')) {
      state.sites.add(/** @type {string} */ (args[1]))
      return ok()
    }
    for (const kind of ['providers', 'workload-identity-pools', 'service-accounts']) {
      if (!line.includes(kind)) continue
      const name = /** @type {string} */ (args[args.indexOf(kind === 'providers' ? 'providers' : kind) + 2])
      if (args.includes('describe')) return state.resources.has(name) ? ok() : fail
      if (args.includes('create') || args.includes('create-oidc')) {
        state.resources.add(kind === 'service-accounts' ? `${name}@${PROJECT}.iam.gserviceaccount.com` : name)
        return ok()
      }
    }
    if (line.includes('get-iam-policy')) {
      const policy = line.startsWith('gcloud projects') ? 'project' : 'service-account'
      return ok(JSON.stringify({ bindings: state.policies.get(policy) ?? [] }))
    }
    if (line.includes('add-iam-policy-binding')) {
      const policy = line.startsWith('gcloud projects') ? 'project' : 'service-account'
      const role = args.find((a) => a.startsWith('--role='))?.slice(7) ?? ''
      const member = args.find((a) => a.startsWith('--member='))?.slice(9) ?? ''
      const bindings = state.policies.get(policy) ?? []
      bindings.push({ role, members: [member] })
      state.policies.set(policy, bindings)
      return ok()
    }
    throw new Error(`unexpected command: ${line}`)
  }
  /** @type {import('./hosting-setup.mjs').FetchJson} */
  async function getJson(url, token) {
    calls.push(`GET ${url} ${token}`)
    return { billingEnabled: billing }
  }
  return { run, getJson, calls, state }
}

const isChange = (/** @type {string} */ line) => /\b(create|create-oidc|enable|add-iam-policy-binding|hosting:sites:create)\b/.test(line)

describe('hosting setup', () => {
  it('stops before any change when billing is off', async () => {
    const cloud = fakeCloud({ billing: false })
    await expect(setup(cloud.run, PROJECT, SITES, () => {}, cloud.getJson)).rejects.toThrow('Blaze plan')
    expect(cloud.calls.filter(isChange)).toEqual([])
  })

  it('stops before any change when the caller is not an owner', async () => {
    const cloud = fakeCloud({ owner: false })
    await expect(setup(cloud.run, PROJECT, SITES, () => {}, cloud.getJson)).rejects.toThrow('is not an owner')
    expect(cloud.calls.filter(isChange)).toEqual([])
  })

  it('creates what is missing, then nothing on a second run', async () => {
    const cloud = fakeCloud()
    /** @type {import('./hosting-setup.mjs').Step[]} */
    const first = []
    const result = await setup(cloud.run, PROJECT, SITES, (step) => first.push(step), cloud.getJson)
    expect(first.find((s) => s.resource === 'hosting site levix-digital')?.state).toBe('exists')
    expect(first.find((s) => s.resource === 'hosting site levix-anycontext')?.state).toBe('created')
    expect(first.filter((s) => s.state === 'created')).toHaveLength(first.length - 2)
    expect(result).toEqual({
      provider: 'projects/123456/locations/global/workloadIdentityPools/github/providers/github-actions',
      serviceAccount: `hosting-deployer@${PROJECT}.iam.gserviceaccount.com`,
    })

    const callsBefore = cloud.calls.length
    /** @type {import('./hosting-setup.mjs').Step[]} */
    const second = []
    await setup(cloud.run, PROJECT, SITES, (step) => second.push(step), cloud.getJson)
    expect(second.every((s) => s.state === 'exists')).toBe(true)
    expect(cloud.calls.slice(callsBefore).filter(isChange)).toEqual([])
    expect(second).toHaveLength(REQUIRED_APIS.length + SITES.length + 3 + DEPLOY_ROLES.length + 1)
  })

  it('trusts only this repository, by id, and never creates a key', async () => {
    const cloud = fakeCloud()
    await setup(cloud.run, PROJECT, SITES, () => {}, cloud.getJson)
    const provider = cloud.calls.find((c) => c.includes('create-oidc')) ?? ''
    expect(provider).toContain(`--attribute-condition=assertion.repository_id=='${GITHUB_REPOSITORY_ID}'`)
    const impersonation = cloud.calls.find((c) => c.includes('roles/iam.workloadIdentityUser') && c.includes('add-iam')) ?? ''
    expect(impersonation).toContain(`attribute.repository_id/${GITHUB_REPOSITORY_ID}`)
    expect(cloud.calls.some((c) => c.includes('keys create'))).toBe(false)
  })

  it('asks the Cloud Billing API with the caller token', async () => {
    const cloud = fakeCloud()
    await setup(cloud.run, PROJECT, SITES, () => {}, cloud.getJson)
    expect(cloud.calls).toContain(`GET https://cloudbilling.googleapis.com/v1/projects/${PROJECT}/billingInfo token`)
  })

  it('grants the deploy account only the deploy roles', async () => {
    const cloud = fakeCloud()
    await setup(cloud.run, PROJECT, SITES, () => {}, cloud.getJson)
    const granted = cloud.calls
      .filter((c) => c.startsWith('gcloud projects add-iam-policy-binding'))
      .map((c) => c.match(/--role=(\S+)/)?.[1])
    expect(granted).toEqual(DEPLOY_ROLES)
  })
})
