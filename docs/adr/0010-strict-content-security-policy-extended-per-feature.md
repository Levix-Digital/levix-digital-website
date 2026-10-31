---
id: 10
title: Strict Content Security Policy extended per feature
status: accepted
date: '2026-10-31'
version: v0.1.0
subsystems: [hosting]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0010: Strict Content Security Policy extended per feature

## Context

The technical specification asks for HTTPS everywhere with HSTS and a Content Security Policy that allows only the site's own origin, Google Analytics and the functions. Today the five sites are static pages that load one module script and one stylesheet from `/assets/` and nothing inline; Google Analytics, the functions, App Check and a theme script that runs before the first paint come with later backlog items. The sites are static files on Firebase Hosting, so a per-request nonce is not available, and the product subdomains are not proxied, so only the hosting configuration reaches all five sites.

## Decision

Every response of every site carries seven headers, defined once in `scripts/lib/security-headers.mjs` and copied to the `**` rule of each target in `firebase.json` (a test keeps the copies equal): `Strict-Transport-Security: max-age=31536000; includeSubDomains` without preload, a Content Security Policy that allows only the site's own origin (images also `data:`), no plugins, no `<base>` change, no framing and no inline code or `eval`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` denying features the sites never use, and `Cross-Origin-Opener-Policy: same-origin`.

The policy allows only what the sites load today. A feature that loads something new adds exactly that to the policy in its own change, with its tests: an origin for Google Analytics or the functions, or the hash of an inline script. `'unsafe-inline'` and `'unsafe-eval'` are not used.

The build check refuses inline code in the built pages, the emulator check and the deploy's address check compare the served headers with the policy, and the Lighthouse audit fails on console errors, which is how a blocked resource shows up.

## Alternatives Considered

- **Allow now every origin the specification lists**: origins nothing uses yet stay allowed, and nothing proves they are needed.
- **`'unsafe-inline'` for styles or scripts**: weakens the protection against injected code with no need today.
- **Headers in Cloudflare transform rules**: reach only the apex (the only proxied name) and live outside the repository.
- **HSTS with preload**: leaving the browsers' preload lists takes months; it can be decided once every subdomain is settled.
- **Generate `firebase.json` from a template**: one more step before every deploy for a file the Firebase CLI reads directly.

## Consequences

An injected script or style is not run, and the sites cannot be framed. Every name under `levix.digital` must stay on HTTPS for a year after a browser has seen it; a future name without a certificate would be unreachable for those browsers. Features that load third-party resources or inline code must change the policy, or the checks fail. A Cloudflare feature that injects scripts into the apex (Rocket Loader, Web Analytics) is blocked; email address obfuscation serves its script from the same origin and keeps working.
