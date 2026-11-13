---
title: Product Content
summary: One typed data file per product, the single source of the facts the sites show.
code: [packages/content]
---

# Product Content

One typed data file per product, the single source of the facts the sites show.

## Responsibilities

Owns the facts about each product: name, availability, features, platforms and requirements, plans and prices, links and release source. Does not own presentation.

## Structure

`packages/content/src/products/<product>.ts`, one per product (DocMapper, AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite), typed by `Product` in `src/types.ts`: name, line, one-sentence statement, availability status, its site address and, when it can be installed, its install source (`install`: address and action label). `src/portfolio.ts` holds the two product lines (`productLines`), the products in display order (`portfolio`) and `validatePortfolio`. Public entry point `packages/content/src/index.ts`, which also exports the company facts (`company`: name, email, location) and the site links of the shared layout (`companySite`, and `products`, derived from the portfolio entries that have a site); `productById(id)` returns one product; `releaseSignupEndpoint` is the address of the signup function the product sites call; tests check each address against `domains.json`. Each product also names its public releases repository and, when it ships installers, the installer asset per operating system (`releases`: `repository` and `downloads`, typed `ReleaseSource`). `src/releases.ts` holds `readRelease(product, { fetch, token, apiBase })`, which reads the release a product site shows (available: the latest release; preview: the newest published one, pre-releases included; in development: nothing) and gives `release: null` with the cause on any failure, and `releaseMarker`, the content of `/release.json`.

## Behavior

The portfolio is validated when the module loads; an invalid entry (empty name or statement, unknown line or status, duplicate id, non-https site, an available or preview product without an install source, a product in development with one, a releases repository that is not `owner/name`, an unknown operating system or empty asset name) fails the build with the product named. The availability status is `available`, `preview` or `in-development`; a product in development shows its download button disabled and the release candidate signup on its site. Every product has a site. Product text in the data files is English and goes through i18n like any other string.

## Interfaces

Read by the sites. `readRelease` calls the GitHub REST API; it runs only while a site is built (`tooling/release-info.ts`) and in the release refresh (`scripts/release-refresh.mjs`), never in a page. The release candidate announcements (`functions/src/products.ts`) use the same repositories, which a test checks.

## Decisions

- [ADR-0005](../adr/0005-product-facts-as-typed-data-files.md): product facts as typed data files.
- [ADR-0014](../adr/0014-portfolio-with-three-availability-statuses.md): portfolio with three availability statuses.
- [ADR-0015](../adr/0015-release-candidate-signup-with-double-opt-in-before-app-check.md): release candidate signup.
- [ADR-0016](../adr/0016-release-information-read-at-build-time.md): release information read at build time.
