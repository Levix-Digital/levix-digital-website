# Research: Security Headers for Every Site

## R1. Where the headers are set

- **Decision**: in `firebase.json`, on the `**` rule of each hosting target, next to `Cache-Control`.
- **Rationale**: Firebase Hosting applies the `headers` of `firebase.json` to every response of the site, including 404 pages, and the hosting emulator applies them the same way (checked on 2026-10-30: a header added to the `**` rule was returned by the emulator). The product subdomains are not proxied, so the hosting configuration is the only place that reaches all five sites.
- **Alternatives**: Cloudflare transform rules (reach only the apex, which is the only proxied name, and live outside the repository); `<meta http-equiv>` in the pages (cannot set `frame-ancestors`, HSTS or most other headers).

## R2. One policy, five copies

- **Decision**: the header list lives in `scripts/lib/security-headers.mjs` (names, values and the reason for each directive). `firebase.json` holds the five literal copies Firebase needs; a unit test compares each target's `**` rule with the module and fails naming the site and header. The checks (`verify:hosting`, `verify:live`) import the same module.
- **Rationale**: `firebase.json` has no includes; generating it would add a build step to a file the Firebase CLI reads directly. A test keeps the copies equal at no runtime cost.
- **Alternatives**: generate `firebase.json` from a template (one more command to remember before every deploy); accept the duplication without a test (drift).

## R3. Content Security Policy

- **Decision**: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`.
- **Rationale**: the built pages load one module script and one stylesheet from `/assets/` and nothing inline (checked on the 2026-10-30 build of the five sites), so the strictest source list works today. `data:` images cover small inline images in CSS. Later features add exactly what they need: Google Analytics origins (FEAT-034), the functions (FEAT-031, FEAT-033) and App Check, and a script hash for a theme script that runs before paint (FEAT-007).
- **Alternatives**: allow everything the technical specification will eventually need now (Google Analytics, functions): allows origins nothing uses yet; `'unsafe-inline'` for styles: weakens the policy with no need today; nonce-based policy: needs a server per request, which static hosting does not have.

## R4. Strict-Transport-Security

- **Decision**: `max-age=31536000; includeSubDomains` (one year), no `preload`.
- **Rationale**: every name under `levix.digital` that serves the web is HTTPS-only (Firebase certificates; the apex through Cloudflare). One year is the common baseline and what header scanners rate as good. Preload puts the domain into browsers' built-in lists, and leaving those lists takes months; it can be decided later once every subdomain is settled.
- **Alternatives**: two years with preload (hard to undo); without `includeSubDomains` (the subdomains are separate sites and should be protected too).

## R5. Other headers

- `X-Content-Type-Options: nosniff`: no type guessing.
- `X-Frame-Options: DENY`: older browsers that ignore `frame-ancestors`.
- `Referrer-Policy: strict-origin-when-cross-origin`: other sites see only `https://levix.digital`, never the path.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`: the sites never use them; denying them also denies them to anything embedded later.
- `Cross-Origin-Opener-Policy: same-origin`: a page opened from the site cannot reach back into it.
- Not set: `Cross-Origin-Embedder-Policy` (would break Google Analytics and other cross-origin resources later, no benefit for a static site), `X-XSS-Protection` (obsolete).

## R6. Catching what the policy would block

- **Decision**: `verify:dist` fails on inline `<script>` without `src`, `<style>` elements, `style=` attributes and `on*=` attributes in the built HTML; Lighthouse asserts `errors-in-console` (a blocked resource is a console error) for the pages it already audits in the emulator.
- **Rationale**: the first check is fast and names the page; the second runs the real browser against the real headers.

## R7. Live check

- **Decision**: `verify:live` compares the security headers of each address with the policy (exact value) after the deploy.
- **Rationale**: the apex goes through Cloudflare; a proxy setting that adds, drops or rewrites a header is caught on the next deploy.

## R8. Open point checked on the first preview

Firebase Hosting may send its own `Strict-Transport-Security` on some addresses. The preview channel of the pull request is served by the real Firebase Hosting, so its headers are read before the merge (from a machine that can reach it); if Firebase replaces the configured value, the policy and the checks take the served value and the plan says so.

**Result (2026-10-31)**: the previews served the six other headers exactly as configured, on pages and on the 404 answer, with no header twice. `Strict-Transport-Security` was Firebase's own, not the configured one: `max-age=31556926; includeSubDomains; preload` on `*.web.app` (the value of the `web.app` zone), and `max-age=31556926` on the custom domains before this change. The configured value stays in `firebase.json` (it applies wherever Firebase honors it), and the checks of served headers accept any HSTS that keeps HTTPS for a year or more (`max-age` ≥ 31536000). `includeSubDomains` on `levix.digital` cannot be guaranteed from the repository; if wanted, it is set in Cloudflare's HSTS setting for the apex.
