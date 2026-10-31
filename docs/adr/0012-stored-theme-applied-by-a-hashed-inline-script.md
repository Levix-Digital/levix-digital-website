---
id: 12
title: Stored theme applied by a hashed inline script
status: accepted
date: '2026-10-31'
version: v0.1.0
subsystems: [ui, hosting]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0012: Stored theme applied by a hashed inline script

## Context

The theme picker (FEAT-007) lets a visitor force light or dark on a site; the choice is kept in the site's local storage. The stylesheet decides the theme from `data-theme` on the root element (ADR-0011), so the stored choice must be on the root before the body is painted, or the visitor sees the other theme flash on every load. Only a script can read local storage, and it must run synchronously in the head. The pages are static, prerendered files on Firebase Hosting, so a per-request nonce is not available, and the Content Security Policy allows no inline code (ADR-0010).

## Decision

One classic script, `packages/ui/src/theme/theme-init.js` (exported as `@levix/ui/theme-init.js`), reads `localStorage["levix-theme"]` and, for `light` or `dark`, sets `data-theme` on the root; any error is swallowed. The shared Vite configuration (`tooling/vite-site.ts`) puts its text inline at the top of every page's `<head>`. `scripts/lib/security-headers.mjs` reads the same file and adds its SHA-256 hash to `script-src` (`script-src 'self' 'sha256-…'`); `firebase.json` holds the five copies of the policy, kept equal by the existing test. `verify:dist` fails on any inline script whose hash is not allowed and on a page without the theme script. The script stays one line with no `<`, `>` or `&`, so HTML keeps it byte for byte.

## Alternatives Considered

- **An external script from `/assets/`**: no policy change, but one more render-blocking request before the first paint of every first visit.
- **`'unsafe-inline'` in `script-src`**: allows any injected inline script; refused by ADR-0010.
- **A nonce**: needs a server that changes each response; the sites are static files.
- **Applying the choice after the page loads**: the system theme flashes before the stored one on every load.
- **A cookie shared by the five sites**: works only on the `levix.digital` names, not on `web.app` addresses and previews, and is sent with every request for no use; the choice is per site.

## Consequences

A stored theme is right on the first paint with no extra request, and the policy still runs no other inline code. Any change to `theme-init.js`, even whitespace, changes its hash: the security headers test then fails until the five copies in `firebase.json` carry the new hash, and a page served with an old policy shows a console error, which the Lighthouse audit fails on. A second inline script needs its own hash in the same way.
