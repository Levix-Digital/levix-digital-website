# Tasks: Company Home Page

**Input**: Design documents from `/specs/009-company-home/`

**Prerequisites**: plan.md, spec.md, research.md

## Phase 1: Product data (foundation, blocks all stories)

- [ ] T001 Add `Product`, `ProductLine`, `AvailabilityStatus` types in packages/content/src/types.ts
- [ ] T002 [P] Add the five product data files in packages/content/src/products/ (docmapper, anycontext, devcycle, gedo, aurora) with the statuses and statements of research R3 and R5
- [ ] T003 Add the lines, the ordered portfolio and `validatePortfolio` in packages/content/src/portfolio.ts, validated when the module loads
- [ ] T004 Derive `products` from the portfolio and export `portfolio` and `productLines` in packages/content/src/index.ts
- [ ] T005 Tests in packages/content/src/portfolio.test.ts and packages/content/src/index.test.ts

## Phase 2: Components (foundation)

- [ ] T006 [P] `SectionHeading` in packages/ui/src/components/SectionHeading.vue with test
- [ ] T007 [P] `StatusBadge` in packages/ui/src/components/StatusBadge.vue with test
- [ ] T008 [P] `ActionLink` in packages/ui/src/components/ActionLink.vue with test
- [ ] T009 [P] `CeramicCard` in packages/ui/src/components/CeramicCard.vue with test
- [ ] T010 Export the components in packages/ui/src/index.ts

## Phase 3: User Story 1 - Understand what Levix Digital does (P1)

- [ ] T011 [US1] Hero strings, page title and description in sites/home/src/locales/en.json
- [ ] T012 [US1] `HeroSection` in sites/home/src/pages/home/HeroSection.vue and the section order in sites/home/src/pages/HomePage.vue

## Phase 4: User Story 2 - See the products (P1)

- [ ] T013 [US2] Line headings and status labels in sites/home/src/locales/en.json
- [ ] T014 [US2] `PortfolioSection` in sites/home/src/pages/home/PortfolioSection.vue

## Phase 5: User Story 3 - About and contact (P2)

- [ ] T015 [US3] `AboutSection` and `ContactSection` in sites/home/src/pages/home/ with their strings

## Phase 6: User Story 4 - Research (P3)

- [ ] T016 [US4] `ResearchSection` in sites/home/src/pages/home/ResearchSection.vue with its strings

## Phase 7: Polish and documentation

- [ ] T017 Page tests in sites/home/src/pages/HomePage.test.ts
- [ ] T018 Run `npm run check`, `npm run build`, `npm run verify:dist`, `npm run verify:hosting`, `npm run lighthouse`
- [ ] T019 [P] ADR-0014 and docs/architecture content.md, ui.md, sites.md; rebuild the TECDOC index
- [ ] T020 [P] Backlog and roadmap changes of the plan; manual test MT-HOME-001 in tests/MANUAL_TESTS.md
- [ ] T021 Screenshots of the home in both themes at 375 and 1280 px for the pull request

## Dependencies

Phase 1 and 2 before the stories; stories in priority order; Phase 7 last.
