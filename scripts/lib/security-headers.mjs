// The security headers every response of every site carries (ADR-0010). firebase.json holds one
// copy per hosting target on its `**` rule; the tests keep those copies equal to this list.

/** Allowed sources per resource type. Later features add what they load, with their tests. */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
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

/** @type {ReadonlyArray<{ key: string, value: string }>} */
export const SECURITY_HEADERS = Object.freeze([
  // HTTPS only for a year, subdomains included; no preload (hard to undo).
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
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
 * Compares served or configured headers with the policy.
 * @param {(name: string) => string | null | undefined} get the value of a header, by name
 * @returns {string[]} one line per header that is missing or different
 */
export function headerDifferences(get) {
  /** @type {string[]} */
  const differences = []
  for (const { key, value } of SECURITY_HEADERS) {
    const actual = get(key)
    if (actual === null || actual === undefined) differences.push(`${key} is missing`)
    else if (actual !== value) differences.push(`${key} is "${actual}"`)
  }
  return differences
}
