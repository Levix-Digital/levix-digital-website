# Tasks: Release Information at Build Time

**Input**: Design documents from `/specs/011-release-info-build-time/`

## Phase 1: Release source (foundation)

- [x] T001 `Platform`, `ReleaseSource` (`repository`, optional `downloads`) on `Product` in packages/content/src/types.ts
- [x] T002 Releases repository for the five products and AnyContext installers in packages/content/src/products/*.ts; validation in portfolio.ts
- [x] T003 Announcements read the repository from the product data (or a test checks they match) in functions/src/products.ts
- [x] T004 `readRelease` in packages/content/src/releases.ts with tests; export `./releases`

## Phase 2: User Story 1 - Version and direct links (P1)

- [x] T005 [US1] Strings in packages/i18n/src/availability.en.json
- [x] T006 [US1] `release` prop in packages/ui/src/components/AvailabilityPanel.vue (and ProductIntro) with tests
- [x] T007 [US1] `releaseInfo` plugin in tooling/vite-site.ts (virtual module, `release.json`) with test
- [x] T008 [US1] Product home pages pass the release; `verify:dist` checks `release.json`

## Phase 3: User Story 2 - The site follows new releases (P1)

- [x] T009 [US2] scripts/release-refresh.mjs with tests
- [x] T010 [US2] .github/workflows/release-refresh.yml; token for the build in ci.yml

## Phase 4: Polish and documentation

- [x] T011 Run `npm run check`, `npm run build`, `npm run verify:dist`, `npm run verify:hosting`
- [x] T012 [P] ADR-0016, docs/architecture, README, TECDOC index
- [x] T013 [P] Backlog (FEAT-016 plan), roadmap move to v0.1.0, manual test MT-PROD-003
- [x] T014 Screenshots of the AnyContext panel for the pull request

## Dependencies

Phase 1 first; Phase 2 built on FEAT-037 (`feat/010-product-availability-signup`); Phase 3 after T007; Phase 4 last.
