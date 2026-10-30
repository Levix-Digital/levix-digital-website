---

description: "Task list for the workspace and build setup"
---

# Tasks: Workspace and Build Setup

**Input**: Design documents from `/specs/001-workspace-build-setup/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/commands.md, quickstart.md

**Tests**: required by the spec (FR-009, User Story 3) and the protocol; written with the code they prove.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup

**Purpose**: the workspace root

- [x] T001 Create the root `package.json` (private, `workspaces: ["sites/*", "packages/*"]`, `engines.node` `^22.22.2 || >=24.15.0`), `.npmrc` (`engine-strict=true`), `.nvmrc` (22) and `.gitignore` (node_modules, dist, coverage, .env*, caches)
- [x] T002 [P] Create `tsconfig.base.json` with strict options (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `moduleResolution: "bundler"`, `verbatimModuleSyntax`)
- [x] T003 Install the pinned dev dependencies at the root (typescript 6.0, vue-tsc, vite, @vitejs/plugin-vue, vite-ssg, vue, vue-router, @unhead/vue, tailwindcss, @tailwindcss/vite, vitest, jsdom, @vue/test-utils, eslint, typescript-eslint, eslint-plugin-vue, eslint-plugin-boundaries) and commit `package-lock.json`

## Phase 2: Foundational

**Purpose**: the shared packages and build configuration every site needs

- [x] T004 [P] Create `packages/i18n` (`package.json` with `exports`, `tsconfig.json`, `src/index.ts` exporting `SOURCE_LANGUAGE`, `src/index.test.ts`)
- [x] T005 [P] Create `packages/content` (`package.json` with `exports`, `tsconfig.json`, `src/index.ts` exporting the company facts, `src/index.test.ts`)
- [x] T006 [P] Create `packages/ui` (`package.json` exporting `.` and `./styles.css`, `tsconfig.json`, `vitest.config.ts`, `src/styles.css` with `@import "tailwindcss"` and `@source "./components"`, `src/components/PageContainer.vue`, `src/components/PageContainer.test.ts`, `src/index.ts`)
- [x] T007 Create `tooling/vite-site.ts` with `defineSiteConfig()` (Vue and Tailwind plugins, vite-ssg options, `dist` output, jsdom test environment)

**Checkpoint**: packages type check and their tests pass

## Phase 3: User Story 1 - Build every site from a fresh clone (Priority: P1) 🎯 MVP

**Goal**: five sites build into prerendered `dist` folders

**Independent Test**: `npm ci && npm run build && npm run verify:dist`

- [x] T008 [US1] Create `sites/home` (`package.json` as `@levix/site-home` with dev, build, preview and typecheck scripts, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.ts`, `src/App.vue`, `src/routes.ts`, `src/styles.css`, `src/env.d.ts`, `src/locales/en.json`, `src/pages/HomePage.vue`) using `PageContainer`, the company name and `SOURCE_LANGUAGE` for `<html lang>`
- [x] T009 [US1] Add `sites/home/src/pages/HomePage.test.ts`: renders the heading with `@vue/server-renderer` and with `@vue/test-utils`
- [x] T010 [P] [US1] Create `sites/anycontext`, `sites/devcycle`, `sites/gedo` and `sites/aurora` the same way, each with its product name and its test
- [x] T011 [US1] Add the root `build` script and `scripts/verify-prerender.mjs` with the root `verify:dist` script
- [x] T012 [US1] Run `npm ci`, `npm run build` and `npm run verify:dist` on a clean tree and time the build (SC-005)

**Checkpoint**: User Story 1 works on its own

## Phase 4: User Story 2 - Develop a site with instant feedback (Priority: P2)

**Goal**: one site runs in development mode with hot reload across packages

**Independent Test**: quickstart step 5

- [x] T013 [US2] Start `npm run dev -w @levix/site-home`, change `HomePage.vue` and `PageContainer.vue`, and confirm both reload in under 3 seconds (SC-004); fix the Vite configuration if a package change is not picked up

## Phase 5: User Story 3 - Catch mistakes before review (Priority: P3)

**Goal**: one root command type checks, lints and tests everything

**Independent Test**: quickstart steps 6 and 7

- [x] T014 [US3] Add `vitest.config.ts` at the root with `projects: ["packages/*", "sites/*", "tooling"]` and the root `test` script
- [x] T015 [US3] Add the root `typecheck` script running each workspace's `vue-tsc --noEmit`
- [x] T016 [US3] Add `eslint.config.js` (typescript-eslint, eslint-plugin-vue, eslint-plugin-boundaries with the `site` and `package` element types and entry-point-only imports) and the root `lint` script
- [x] T017 [US3] Add `tooling/eslint-boundaries.test.ts`: ESLint on code samples of the three forbidden imports reports each one, and an allowed import passes
- [x] T018 [US3] Add the root `check` script (`typecheck`, `lint`, `test`) and seed the three mistakes of quickstart step 7 to confirm each fails, then revert

## Phase 6: Polish and Documentation

- [x] T019 [P] Create ADR-0006 "Tailwind CSS 4 with a shared stylesheet theme" with `new_adr.py`
- [x] T020 [P] Edit `docs/architecture/ui.md` and `docs/architecture/sites.md` in place; change the FEAT-006 description in `docs/BACKLOG.md`
- [x] T021 [P] Add the "Development" section to `README.md`
- [x] T022 Rebuild the TECDOC index; run `check_docs`, `check_readme` and `check_design`
- [x] T023 Run the full quickstart on a clean clone

## Dependencies and Execution Order

- Phase 1, then Phase 2, then the user stories in order (US2 and US3 need the sites of US1), then Phase 6.
- Inside a phase, tasks marked [P] touch different files and can run in parallel.
