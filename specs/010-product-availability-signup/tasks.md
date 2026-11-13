# Tasks: Product Availability and Release Candidate Signup

**Input**: Design documents from `/specs/010-product-availability-signup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/release-signup-api.md

## Phase 1: Content and text (foundation, blocks all stories)

- [ ] T001 Add the optional `install` source to `Product` in packages/content/src/types.ts and its rule (required for available and preview, absent for in development) in packages/content/src/portfolio.ts
- [ ] T002 [P] Set `install` for AnyContext and Dev Cycle Protocol and the site of DocMapper in packages/content/src/products/ (research R9, R11)
- [ ] T003 Add `docmapper` to `SiteId` and the product site ids, and export `releaseSignupEndpoint` in packages/content/src/index.ts
- [ ] T004 [P] Availability, form and subscription page text in packages/i18n/src/availability.en.json, exported from packages/i18n/src/index.ts
- [ ] T005 Tests in packages/content/src/portfolio.test.ts, packages/content/src/index.test.ts and packages/i18n/src/index.test.ts

## Phase 2: Function (foundation for US2 and US3)

- [ ] T006 Create the `functions` workspace (package.json, tsconfig.json, vitest project) and add it to the root package.json and Vitest config
- [ ] T007 [P] Product ids in functions/src/products.ts with a test that they equal the portfolio's
- [ ] T008 [P] Request validation and email normalization in functions/src/validation.ts with tests
- [ ] T009 [P] Token creation, hashing and checking in functions/src/tokens.ts with tests
- [ ] T010 [P] Confirmation email text in functions/src/email.ts with tests
- [ ] T011 `SubscriptionStore` interface and in-memory store in functions/src/store.ts
- [ ] T012 Subscribe, confirm and unsubscribe rules and the hourly client limit in functions/src/subscriptions.ts and functions/src/limits.ts with tests (fixed clock)
- [ ] T013 Firestore store in functions/src/firestore-store.ts (transactions for subscribe and limit)
- [ ] T014 HTTP routing, CORS allow-list and logging in functions/src/http.ts with tests; `releaseSignup` export in functions/src/index.ts
- [ ] T015 firestore.rules (deny all) and firestore.indexes.json (TTL on `expiresAt` and `deleteAt`); functions and firestore in firebase.json

## Phase 3: User Story 1 - Availability on the product page (P1)

- [ ] T016 [US1] `AvailabilityPanel` in packages/ui/src/components/AvailabilityPanel.vue with test
- [ ] T017 [US1] `ProductIntro` in packages/ui/src/components/ProductIntro.vue with test; exports in packages/ui/src/index.ts
- [ ] T018 [US1] Home pages of anycontext, devcycle, gedo and aurora use `ProductIntro`; their tests updated

## Phase 4: User Story 2 - Release candidate signup (P1)

- [ ] T019 [US2] Fetch client in packages/ui/src/release-signup/client.ts with tests
- [ ] T020 [US2] `ReleaseSignupForm` in packages/ui/src/components/ReleaseSignupForm.vue with test (validation, success, rate limit, fallback, no-JavaScript note)
- [ ] T021 [US2] `SubscriptionResultPage` (confirm mode) in packages/ui/src/components/SubscriptionResultPage.vue with test
- [ ] T022 [US2] `/subscription/confirm` route on every product site
- [ ] T023 [US2] Product sites' CSP `connect-src` gains the function origin in firebase.json; hosting tests updated

## Phase 5: User Story 3 - Unsubscribe (P1)

- [ ] T024 [US3] Unsubscribe mode of `SubscriptionResultPage` with test and the `/subscription/unsubscribe` route on every product site

## Phase 6: User Story 4 - DocMapper site (P2)

- [ ] T025 [US4] sites/docmapper (copy of the product site skeleton) with tests
- [ ] T026 [US4] `docmapper` hosting target in firebase.json and .firebaserc, `docmapper.levix.digital` in domains.json; scripts' site lists and tests updated

## Phase 7: CI, deploy and setup

- [ ] T027 `changed-sites.mjs` reports `functions`; tests
- [ ] T028 `functions` job in .github/workflows/deploy.yml gated by `vars.FUNCTIONS_DEPLOY`
- [ ] T029 Function deploy roles and APIs in scripts/hosting-setup.mjs; tests

## Phase 8: Polish and documentation

- [ ] T030 ADR-0015; docs/architecture pages; TECH_SPEC; README; TECDOC index
- [ ] T031 Manual tests MT-PROD-001 and MT-PROD-002 in tests/MANUAL_TESTS.md
- [ ] T032 `npm run check`, `npm run build`, `verify:dist`, `verify:hosting`, Lighthouse; screenshots of a product page in both themes
