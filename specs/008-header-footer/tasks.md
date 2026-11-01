---

description: "Task list for the shared header and footer"
---

# Tasks: Shared Header and Footer

**Input**: Design documents from `/specs/008-header-footer/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/layout.md

**Tests**: required by the spec (SC-001, SC-003) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 to US4)

## Phase 1: Facts and text

- [ ] T001 [P] `packages/content/src/index.ts`: company location, `SiteId`, `SiteLink`, `companySite`, `products`; `index.test.ts` checks names and addresses against `domains.json`
- [ ] T002 [P] `packages/i18n/src/layout.en.json` and the `layoutStrings` export with its test

## Phase 2: User Story 1 - Know where I am and go to a product (Priority: P1)

- [ ] T003 [US1] `LevixMonogram.vue` from the owner's logo file (no background, no `style`, unique ids, `bevel` groove) with its test
- [ ] T004 [US1] `MainNavigation.vue` and `CompanyHeader.vue` (logo link, navigation, `pickers` slot) with tests
- [ ] T004a [US1] `ProductHeader.vue` (product name, "by Levix Digital" link, `pickers` slot; same tokens, own layout) with its test

## Phase 3: User Story 2 - Find the company's contact details (Priority: P1)

- [ ] T005 [US2] `__BUILD_YEAR__` in `tooling/vite-site.ts`, `packages/ui/vitest.config.ts` and `src/env.d.ts`; `SiteFooter.vue` (build year in the prerender, current year once mounted, `aria-current` on the current site) with its test

## Phase 4: User Story 3 - Choose the theme from the header (Priority: P1)

- [ ] T006 [US3] `SiteLayout.vue` with its test; exports in `src/index.ts`; each site's `App.vue` wraps its pages; the picker and its labels leave the home pages; site tests

## Phase 5: User Story 4 - Navigate on a phone and with a keyboard (Priority: P2)

- [ ] T007 [US4] Menu button below 768 px (prerender shows links, folding after mount, Escape, link click), skip link and landmarks; tests in T004 and T006 extended; checked in a built page at 375 px and 1280 px in both themes

## Phase 6: Polish and documentation

- [ ] T008 [P] ADR-0013; `docs/architecture/ui.md`, `sites.md`, `content.md`, `i18n.md`; README if needed; TECDOC index, `check_docs`, `check_readme`
- [ ] T009 [P] `tests/MANUAL_TESTS.md`: MT-UI-003 new, MT-UI-002 updated; `manual_tests validate`
- [ ] T010 `npm run check`, `npm run build`, `verify:dist`, `verify:hosting`, Lighthouse
