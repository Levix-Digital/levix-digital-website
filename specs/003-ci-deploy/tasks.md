---

description: "Task list for continuous integration and production deploy"
---

# Tasks: Continuous Integration and Production Deploy

**Input**: Design documents from `/specs/003-ci-deploy/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/ci.md, quickstart.md

**Tests**: required by the spec (FR-014) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

- [x] T001 Add `@lhci/cli` 0.15.1 as a root dev dependency and commit `package-lock.json`; ignore `.lighthouseci/` in `.gitignore`

## Phase 2: User Story 1 - Every pull request is checked (Priority: P1)

**Goal**: one reusable workflow with all checks and the Lighthouse budgets

**Independent Test**: this pull request's checks; a local `npm run lighthouse` after `npm run build`

- [x] T002 [US1] Create `lighthouserc.json` (3 runs, performance and accessibility minimum 0.9, filesystem upload) and `scripts/lighthouse.mjs` with `scripts/lighthouse.test.mjs` (arguments per site, unbuilt site fails); add the `lighthouse` script
- [x] T003 [US1] Create `.github/workflows/ci.yml` (`pull_request` into `main`, `workflow_call`; `check` matrix and `build` with artifacts) per contracts/ci.md

**Checkpoint**: `npm run check`, `npm run build` and `npm run lighthouse` pass locally

## Phase 3: User Story 2 - A merge puts the changed sites live (Priority: P1)

**Goal**: publish only the changed sites, from the checked artifact

**Independent Test**: unit tests of the change rules; the deploy run of this merge

- [x] T004 [P] [US2] Create `scripts/changed-sites.mjs` and `scripts/changed-sites.test.mjs` (rules of contracts/ci.md, unknown base, union, manual list); add the `sites:changed` script
- [x] T005 [P] [US2] Create `scripts/verify-live.mjs` and `scripts/verify-live.test.mjs` (injected fetch, retries, names the failing site); add the `verify:live` script
- [x] T006 [US2] Create `.github/workflows/deploy.yml` (`push` to `main`; calls `ci.yml`; `plan`; `deploy` in `production`, queued; summary)

## Phase 4: User Story 3 - Publish on demand (Priority: P2)

- [x] T007 [US3] Add `workflow_dispatch` with the `sites` input to `deploy.yml`, validated by `sites:changed --sites`

## Phase 5: Polish and documentation

- [x] T008 [P] `docs/architecture/ci.md`, ADR-0008, link from `hosting.md`; rebuild the TECDOC index; `check_docs`
- [x] T009 [P] README section "Continuous integration and deploy"; `check_readme`
- [x] T010 [P] Manual tests MT-CI-001 to MT-CI-003 in `tests/MANUAL_TESTS.md`; `manual_tests validate`
- [x] T011 `check_design`, `check_ci_policy`, `npm run check`; open the pull request
