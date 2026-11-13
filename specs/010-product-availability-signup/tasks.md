# Tasks: Product Availability and Release Candidate Signup

**Input**: Design documents from `/specs/010-product-availability-signup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/release-signup-api.md

## Phase 1: Content and text (foundation, blocks all stories)

- [x] T001 Add the optional `install` source to `Product` in packages/content/src/types.ts and its rule (required for available and preview, absent for in development) in packages/content/src/portfolio.ts
- [x] T002 [P] Set `install` for AnyContext and Dev Cycle Protocol and the site of DocMapper in packages/content/src/products/ (research R9, R11)
- [x] T003 Add `docmapper` to `SiteId` and the product site ids, and export `releaseSignupEndpoint` in packages/content/src/index.ts
- [x] T004 [P] Availability, form and subscription page text in packages/i18n/src/availability.en.json, exported from packages/i18n/src/index.ts
- [x] T005 Tests in packages/content/src/portfolio.test.ts, packages/content/src/index.test.ts and packages/i18n/src/index.test.ts

## Phase 2: Function (foundation for US2 and US3)

- [x] T006 Create the `functions` workspace (package.json, tsconfig.json, vitest project) and add it to the root package.json and Vitest config
- [x] T007 [P] Product ids in functions/src/products.ts with a test that they equal the portfolio's
- [x] T008 [P] Request validation and email normalization in functions/src/validation.ts with tests
- [x] T009 [P] Token creation, hashing and checking in functions/src/tokens.ts with tests
- [x] T010 [P] Confirmation email text in functions/src/email.ts with tests
- [x] T011 `SubscriptionStore` interface and in-memory store in functions/src/store.ts
- [x] T012 Subscribe, confirm and unsubscribe rules and the hourly client limit in functions/src/subscriptions.ts and functions/src/limits.ts with tests (fixed clock)
- [x] T013 Firestore store in functions/src/firestore-store.ts (transactions for subscribe and limit)
- [x] T014 HTTP routing, CORS allow-list and logging in functions/src/http.ts with tests; `releaseSignup` export in functions/src/index.ts
- [x] T015 firestore.rules (deny all) and firestore.indexes.json (TTL on `expiresAt` and `deleteAt`); functions and firestore in firebase.json

## Phase 3: User Story 1 - Availability on the product page (P1)

- [x] T016 [US1] `AvailabilityPanel` in packages/ui/src/components/AvailabilityPanel.vue with test
- [x] T017 [US1] `ProductIntro` in packages/ui/src/components/ProductIntro.vue with test; exports in packages/ui/src/index.ts
- [x] T018 [US1] Home pages of anycontext, devcycle, gedo and aurora use `ProductIntro`; their tests updated

## Phase 4: User Story 2 - Release candidate signup (P1)

- [x] T019 [US2] Fetch client in packages/ui/src/release-signup/client.ts with tests
- [x] T020 [US2] `ReleaseSignupForm` in packages/ui/src/components/ReleaseSignupForm.vue with test (validation, success, rate limit, fallback, no-JavaScript note)
- [x] T021 [US2] `SubscriptionResultPage` (confirm mode) in packages/ui/src/components/SubscriptionResultPage.vue with test
- [x] T022 [US2] `/subscription/confirm` route on every product site
- [x] T023 [US2] Product sites' CSP `connect-src` gains the function origin in firebase.json; hosting tests updated

## Phase 5: User Story 3 - Unsubscribe (P1)

- [x] T024 [US3] Unsubscribe mode of `SubscriptionResultPage` with test and the `/subscription/unsubscribe` route on every product site

## Phase 6: User Story 4 - DocMapper site (P2)

- [x] T025 [US4] sites/docmapper (copy of the product site skeleton) with tests
- [x] T026 [US4] `docmapper` hosting target in firebase.json and .firebaserc, `docmapper.levix.digital` in domains.json; scripts' site lists and tests updated

## Phase 6b: User Story 5 - Release candidate announcements (P1, added 2026-11-13)

- [x] T033 [US5] Announcement email in functions/src/email.ts and the announcement store methods in functions/src/store.ts and functions/src/firestore-store.ts, with tests
- [x] T034 [US5] `npm run announce` in functions/src/announce-cli.ts (preview by default, `--send`, once per version)
- [x] T035 [US5] Release candidate watcher in functions/src/release-watch.ts and functions/src/watch-cli.ts with tests; `releases` repository per product in functions/src/products.ts
- [x] T036 [US5] .github/workflows/announce-release-candidates.yml (hourly, gated by `vars.FUNCTIONS_DEPLOY`)
- [x] T037 [US5] Message to the Gedo, Aurora Dev Suite and DocMapper projects asking them to publish release candidates as pre-releases in their releases repository

## Phase 7: CI, deploy and setup

- [x] T027 `changed-sites.mjs` reports `functions`; tests
- [x] T028 `functions` job in .github/workflows/deploy.yml gated by `vars.FUNCTIONS_DEPLOY`
- [x] T029 Function deploy roles and APIs in scripts/hosting-setup.mjs; tests

## Phase 8: Polish and documentation

- [x] T030 ADR-0015; docs/architecture pages; TECH_SPEC; README; TECDOC index
- [x] T031 Manual tests MT-PROD-001 and MT-PROD-002 in tests/MANUAL_TESTS.md
- [x] T032 `npm run check`, `npm run build`, `verify:dist`, `verify:hosting`, Lighthouse; screenshots of a product page in both themes
