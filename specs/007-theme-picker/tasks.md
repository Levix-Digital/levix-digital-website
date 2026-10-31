---

description: "Task list for the theme picker"
---

# Tasks: Theme Picker

**Input**: Design documents from `/specs/007-theme-picker/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/theme-preference.md

**Tests**: required by the spec (FR-006, FR-008) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Preference core

- [x] T001 `packages/ui/src/theme/preference.ts` and `preference.test.ts`: type, read, save, apply, storage errors

## Phase 2: User Story 1 - Choose light or dark (Priority: P1)

- [x] T002 [US1] `useThemePreference.ts` and `components/ThemePicker.vue` with `ThemePicker.test.ts`; exports in `src/index.ts`
- [x] T003 [US1] The picker and its labels on the page of each of the five sites

## Phase 3: User Story 2 - The choice is remembered (Priority: P1)

- [x] T004 [US2] `theme-init.js` and `theme-init.test.ts`; package export; `tooling/vite-site.ts` inlines it at the top of the head
- [x] T005 [US2] The script hash in `scripts/lib/security-headers.mjs` and `firebase.json`; `inline-code.mjs` and `verify-prerender.mjs` allow only hashed scripts and require the head script; their tests
- [x] T006 [US2] The `storage` event keeps other tabs in step (in T002's composable and test)

## Phase 4: User Story 3 - Usable by everyone (Priority: P1)

- [x] T007 [US3] Visible focus and the group name in the component; keyboard checked in a built page (Playwright screenshot of both themes)

## Phase 5: Polish and documentation

- [x] T008 [P] ADR-0012; `docs/architecture/ui.md`, `docs/architecture/hosting.md`; README if needed; TECDOC index, `check_docs`, `check_readme`
- [x] T009 [P] Manual test MT-UI-002; `manual_tests validate`
- [x] T010 `npm run check`, build, `verify:dist`, `verify:hosting`, Lighthouse; the pull request
