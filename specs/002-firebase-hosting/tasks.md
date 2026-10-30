---

description: "Task list for the Firebase hosting sites and preview channels"
---

# Tasks: Firebase Hosting Sites and Preview Channels

**Input**: Design documents from `/specs/002-firebase-hosting/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/commands.md, quickstart.md

**Tests**: required by the spec (FR-013) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

**Purpose**: the pinned CLI and the configuration files

- [ ] T001 Add `firebase-tools` 15.34.1 as a root dev dependency and commit `package-lock.json`
- [ ] T002 Create `.firebaserc` (default project `levix-digital`, hosting targets `home` -> `levix-digital`, `anycontext` -> `levix-anycontext`, `devcycle` -> `levix-devcycle`, `gedo` -> `levix-gedo`, `aurora` -> `levix-aurora`) and `firebase.json` (one hosting entry per target: `public`, default ignore, `cleanUrls`, `trailingSlash: false`, `**` no-cache then `/assets/**` immutable); ignore `.firebase/` and `*-debug.log` in `.gitignore`

## Phase 2: Foundational

**Purpose**: shared script helpers and their test project

- [ ] T003 [P] Create `scripts/lib/run.mjs` (`runCommand(cmd, args, options)` returning `{ code, stdout, stderr }`, streaming output when asked)
- [ ] T004 [P] Create `scripts/lib/hosting-config.mjs` (read `firebase.json` and `.firebaserc`: project id, targets with folder and site id) and `scripts/lib/hosting-config.test.mjs`, including the check that targets match `sites/*` and each entry's rules
- [ ] T005 Add a `scripts` project to `vitest.config.ts` and include `scripts/**/*.mjs` in the type check (`checkJs`) and lint

**Checkpoint**: `npm run check` passes with the configuration test

## Phase 3: User Story 1 - Set up the hosting project once (Priority: P1)

**Goal**: one idempotent command creates the sites and the keyless deploy identity

**Independent Test**: unit tests with a fake runner; on the real project, two runs (the second prints only `exists`)

- [ ] T006 [US1] Create `scripts/hosting-setup.mjs`: preflight (project, billing enabled, `resourcemanager.projects.setIamPolicy` permission), then read-before-create for the APIs (`firebasehosting`, `iam`, `iamcredentials`, `sts`), the hosting sites, the pool `github`, the provider `github-actions` (issuer, attribute mapping, condition on the repository id), the service account `hosting-deployer`, its `roles/firebasehosting.admin` binding and the `roles/iam.workloadIdentityUser` binding for the repository principal set; print each resource state and the two repository variable values
- [ ] T007 [US1] Add `scripts/hosting-setup.test.mjs`: preflight failures create nothing; first run creates all; second run creates none; provider condition and principal set use the repository id; no key is ever created
- [ ] T008 [US1] Add the `hosting:setup` root script

**Checkpoint**: setup tests pass

## Phase 4: User Story 2 - Publish a site from the repository (Priority: P1)

**Goal**: one command publishes all or some built sites

**Independent Test**: unit tests with a fake runner; `npm run verify:hosting` against the emulator

- [ ] T009 [US2] Create `scripts/hosting-deploy.mjs`: parse sites and `--channel`, refuse unknown or unbuilt sites, run `firebase deploy --only hosting:<t>,...` or `firebase hosting:channel:deploy <channel> --only <t>,... --expires 7d --json`, print the addresses (preview: a Markdown table with a hidden marker)
- [ ] T010 [US2] Add `scripts/hosting-deploy.test.mjs` (refusals before the runner is called, exact commands, table from a recorded CLI JSON)
- [ ] T011 [US2] Create `scripts/verify-hosting.mjs` (run inside `firebase emulators:exec --only hosting --project demo-levix`; for each target in order on the hub's hosting ports: `/` 200 and no-cache, one asset immutable, `/index.html` redirects to `/`, an unknown path 404)
- [ ] T012 [US2] Add the root scripts `deploy`, `deploy:preview` and `verify:hosting`; run `npm run build && npm run verify:hosting`

**Checkpoint**: deploy tests and the emulator check pass

## Phase 5: User Story 3 - Preview every pull request (Priority: P2)

**Goal**: one comment with five preview addresses per pull request

**Independent Test**: this pull request, once the setup has run and the variables are set

- [ ] T013 [US3] Create `.github/workflows/preview.yml`: `pull_request` (opened, synchronize, reopened), job only when the head repository is this repository, permissions `contents: read`, `id-token: write`, `pull-requests: write`, concurrency per pull request with cancel, steps checkout, setup-node from `.nvmrc` with npm cache, `npm ci`, `npm run build`, `npm run verify:dist`, `npm run verify:hosting`, auth with the two variables, `npm run deploy:preview -- --channel pr-<number>` to a file, create or edit the comment carrying the marker with `actions/github-script`; skip the publish steps with a notice when the variables are not set yet
- [ ] T014 [US3] Validate the workflow syntax (actionlint) and its permissions

**Checkpoint**: workflow passes actionlint

## Phase 6: Polish and documentation

- [ ] T015 [P] Write ADR-0007 "Keyless deploys with Workload Identity Federation" and `docs/architecture/hosting.md`; update `docs/architecture/sites.md`
- [ ] T016 [P] Record the project, region and billing decision in `docs/product/TECH_SPEC.md`
- [ ] T017 [P] Add the "Hosting" section to `README.md`
- [ ] T018 Add the two manual tests to the curated suite; rebuild the TECDOC index; run `check_docs`, `check_readme`, `manual_tests validate`, `npm run check`, `npm run build`, `npm run verify:dist`, `npm run verify:hosting`

## Dependencies

- Phase 1 -> Phase 2 -> US1, US2 (independent of each other) -> US3 (uses the deploy command) -> Phase 6.
