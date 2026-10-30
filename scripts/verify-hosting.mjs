// Checks the hosting rules of every site with Firebase's own server, offline. Runs inside the
// hosting emulator: npm run verify:hosting (after npm run build).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { emulatorBases } from './lib/emulator.mjs'
import { readHostingConfig } from './lib/hosting-config.mjs'

const PAGE_CACHE = 'no-cache'
const ASSET_CACHE = 'public, max-age=31536000, immutable'

const { targets } = readHostingConfig()
const bases = await emulatorBases(targets.map((target) => target.name))

/** @type {string[]} */
const failures = []
/**
 * @param {string} site
 * @param {string} check
 * @param {boolean} passed
 * @param {string} detail
 */
function expectThat(site, check, passed, detail) {
  if (passed) console.log(`ok ${site}: ${check}`)
  else failures.push(`${site}: ${check} (${detail})`)
}

for (const target of targets) {
  const base = bases.get(target.name)
  const get = (/** @type {string} */ path) => fetch(base + path, { redirect: 'manual' })

  const home = await get('/')
  const served = home.status === 200 && (await home.text()) === readFileSync(join(target.folder, 'index.html'), 'utf8')
  expectThat(target.name, 'its own home page is served', served, `status ${home.status}`)
  expectThat(target.name, 'pages are revalidated', home.headers.get('cache-control') === PAGE_CACHE, `${home.headers.get('cache-control')}`)

  const asset = readdirSync(join(target.folder, 'assets'))[0]
  const assetResponse = await get(`/assets/${asset}`)
  expectThat(target.name, 'assets are immutable', assetResponse.headers.get('cache-control') === ASSET_CACHE,
    `${assetResponse.headers.get('cache-control')}`)

  const html = await get('/index.html')
  expectThat(target.name, 'clean URLs redirect', html.status === 301 && html.headers.get('location') === '/', `status ${html.status}`)

  const missing = await get('/no-such-page')
  expectThat(target.name, 'unknown paths are not found', missing.status === 404, `status ${missing.status}`)
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
