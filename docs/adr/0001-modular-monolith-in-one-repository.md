---
id: 1
title: Modular monolith in one repository
status: proposed
date: '2026-10-30'
version: null
subsystems: []
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0001: Modular monolith in one repository

## Context

The company home and four product sites share one design language, one header and footer, one translation mechanism and one contact backend, and are built by a small team. Each product site must be deployable to its own subdomain.

## Decision

One repository with npm workspaces, organized as a modular monolith: `sites/<site>` (home, anycontext, devcycle, gedo, aurora), `packages/ui`, `packages/content`, `packages/i18n` and `functions/`. Sites depend on packages through their public entry points (`index.ts`); packages never depend on sites; a site never imports another site. The architecture style is recorded as `modular-monolith` in `.dev-cycle.json`.

## Alternatives Considered

- **One repository per site**: duplicated design system and translation code, versions drifting between sites.
- **One single application serving every subdomain**: a change to one product page redeploys all of them, and per-subdomain routing adds complexity to a static site.
- **Microfrontends**: operational cost with no benefit at this size.

## Consequences

Shared changes reach every site in one pull request. Each site builds and deploys on its own. Module boundaries are checked in review and by lint rules on imports. Splitting a site into its own repository later stays possible because it only uses package entry points.
