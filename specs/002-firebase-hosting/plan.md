# Implementation Plan: Firebase Hosting Sites and Preview Channels

**Branch**: `feat/002-firebase-hosting` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-firebase-hosting/spec.md`

## Summary

Put the five sites on Firebase Hosting in one project (`levix-digital`): `.firebaserc` names the project and maps the targets `home`, `anycontext`, `devcycle`, `gedo` and `aurora` to their hosting sites; `firebase.json` serves each `sites/<site>/dist` with clean URLs and cache headers. An idempotent setup command creates the hosting sites and a keyless deploy identity (Workload Identity Federation limited to this repository, a service account with Firebase Hosting Admin only). A deploy command publishes all or some sites, live or to a preview channel, after checking they are built. A GitHub workflow previews every pull request from the repository and keeps one comment with the addresses. The hosting emulator checks the configuration offline. Decisions and alternatives are in [research.md](research.md); commands in [contracts/commands.md](contracts/commands.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) for the scripts, typed with JSDoc and checked by `tsc --checkJs`; Node.js 22 as in FEAT-001

**Primary Dependencies**: firebase-tools 15.34.1 (dev dependency, pinned by the lock file); `gcloud` (preinstalled in Cloud Shell and on GitHub runners, used only by the setup); GitHub Actions `actions/checkout@v5`, `actions/setup-node@v5`, `google-github-actions/auth@v3`, `actions/github-script@v8`

**Storage**: N/A

**Testing**: Vitest (unit tests of the scripts with a fake command runner; a configuration test of `firebase.json` and `.firebaserc` against `sites/*`); the hosting emulator through `npm run verify:hosting`

**Target Platform**: Firebase Hosting (global CDN); GitHub Actions `ubuntu-latest`

**Project Type**: hosting configuration and build-time scripts for the static sites of FEAT-001

**Performance Goals**: preview comment within 10 minutes of a push (SC-003)

**Constraints**: no long-lived credentials; forks never get credentials; only identifiers in repository variables

**Scale/Scope**: 1 project, 5 hosting sites, 1 workflow, 3 scripts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | No module changes; hosting configuration lives at the root and the scripts in `scripts/`, as the technical specification names them |
| Simplicity first | No infrastructure tool for a dozen resources; one deploy script for local and automated use; previews of all sites instead of a change graph |
| No speculative code | No production deploy workflow (FEAT-003), no domains (FEAT-004), no security headers (FEAT-005), no functions or Firestore |
| Testability | Scripts take an injected command runner; their decisions are unit tested without Google; the hosting behavior is checked with Firebase's emulator |
| Security | Keyless federation bound to the repository id, one narrow role, fork pull requests excluded, least workflow permissions |
| Repository content in English, no references to the tools used to write it | Code, docs, comments and the preview comment in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-firebase-hosting/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
├── contracts/commands.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
.firebaserc                       # default project, target -> hosting site
firebase.json                     # one hosting entry per site: public, cleanUrls, trailingSlash, headers
.github/workflows/preview.yml     # preview channel per pull request, one comment
package.json                      # + firebase-tools; scripts hosting:setup, deploy, deploy:preview, verify:hosting
scripts/
├── lib/run.mjs                   # runCommand(): spawns a command, returns { code, stdout, stderr }; the injected runner
├── lib/hosting-config.mjs        # reads firebase.json and .firebaserc: targets, folders, project, site ids
├── hosting-setup.mjs             # one-time setup (checks, then create-if-missing per resource)
├── hosting-deploy.mjs            # build check, live or preview deploy, preview table
├── verify-hosting.mjs            # emulator probe of every target
└── *.test.mjs                    # unit tests of the three scripts and the configuration
```

**Structure Decision**: root configuration files are where the Firebase CLI looks for them; scripts join `scripts/verify-prerender.mjs`. The scripts are covered by a new Vitest project `scripts`.

## Complexity Tracking

None: no constitution violations.

## Dev Cycle Protocol

### Backlog items and release

FEAT-002 (Firebase hosting sites and preview channels, EPIC-001), release v0.1.0 "Company home".

### Tests (quality-assurance)

- Configuration: every folder in `sites/*` has exactly one hosting entry and one target, the entry's `public` is `sites/<site>/dist`, and every entry has clean URLs, no trailing slash and the two cache rules in that order (FR-002, FR-007, FR-008, FR-013).
- Deploy script: an unknown site and a site without `dist/index.html` fail before the CLI is called; the live and preview commands passed to the runner are exact; the preview table is built from a recorded CLI JSON result (FR-005, FR-006, FR-009).
- Setup script, with a fake runner: billing off or missing IAM access stops before any create; a first run creates every resource in order; a second run against the state left by the first creates nothing; the provider's attribute condition carries the repository id (FR-003, FR-004, FR-011).
- Emulator: `npm run verify:hosting` after `npm run build` (FR-007, FR-008).
- Manual tests: add "Preview of a pull request" and "Publish one site" to the curated suite, since they need the real project; both are run on the release candidate of v0.1.0.
- Acceptance: the spec's acceptance scenarios and SC-001 to SC-005; the preview of this pull request once Levi has run the setup.

### Documentation (architecture-docs, user-docs)

- New subsystem page `docs/architecture/hosting.md`: project, sites and targets, headers, deploy identity, setup, deploy and preview commands, rollback; links ADR-0003 and the new ADR-0007.
- New ADR-0007 "Keyless deploys with Workload Identity Federation" (alternatives: service account key secret, CI token).
- `docs/architecture/sites.md`: the output folder is served by the hosting target of the same name (link to `hosting.md`).
- `docs/product/TECH_SPEC.md`: the open question on project, region and billing becomes a decision (project `levix-digital`, Levi's region, Blaze plan on Levi's billing account).
- `README.md`: a "Hosting" section (one-time setup, publish, previews, rollback) following `user-docs`.
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- New workflow `.github/workflows/preview.yml` (pull requests only). Production deploys on merge and the check jobs are FEAT-003; it reuses `npm run deploy`.
- Version impact: minor (part of v0.1.0); no version files yet.
- Observability: the setup prints every resource and its state; the deploy script prints each site's address; workflow logs keep the CLI output. Hosting's release history records every live release with its author (the deploy identity) and time.

### Security, migration and rollback

- No secrets: federation tokens are short-lived and bound to `assertion.repository_id`; the service account has no keys and one role; the workflow has `id-token: write` only in the preview job, which never runs for forks; repository variables hold identifiers only.
- No data or migrations.
- Rollback of a site release: console release history or `hosting:clone` (documented). Rollback of this change: revert the merge commit; the cloud resources stay harmless (no keys) and can be removed with the commands listed in `hosting.md`.
