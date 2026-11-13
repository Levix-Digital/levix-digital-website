// Checks that every built site has a prerendered home page with a non-empty heading, and that no
// built page or stylesheet has inline code or fonts the Content Security Policy would block, and
// that every page carries the theme script, the one inline script the policy allows (ADR-0012).
// Every product site also publishes /release.json, which the release refresh compares (FEAT-016).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { countInlineFonts, findInlineCode, inlineScriptHashes } from './lib/inline-code.mjs'
import { ALLOWED_SCRIPT_HASHES } from './lib/security-headers.mjs'

const SITES_DIR = 'sites'
const HEADING = /<h1[^>]*>\s*([^<\s][^<]*)<\/h1>/

const failures = []
for (const site of readdirSync(SITES_DIR)) {
  const page = join(SITES_DIR, site, 'dist', 'index.html')
  if (!existsSync(page)) {
    failures.push(`${site}: ${page} not found (run npm run build first)`)
    continue
  }
  const heading = readFileSync(page, 'utf8').match(HEADING)
  if (!heading) {
    failures.push(`${site}: ${page} has no prerendered <h1>`)
    continue
  }
  console.log(`ok ${site}: "${(heading[1] ?? '').trim()}"`)

  const marker = join(SITES_DIR, site, 'dist', 'release.json')
  if (site !== 'home') {
    if (!existsSync(marker)) {
      failures.push(`${site}: release.json not found`)
    } else {
      const data = JSON.parse(readFileSync(marker, 'utf8'))
      if (data.product !== site || !(data.version === null || typeof data.version === 'string')) {
        failures.push(`${site}: release.json is malformed`)
      } else {
        console.log(`ok ${site}: release.json (${data.version ?? 'no version'})`)
      }
    }
  } else if (existsSync(marker)) {
    failures.push(`${site}: the company home must not publish release.json`)
  }

  for (const file of readdirSync(join(SITES_DIR, site, 'dist'), { recursive: true, encoding: 'utf8' })) {
    if (file.endsWith('.css')) {
      const fonts = countInlineFonts(readFileSync(join(SITES_DIR, site, 'dist', file), 'utf8'))
      if (fonts > 0) failures.push(`${site}: ${file} has ${fonts} font(s) inlined as data URLs`)
      continue
    }
    if (!file.endsWith('.html')) continue
    const html = readFileSync(join(SITES_DIR, site, 'dist', file), 'utf8')
    const inline = findInlineCode(html, ALLOWED_SCRIPT_HASHES)
    if (inline.length > 0) failures.push(`${site}: ${file} has inline ${inline.join(', ')} the policy does not allow`)
    const themeScripts = inlineScriptHashes(html).filter((hash) => hash === ALLOWED_SCRIPT_HASHES[0]).length
    if (themeScripts !== 1) failures.push(`${site}: ${file} has the theme script ${themeScripts} times, not once`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
