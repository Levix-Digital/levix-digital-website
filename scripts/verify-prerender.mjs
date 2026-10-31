// Checks that every built site has a prerendered home page with a non-empty heading, and that no
// built page has inline code the Content Security Policy would block.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findInlineCode } from './lib/inline-code.mjs'

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

  for (const file of readdirSync(join(SITES_DIR, site, 'dist'), { recursive: true, encoding: 'utf8' })) {
    if (!file.endsWith('.html')) continue
    const inline = findInlineCode(readFileSync(join(SITES_DIR, site, 'dist', file), 'utf8'))
    if (inline.length > 0) failures.push(`${site}: ${file} has inline ${inline.join(', ')}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
