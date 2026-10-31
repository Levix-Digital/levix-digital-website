# Research: Theme Picker

## R1. Applying the stored choice before the first paint

- **Decision**: a one-line classic script, `packages/ui/src/theme/theme-init.js`, is placed inline at the top of every page's `<head>` by the shared Vite configuration (`tooling/vite-site.ts`). It reads `localStorage["levix-theme"]` and, for `light` or `dark`, sets `data-theme` on the root element; any error is swallowed. The Content Security Policy allows it by its SHA-256 hash (`script-src 'self' 'sha256-…'`), computed from the same file in `scripts/lib/security-headers.mjs`.
- **Rationale**: the theme must be on the root before the body is painted, so the script has to run synchronously in the head. Inline, it costs no request and no render-blocking round trip. ADR-0010 already foresees "the hash of an inline script" as the way a feature extends the policy; a hash allows exactly these bytes and nothing else. Checked on 2026-10-31: Vite's `transformIndexHtml` tag and the vite-ssg prerender keep the script text byte for byte.
- **Alternatives**: an external blocking script from `/assets/` (no policy change, but one more render-blocking request on every first visit); `'unsafe-inline'` (refused by ADR-0010); a nonce (needs a server per request, the sites are static files); applying the choice after hydration (a flash of the system theme on every load).

## R2. Where the choice is kept

- **Decision**: `localStorage`, key `levix-theme`, value `light` or `dark`; no key means "System".
- **Rationale**: the backlog item asks for local storage; it is synchronous, so the head script can read it before paint; it never leaves the browser. Each site is its own origin, so the choice is per site.
- **Alternatives**: a cookie on `levix.digital` shared by the five sites (does not work on `web.app` addresses and previews, and is sent with every request for no use); `sessionStorage` (lost when the tab closes).

## R3. The picker control

- **Decision**: a `ThemePicker` component in `@levix/ui`: a `fieldset` with a visually hidden `legend` and three native radio inputs styled as a segmented control (System, Light, Dark), built from the FEAT-006 tokens. Labels come from the site as a prop.
- **Rationale**: native radios give the keyboard behavior (Tab into the group, arrows between options), the checked state and the group name to assistive technology with no ARIA code. `@levix/ui` does not own text (`docs/architecture/ui.md`), so the site passes its strings.
- **Alternatives**: a single toggle button cycling the themes (hides the "System" state, harder to announce); a menu button with a popup (more code and focus handling for three options).

## R4. State in the page

- **Decision**: `useThemePreference()` returns the current preference and a setter. It starts as `system` (the prerendered page knows nothing of the visitor), reads storage when mounted, and listens to the `storage` event to follow other tabs. The setter writes storage (or removes the key for System) and sets or removes `data-theme` on the root. Reading and writing go through small pure functions with the storage passed in, so errors and unknown values are tested without a browser.
- **Rationale**: reading storage only after mount keeps the hydrated markup equal to the prerendered one (no hydration mismatch); the head script already applied the theme, so the late read changes only the picker's checked option.
