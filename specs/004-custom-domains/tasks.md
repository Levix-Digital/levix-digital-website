---

description: "Task list for custom domains"
---

# Tasks: Custom Domains for the Company Site and the Product Sites

**Input**: Design documents from `/specs/004-custom-domains/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/domains.md, quickstart.md

**Tests**: required by the spec (FR-010) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

- [ ] T001 Add `domains.json` with the domains of FR-001 and `scripts/lib/domains-config.mjs` reading and validating it against the hosting targets, with `scripts/lib/domains-config.test.mjs`

## Phase 2: User Story 2 - Set up the domains with one command and a list of records (Priority: P1)

- [ ] T002 [US2] `scripts/domains.mjs`: preflight, get-or-create per domain (redirect for `www`), records table with Hostinger hosts, `domains:setup` in `package.json`
- [ ] T003 [US2] `scripts/domains.test.mjs`: preflight stops before changes, created and exists, redirect body, API error names the domain, records table (add, remove, no action hidden, hosts relative to the zone)

## Phase 3: User Story 3 - Check the state of the domains (Priority: P2)

- [ ] T004 [US3] `domains:status` in `scripts/domains.mjs` and `package.json`: states per domain, exit code only when all active; tests in `scripts/domains.test.mjs`
- [ ] T005 [US3] `scripts/verify-live.mjs` requests the site's domain as well as its default address; tests in `scripts/verify-live.test.mjs`

## Phase 4: User Story 1 - Each site answers at its own domain (Priority: P1)

- [ ] T006 [US1] Run `npm run domains:setup` on Levi's machine; Levi enters the records at Hostinger; `npm run domains:status` until active (operational, no code)

## Phase 5: Polish and documentation

- [ ] T007 [P] `docs/architecture/hosting.md` (domains), `README.md` ("Domains" in "Hosting"), TECDOC index, `check_docs`, `check_readme`
- [ ] T008 [P] Manual tests: each domain over HTTPS, `www` redirect, mail delivered; `manual_tests validate`
- [ ] T009 `npm run check`, then the pull request; merge only after `domains:status` succeeds
