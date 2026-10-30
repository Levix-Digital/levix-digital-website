---
id: 5
title: Product facts as typed data files
status: proposed
date: '2026-10-30'
version: null
subsystems: []
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0005: Product facts as typed data files

## Context

Every fact on the site must be true and come from the product's repository or release channel. Product facts (status, features, requirements, plans, prices, releases) change with each product release.

## Decision

Each product has one typed data file in `packages/content` (TypeScript, validated at build time) holding its name, availability status, features, platforms and requirements, plans and prices, links and release source. Pages render only from these files. The availability status drives the full-width "available soon" banner and disables the download buttons. The latest release of a released product is read from its GitHub Releases at build time.

## Alternatives Considered

- **A headless CMS**: another service to run and secure, and facts no longer reviewed in pull requests.
- **Facts written directly in page components**: the same fact repeated on several pages drifts.

## Consequences

A product update on the site is one reviewed change to one file. Pages cannot show a product as available unless its data says so. A build fails when a data file is invalid.
