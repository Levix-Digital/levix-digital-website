// Finds code in built HTML that the Content Security Policy would block: it allows scripts and
// styles only from files of the site's own origin (ADR-0010), plus inline scripts by their hash
// (ADR-0012).
import { createHash } from 'node:crypto'

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
const STYLE_ELEMENT = /<style\b/i
const STYLE_ATTRIBUTE = /<[a-z][^>]*\sstyle\s*=/i
const EVENT_HANDLER = /<[a-z][^>]*\son[a-z]+\s*=/i
const JAVASCRIPT_URL = /\s(?:href|src|action)\s*=\s*["']?\s*javascript:/i

/**
 * @param {string} script the exact text between `<script>` and `</script>`
 * @returns {string} its Content Security Policy source, `'sha256-<base64>'`
 */
export function scriptHash(script) {
  return `'sha256-${createHash('sha256').update(script, 'utf8').digest('base64')}'`
}

/**
 * @param {string} html a built page
 * @returns {string[]} the policy hashes of the page's inline scripts, in order
 */
export function inlineScriptHashes(html) {
  return [...html.matchAll(SCRIPT)]
    .filter((match) => !/\ssrc\s*=/i.test(match[1] ?? ''))
    .map((match) => scriptHash(match[2] ?? ''))
}

/**
 * @param {string} html a built page
 * @param {readonly string[]} [allowedScriptHashes] policy hashes of the inline scripts allowed
 * @returns {string[]} the kinds of inline code found: script, style element, style attribute, event handler, javascript URL
 */
export function findInlineCode(html, allowedScriptHashes = []) {
  /** @type {string[]} */
  const found = []
  if (inlineScriptHashes(html).some((hash) => !allowedScriptHashes.includes(hash))) found.push('script')
  if (STYLE_ELEMENT.test(html)) found.push('style element')
  if (STYLE_ATTRIBUTE.test(html)) found.push('style attribute')
  if (EVENT_HANDLER.test(html)) found.push('event handler')
  if (JAVASCRIPT_URL.test(html)) found.push('javascript URL')
  return found
}

// The policy allows fonts only from the site's origin (`font-src 'self'`), so a font the build
// inlined into a stylesheet as a data URL is blocked.
const INLINE_FONT = /url\(\s*["']?data:(?:font\/|application\/(?:x-)?font)/gi

/**
 * @param {string} css a built stylesheet
 * @returns {number} how many fonts are inlined as data URLs
 */
export function countInlineFonts(css) {
  return [...css.matchAll(INLINE_FONT)].length
}
