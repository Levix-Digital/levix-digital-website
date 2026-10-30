---
title: Sites
summary: The company home and the product sites, each a prerendered Vite application deployed to its own Firebase Hosting site.
code: [sites]
---

# Sites

The company home and the product sites, each a prerendered Vite application deployed to its own Firebase Hosting site.

## Responsibilities

Owns the pages of each site and their routes: the company home (`levix.digital`, including the research pages `/research` and `/research/lsie`, contact and legal pages) and one site per product (`anycontext`, `devcycle`, `gedo`, `aurora`). Does not own product facts (content), translations (i18n) or shared components (ui).

## Structure

`sites/<site>/` is a Vite application: `src/pages/` (one file per route), `src/main.ts` (vite-ssg entry), `index.html`, its English strings in `src/locales/en.json`.

```mermaid
flowchart LR
    S[sites/*] --> U[packages/ui]
    S --> C[packages/content]
    S --> I[packages/i18n]
    S -->|HTTPS| F[functions]
```

## Behavior

Each site is prerendered to static HTML at build time and hydrated in the browser. A product site's pages are overview, features, plans and pricing, and download; when the product is not available, every page shows the availability banner and the download buttons are disabled. Each site builds into `sites/<site>/dist` and is deployed to its Firebase Hosting target.

## Interfaces

Uses the public entry points of `packages/ui`, `packages/content` and `packages/i18n`, and calls the `contact` and `translate` functions over HTTPS.

## Decisions

- [ADR-0001](../adr/0001-modular-monolith-in-one-repository.md): one repository, one site per folder.
- [ADR-0002](../adr/0002-vue-3-with-vite-static-prerendering.md): Vue 3 with static prerendering.
- [ADR-0003](../adr/0003-firebase-hosting-with-one-site-per-domain.md): one Firebase Hosting site per domain.
