# Implementation Plan: Continuous Integration and Production Deploy

**Branch**: `feat/003-ci-deploy` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-ci-deploy/spec.md`

## Summary

One reusable workflow, `CI`, runs the checks: a `check` job (type check, lint, unit tests) on Linux with Node.js 22 and 24 and on Windows with the pinned version, and a `build` job (build, prerender check, hosting check, Lighthouse audit of every site) that uploads the built sites as an artifact. It runs on every pull request into `main`. A second workflow, `Deploy`, runs on every push to `main` and by hand: it calls `CI` on the pushed commit, computes the changed sites with a tested script, downloads the artifact the checks passed on, publishes only those sites with the existing `npm run deploy` in the `production` environment, and checks each published address. Deploys queue, never cancel. The keyless identity of FEAT-002 is reused. Decisions and alternatives are in [research.md](research.md); commands and workflows in [contracts/ci.md](contracts/ci.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) for the scripts, typed with JSDoc and checked by `tsc --checkJs`, as in FEAT-002; Node.js 22 (pinned in `.nvmrc`) and 24

**Primary Dependencies**: `@lhci/cli` 0.15.1 (dev dependency, pinned by the lock file) with Lighthouse 13.5.0 through `overrides`; firebase-tools from FEAT-002; Chrome preinstalled on GitHub's Ubuntu runners; GitHub Actions `actions/checkout@v5`, `actions/setup-node@v5`, `actions/upload-artifact@v7`, `actions/download-artifact@v8`, `google-github-actions/auth@v3`

**Storage**: N/A (Lighthouse reports as run artifacts, kept 14 days)

**Testing**: Vitest (unit tests of the change rules, the site list parsing and the address check with a fake fetch); the workflows themselves are proven on this pull request and on the first merge

**Target Platform**: GitHub Actions `ubuntu-latest` and `windows-latest`; Firebase Hosting live channels

**Project Type**: CI/CD for the static sites of FEAT-001 and the hosting of FEAT-002

**Performance Goals**: all checks within 15 minutes (SC-001); change live within 15 minutes of a merge (SC-003)

**Constraints**: no new credential; forks never get credentials; the deploy publishes the artifact that passed the checks

**Scale/Scope**: 2 workflows, 2 scripts, 1 Lighthouse configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | No module changes; the scripts live in `scripts/` with the hosting scripts and reuse `scripts/lib/hosting-config.mjs` for the list of sites |
| Simplicity first | Path rules instead of a dependency graph (shared change publishes every site); one reusable check workflow instead of two copies; the existing deploy command |
| No speculative code | No version bumps or release candidates, no domains (FEAT-004), no headers (FEAT-005), no end-to-end tests (later items); the preview workflow is unchanged |
| Testability | The change rules are a pure function of the changed paths and the site list; the address check takes an injected fetch |
| Security | Least permissions per job; `id-token: write` only in the deploy job; the `production` environment limited to `main`; no secrets |
| Repository content in English, no references to the tools used to write it | Code, docs and workflow messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-ci-deploy/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
├── contracts/ci.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
.github/workflows/
├── ci.yml                        # pull_request into main, workflow_call: check (matrix) + build (artifact, Lighthouse)
└── deploy.yml                    # push to main, workflow_dispatch: calls ci.yml, then changed sites -> deploy -> address check
lighthouserc.json                 # budgets: performance and accessibility >= 0.9 (median of 3 runs, mobile)
package.json                      # + @lhci/cli; scripts lighthouse, sites:changed, verify:live
scripts/
├── lighthouse.mjs                # runs lhci for every built site (one staticDistDir per site)
├── changed-sites.mjs             # changed paths -> sites to publish (FR-007, FR-008); --sites for manual runs
├── verify-live.mjs               # GET https://<site>.web.app/ for each published site
└── *.test.mjs                    # unit tests
```

**Structure Decision**: the scripts join the hosting scripts in `scripts/` and the existing `scripts` Vitest project; workflows sit next to `preview.yml`.

## Complexity Tracking

None: no constitution violations.

## Dev Cycle Protocol

### Backlog items and release

FEAT-003 (Continuous integration and deployment, EPIC-001), release v0.1.0 "Company home".

### Tests (quality-assurance)

- Change rules (`changed-sites`): a path under one site selects that site; a shared package, the lock file, `firebase.json`, `tooling/` or `scripts/` select every site; `docs/`, `specs/`, `.specify/`, `.claude/`, root Markdown, `LICENSE`, `tests/MANUAL_TESTS.md` and `preview.yml` select none; a mix selects the union; an unknown base commit selects every site; a manual list is validated against the hosting targets and unknown names fail (FR-007, FR-008, FR-010, FR-014).
- Address check (`verify-live`): success for 200 HTML, failure naming the site for any other status or a network error, with an injected fetch (FR-013).
- Lighthouse runner: the per-site `staticDistDir` arguments, and a missing build fails before Lighthouse starts.
- The workflows are proven on this pull request (CI) and on the merge (Deploy), and the budgets by the real Lighthouse run on the placeholder pages.
- Manual tests: add "A merge publishes only the changed site" and "Manual deploy of one site" (they need the real project and a merge), and "Required checks block a failing pull request" (a repository setting).
- Acceptance: the spec's acceptance scenarios and SC-001 to SC-005.

### Documentation (architecture-docs, user-docs)

- New subsystem page `docs/architecture/ci.md`: the two workflows, jobs and triggers, budgets, change rules, artifact handover, the `production` environment, concurrency, required checks, failure and recovery; `hosting.md` links it for publishing.
- New ADR-0008 "Continuous deploy of changed sites on merge to main" (alternatives: release candidates with promotion, deploying every site on every merge, a manual approval on the environment).
- `README.md`: a "Continuous integration and deploy" section (what runs, how to read a Lighthouse failure, manual deploy, the one-time repository settings).
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- New workflows `ci.yml` and `deploy.yml`; `preview.yml` unchanged. This answers the protocol's CI policy error (no test workflow on pull requests into `main`). The policy warnings about version files, release and promote workflows stay: the website is published continuously by design (ADR-0008).
- One-time repository settings by Levi after the first CI run: branch protection on `main` (pull request required, the CI checks required, conversation resolution, no force pushes) and the `production` environment limited to `main`. Commands are in the quickstart; they can be run from Levi's machine.
- Version impact: none (no version files); part of release v0.1.0.
- Observability: each deploy run prints the changed files, the selected sites and why, the CLI output and each address; the `production` environment lists every deploy with its commit; Lighthouse reports are run artifacts.

### Security, migration and rollback

- No secrets; the deploy identity and the repository variables of FEAT-002 are reused. Workflow permissions default to `contents: read`; only the deploy job gets `id-token: write` and `deployments` through the environment.
- The identity's federation trusts every workflow of the repository (FEAT-002); the environment's branch rule keeps production deploys to `main`. Limiting the identity itself to `main` would need a second service account and is noted as a possible follow-up, not done here.
- No data or migrations.
- Rollback of a site: console release history or `hosting:clone` (documented in `hosting.md`); a later merge or a manual deploy republishes from `main`. Rollback of this change: revert the merge commit; nothing outside the repository changes except the two settings, which can be removed in Settings.
