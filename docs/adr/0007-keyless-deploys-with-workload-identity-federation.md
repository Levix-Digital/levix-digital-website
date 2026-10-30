---
id: 7
title: Keyless deploys with Workload Identity Federation
status: accepted
date: '2026-10-30'
version: v0.1.0
subsystems: [hosting]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0007: Keyless deploys with Workload Identity Federation

## Context

The repository's workflows publish the sites to Firebase Hosting: preview channels for pull requests now (FEAT-002) and live releases on merge later (FEAT-003). They need Google credentials. Firebase's own GitHub setup stores a service account key in a repository secret and grants that account Firebase Authentication Admin and Cloud Run Viewer, which this website does not use.

## Decision

Workflows get short-lived credentials through Workload Identity Federation. A pool `github` with an OIDC provider `github-actions` trusts GitHub's token issuer, with an attribute condition that accepts only tokens whose `repository_id` is this repository's. Only that repository may impersonate one service account, `hosting-deployer`, which holds Firebase Hosting Admin and Service Usage Consumer (the Firebase CLI checks that the Hosting API is enabled before it deploys). The service account has no keys. The repository stores the provider and service account names as variables, not secrets. `npm run hosting:setup` creates all of it idempotently.

## Alternatives Considered

- **Service account key in a GitHub secret**: works everywhere, but the key never expires on its own, must be rotated by hand and is usable from anywhere if it leaks.
- **`firebase login:ci` token**: deprecated, and tied to a person's account rather than to the repository.
- **Condition on the repository name**: readable, but a deleted repository's name can be taken by a new repository; the numeric id cannot.

## Consequences

No credential exists to leak or rotate; a token lasts one hour and works only for this repository's workflows. Pull requests from forks get no token at all, so they cannot be previewed. Granting a new deploy permission means adding a role to `hosting-deployer` in the setup script. Moving the repository to another owner keeps its id, so the trust survives a rename or transfer.
