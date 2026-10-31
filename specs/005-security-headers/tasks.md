---

description: "Task list for security headers"
---

# Tasks: Security Headers for Every Site

**Input**: Design documents from `/specs/005-security-headers/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/headers.md

**Tests**: required by the spec (FR-003 to FR-007) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

- [x] T001 `scripts/lib/security-headers.mjs`: the policy (contract values, a comment per header) and `compareHeaders(served, policy)` returning the differences

## Phase 2: User Story 2 - One policy for all sites (Priority: P1)

- [x] T002 [US2] Add the headers to the `**` rule of the five targets in `firebase.json`
- [x] T003 [US2] `scripts/lib/security-headers.test.mjs`: every target matches; missing, different or extra headers fail naming target and header

## Phase 3: User Story 1 - Every page is served with the security headers (Priority: P1)

- [x] T004 [P] [US1] `scripts/lib/inline-code.mjs` and its test; `verify-prerender.mjs` reports inline code per page
- [x] T005 [P] [US1] `verify-hosting.mjs` checks the headers on `/`, an asset and an unknown path
- [x] T006 [P] [US1] `lighthouserc.json` asserts `errors-in-console`
- [x] T007 [US1] Build, `verify:dist`, `verify:hosting` and `lighthouse` pass locally

## Phase 4: User Story 3 - Deploys check the headers live (Priority: P2)

- [x] T008 [US3] `verify-live.mjs` checks the headers at each address; tests in `verify-live.test.mjs`

## Phase 5: Polish and documentation

- [x] T009 [P] ADR-0010; `docs/architecture/hosting.md`; `docs/product/TECH_SPEC.md` link; `README.md` if needed; TECDOC index, `check_docs`, `check_readme`
- [x] T010 [P] Manual tests: Observatory grade, clean console on the five domains; `manual_tests validate`
- [x] T011 `npm run check`, the pull request, the preview's headers read (R8); after the merge, the deploy's `verify:live` passes
