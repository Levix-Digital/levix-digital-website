---
id: 14
title: Portfolio with three availability statuses
status: accepted
date: '2026-11-12'
version: v0.1.0
subsystems: [content, sites]
supersedes: []
superseded_by: []
amends: [5]
amended_by: []
---

# ADR-0014: Portfolio with three availability statuses

## Context

The company home (FEAT-017) presents every product with an honest availability. ADR-0005 foresaw two statuses (available, coming soon), but Aurora Dev Suite publishes pre-release builds, which is neither. DocMapper joins the portfolio without a site of its own, while the header and footer must link only sites that exist.

## Decision

Each product is one typed data file in `packages/content/src/products/` with its line (documents and knowledge, or software development with agents), a one-sentence statement, a status among `available` (a public release can be installed today), `preview` (pre-release builds are published) and `in-development` (no installable release), and an optional site address. `portfolio` lists them in display order and is validated when the module loads, so an invalid entry fails the build with the product named. `products`, the site links of the shared layout, is derived from the portfolio entries that have a site. For the availability banner, any status other than `available` counts as not available.

## Alternatives Considered

- **Keep two statuses**: Aurora would be either overstated as available or hidden as coming soon although it can be downloaded.
- **A separate list of site links**: two sources for one fact, which drift.

## Consequences

A status changes in one file and the home, header and footer follow. Adding a product without a site needs no layout change; giving it a site later means adding its domain and its id to the site ids.
