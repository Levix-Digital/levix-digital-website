// The security headers every response of every site carries (ADR-0010). firebase.json holds one
// copy per hosting target on its `**` rule; the tests keep those copies equal to this list.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { scriptHash } from './inline-code.mjs'

/** The only inline script of the sites: it applies a stored theme before paint (ADR-0012). */
export const THEME_INIT_SCRIPT = readFileSync(
  createRequire(import.meta.url).resolve('@levix/ui/theme-init.js'),
  'utf8',
).trim()

/** The hashes of the inline scripts the policy allows; the build check refuses any other. */
export const ALLOWED_SCRIPT_HASHES = Object.freeze([scriptHash(THEME_INIT_SCRIPT)])

/** Allowed sources per resource type. Later features add what they load, with their tests. */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Files of the site, and the inline theme script by its hash (the same text the build inlines).
  `script-src 'self' ${ALLOWED_SCRIPT_HASHES.join(' ')}`,
  "style-src 'self'",
  // data: covers small images inlined in the stylesheets.
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

/** One year, the shortest HSTS lifetime the checks accept. */
const ONE_YEAR = 31536000

/**
 * Firebase Hosting sends its own Strict-Transport-Security in place of the configured one
 * (`max-age=31556926` on custom domains, with `includeSubDomains; preload` on web.app), so a
 * served value is accepted when it keeps HTTPS for a year or more.
 * @param {string} value
 */
function keepsHttpsForAYear(value) {
  const maxAge = /(?:^|;)\s*max-age=(\d+)/i.exec(value)?.[1]
  return maxAge !== undefined && Number(maxAge) >= ONE_YEAR
}

/** @type {ReadonlyArray<{ key: string, value: string, accepts?: (served: string) => boolean }>} */
export const SECURITY_HEADERS = Object.freeze([
  // HTTPS only for a year, subdomains included; no preload (hard to undo). Firebase may replace it.
  { key: 'Strict-Transport-Security', value: `max-age=${ONE_YEAR}; includeSubDomains`, accepts: keepsHttpsForAYear },
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  // No guessing of file types.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Never inside a frame, for browsers that ignore frame-ancestors.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Other sites see the origin, never the path.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Powerful features the sites never use, denied to them and to anything they embed.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  // A page opened from the site cannot reach back into it.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
])

/**
 * Compares served headers with the policy: each must equal its value, or pass its own test.
 * @param {(name: string) => string | null | undefined} get the value of a header, by name
 * @returns {string[]} one line per header that is missing or different
 */
export function headerDifferences(get) {
  /** @type {string[]} */
  const differences = []
  for (const { key, value, accepts } of SECURITY_HEADERS) {
    const actual = get(key)
    if (actual === null || actual === undefined) differences.push(`${key} is missing`)
    else if (actual !== value && !accepts?.(actual)) differences.push(`${key} is "${actual}"`)
  }
  return differences
}
