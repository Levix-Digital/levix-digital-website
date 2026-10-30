---
id: 4
title: Build-time and on-demand translation without per-language URLs
status: accepted
date: '2026-10-30'
version: null
subsystems: []
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0004: Build-time and on-demand translation without per-language URLs

## Context

The site is written in English. Levi wants the site readable in any language, not a fixed list: French and Spanish translated in advance, any other language translated on demand in the visitor's browser and kept in local storage, as DocMapper does, but through Google's official APIs, and without a URL per language. DocMapper calls an unofficial endpoint from the browser, which is not allowed for a public site and could stop working.

## Decision

English strings live in one source dictionary per site plus shared ones. At build time, a script sends only new or changed strings to the Google Cloud Translation API (v3) and writes the French and Spanish bundles into the repository. In the browser, the language picker lists every language the API supports: a prebuilt language switches instantly; another language is requested from the `translate` Cloud Function, which answers from a shared Firestore cache keyed by language and a hash of the English text, translates only what is missing, and returns the dictionary, which the browser keeps in local storage. The URL never changes with the language; the chosen language is remembered in local storage.

## Alternatives Considered

- **One URL per language (`/fr/`, `/es/`)**: best for search, rejected by Levi.
- **Browser calls to the Translation API with a key in the page**: the key could be abused.
- **Only prebuilt languages**: rejected; the site must not be restricted to a list.

## Consequences

Only English is indexed by search engines. Each string is paid for once per language for all visitors. Translation quality is machine quality; prebuilt languages can be reviewed in pull requests. The function is protected by App Check and rate limits.
