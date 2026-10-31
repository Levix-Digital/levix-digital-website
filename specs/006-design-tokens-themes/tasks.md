---

description: "Task list for design tokens and themes"
---

# Tasks: Design Tokens and Themes

**Input**: Design documents from `/specs/006-design-tokens-themes/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/tokens.md

**Tests**: required by the spec (FR-006, FR-007) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

- [x] T001 Add the three Fontsource packages to `packages/ui/package.json` and the lock file

## Phase 2: User Story 1 - Every site shares the Ceramic and Aurora look (Priority: P1)

- [x] T002 [US1] `packages/ui/src/styles.css`: theme color variables, `@theme` (aurora hues, typefaces), `@theme inline` (utilities, shadows), `bg-aurora`, the page base
- [x] T003 [US1] `packages/ui/src/theme-build.test.ts`: the utilities and fonts reach the built stylesheet

## Phase 3: User Story 2 - A complete dark theme (Priority: P1)

- [x] T004 [US2] `color-scheme` rules and the `dark:` custom variant in `styles.css`; `theme-build.test.ts` checks both
- [x] T005 [US2] Build the five sites; screenshots of a home page in light, dark (system) and forced themes

## Phase 4: User Story 3 - Readable in both themes (Priority: P1)

- [x] T006 [US3] `packages/ui/src/theme.test.ts`: token form and the contract's contrast pairs in both themes

## Phase 5: Polish and documentation

- [ ] T007 [P] ADR-0011; `docs/architecture/ui.md`; README if needed; TECDOC index, `check_docs`, `check_readme`
- [ ] T008 [P] Manual test "Light and dark themes"; `manual_tests validate`
- [ ] T009 `npm run check`, build, `verify:dist`, `verify:hosting`, Lighthouse; the pull request
