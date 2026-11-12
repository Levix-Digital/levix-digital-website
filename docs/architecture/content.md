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

`packages/content/src/products/<product>.ts`, one per product (DocMapper, AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite), typed by `Product` in `src/types.ts`: name, line, one-sentence statement, availability status and, when the product has one, its site address. `src/portfolio.ts` holds the two product lines (`productLines`), the products in display order (`portfolio`) and `validatePortfolio`. Public entry point `packages/content/src/index.ts`, which also exports the company facts (`company`: name, email, location) and the site links of the shared layout (`companySite`, and `products`, derived from the portfolio entries that have a site); tests check each address against `domains.json`. The release reader of FEAT-016 is not built yet.

## Behavior

The portfolio is validated when the module loads; an invalid entry (empty name or statement, unknown line or status, duplicate id, non-https site) fails the build with the product named. The availability status is `available`, `preview` or `in-development`; anything but `available` will show the banner and disable the download buttons. Product text in the data files is English and goes through i18n like any other string.

## Interfaces

Read by the sites. No network calls today; FEAT-016 will read GitHub Releases at build time.

## Decisions

- [ADR-0005](../adr/0005-product-facts-as-typed-data-files.md): product facts as typed data files.
- [ADR-0014](../adr/0014-portfolio-with-three-availability-statuses.md): portfolio with three availability statuses.
