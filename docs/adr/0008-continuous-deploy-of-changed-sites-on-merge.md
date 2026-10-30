---
id: 8
title: Continuous deploy of changed sites on merge
status: accepted
date: '2026-10-30'
version: v0.1.0
subsystems: [ci, hosting]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0008: Continuous deploy of changed sites on merge

## Context

The sites are static files on Firebase Hosting; every release of a site can be rolled back in one step without touching the others, and every pull request already has a preview of all sites (ADR-0007). The development cycle's default for a `trunk` repository is to tag a release candidate, have it accepted by hand and promote it. The backlog item FEAT-003 asks for each changed site to be deployed when a pull request is merged into `main`.

## Decision

Every push to `main` runs the same checks as a pull request on that commit and then publishes to production the sites changed since the commit of the last successful deployment of the `production` environment, from the build that passed the checks. A file under `sites/<site>/` changes that site; documentation, specifications and tool settings change none; any other file changes every site. Deploys run in the `production` environment, one at a time. There are no release candidates, version bumps or manual approval for the website: the merge is the approval. The roadmap's releases name groups of items, not deploys.

## Alternatives Considered

- **Release candidates with a promote workflow**: a tag, a manual test run and an approval per release, for small changes that are previewed before the merge and reversible per site after it.
- **Every site on every merge**: simpler, but publishes unchanged sites and fills their release history with identical releases.
- **A required reviewer on the `production` environment**: one more click per merge; it can be added later in the repository settings without changing the workflows.
- **Changes counted from the push's previous commit**: a deploy that failed, or a waiting deploy replaced by a newer one, would leave its changes unpublished.

## Consequences

A change is live minutes after its merge, so `main` must stay releasable: the checks are required on `main`. A failed deploy is published by the next successful one, or at once by re-running it. A manual deploy of only some sites becomes the last successful deploy, so after a failure it should name every site the failed run had. The development cycle's release candidate and promote steps do not apply to this repository, and its CI policy warnings about release workflows are expected.
