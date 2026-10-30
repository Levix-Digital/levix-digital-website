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

`packages/content/src/products/<product>.ts`, one per product, typed by `Product` in `src/types.ts`; `src/releases.ts` reads the latest GitHub release at build time. Public entry point `packages/content/src/index.ts`.

## Behavior

Data files are validated at build time; an invalid file fails the build. The availability status (`available`, `coming-soon`) drives the banner and the download buttons. Product text in the data files is English and goes through i18n like any other string.

## Interfaces

Read by the sites. Calls the GitHub Releases API at build time only.

## Decisions

- [ADR-0005](../adr/0005-product-facts-as-typed-data-files.md): product facts as typed data files.
