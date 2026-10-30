---

description: "Task list for custom domains"
---

# Tasks: Custom Domains for the Company Site and the Product Sites

**Input**: Design documents from `/specs/004-custom-domains/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/domains.md, quickstart.md

**Tests**: required by the spec (FR-007) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

- [x] T001 Add `domains.json` (FR-001) and `scripts/lib/domains-config.mjs` reading and validating it against the hosting targets, with `scripts/lib/domains-config.test.mjs`

## Phase 2: User Story 2 - Check the state of the domains (Priority: P1)

- [x] T002 [US2] `scripts/domains-status.mjs` and `npm run domains:status`: token, get per domain, states, records with hosts relative to the zone, exit code
- [x] T003 [US2] `scripts/domains-status.test.mjs`: all active succeeds; missing ownership, host or certificate fails naming the domain; 404 says not connected; add and remove rows, no-action records hidden; token failure

## Phase 3: User Story 3 - Deploys check the domains (Priority: P2)

- [x] T004 [US3] `scripts/verify-live.mjs` requests the site's domain as well as its default address; tests in `scripts/verify-live.test.mjs`

## Phase 4: User Story 1 - Each site answers at its own domain (Priority: P1)

- [ ] T005 [US1] Levi sets the product subdomains to `CNAME` without proxy at Cloudflare; `npm run domains:status` on Levi's machine until it succeeds (operational, no code)

## Phase 5: Polish and documentation

- [ ] T006 [P] ADR-0009 (DNS at Cloudflare, Firebase-hosted names not proxied), amending ADR-0003; `docs/product/TECH_SPEC.md` (integration and constraint); `docs/architecture/hosting.md` (domains); `README.md` ("Domains" in "Hosting"); TECDOC index, `check_docs`, `check_readme`; regenerate the constitution
- [ ] T007 [P] Manual tests: each domain over HTTPS, `www` redirect, mail delivered; `manual_tests validate`
- [ ] T008 `npm run check`, then the pull request; merge only after `domains:status` succeeds
