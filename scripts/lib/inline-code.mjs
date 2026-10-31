// Finds code in built HTML that the Content Security Policy would block: it allows scripts and
// styles only from files of the site's own origin (ADR-0010).

const SCRIPT = /<script\b([^>]*)>/gi
const STYLE_ELEMENT = /<style\b/i
const STYLE_ATTRIBUTE = /<[a-z][^>]*\sstyle\s*=/i
const EVENT_HANDLER = /<[a-z][^>]*\son[a-z]+\s*=/i
const JAVASCRIPT_URL = /\s(?:href|src|action)\s*=\s*["']?\s*javascript:/i

/**
 * @param {string} html a built page
 * @returns {string[]} the kinds of inline code found: script, style element, style attribute, event handler, javascript URL
 */
export function findInlineCode(html) {
  /** @type {string[]} */
  const found = []
  if ([...html.matchAll(SCRIPT)].some((match) => !/\ssrc\s*=/i.test(match[1] ?? ''))) found.push('script')
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
