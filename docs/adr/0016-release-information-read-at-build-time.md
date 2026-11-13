---
id: 16
title: Release information read at build time, refreshed by an hourly check
status: accepted
date: '2026-11-13'
version: v0.1.0
subsystems: [content, sites, ci]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0016: Release information read at build time, refreshed by an hourly check

## Context

The download action of a product site pointed to the `releases/latest` page of the product's releases repository: never stale, but it shows no version and leaves the visitor to pick the right file among many assets (FEAT-016). The owner wants the button to follow each new release on its own, with no change in this repository. Every product publishes its releases in a public repository `Levix-Digital/<product>-releases` (ADR-0015), readable without credentials.

## Decision

- Each product's data names its releases repository and, when it ships installers, the asset name of the installer per operating system (`releases` in `@levix/content`).
- While a product site is built, the shared Vite configuration reads the release once: for an available product the latest release (never a pre-release), for a preview the newest published one, nothing for a product in development. The page gets it as a build constant and the availability panel shows "Latest release: vX.Y.Z" and one direct download link per operating system, keeping the link to every download. Pages never call GitHub.
- Each product site publishes `/release.json` (product, status, repository, version shown, build time).
- An hourly workflow (`Release refresh`) reads each product site's `/release.json`, compares the version with the latest release and starts the `Deploy` workflow for the sites that differ.
- Any failure to read a release (network, limit, missing release or asset) is a warning: the build succeeds with the install link alone and `version: null`, which the next hourly run repairs.

## Alternatives Considered

- **Read the release in the browser on each visit**: always current, but the content security policy would have to allow `api.github.com`, visitors on shared networks hit the anonymous limit of 60 requests per hour, and the version appears only after a request.
- **Keep only `releases/latest`**: no version, no per-system link.
- **Products notify this repository when they release**: immediate, but every product would hold a token with write access here.
- **Store the last seen tag**: a second state that drifts from what is deployed when a deploy fails; the published `release.json` is what visitors see.

## Consequences

A site shows a new release within about an hour. The build depends on the GitHub API only for these facts and never fails on it. Products keep installer names stable across releases and mark final releases as latest. The company home is unaffected.
