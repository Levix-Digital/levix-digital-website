# Implementation Plan: Product Availability and Release Candidate Signup

**Branch**: `feat/010-product-availability-signup` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-product-availability-signup/spec.md`

## Summary

Each product site replaces its "under construction" notice with the product's name, statement and an availability panel built from the product data: an enabled download action for available and preview products, and for products in development a disabled download button with the release candidate signup form right below it. The form posts to a new HTTPS function, `releaseSignup` (Montreal), which validates, rate-limits, stores a pending subscription in Firestore and queues a confirmation email for the Trigger Email extension; confirmation and unsubscribe links open two shared pages of the product site, which post the token back. DocMapper gets its site, so every home card links. Decisions in [research.md](research.md); data in [data-model.md](data-model.md); the function's interface in [contracts/release-signup-api.md](contracts/release-signup-api.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3; Node.js 22 (functions runtime `nodejs22`)

**Primary Dependencies**: new in `functions/`: `firebase-functions` 7, `firebase-admin` 14 (pinned); none new in the sites

**Storage**: Cloud Firestore `(default)` in `northamerica-northeast1`: `releaseSubscriptions`, `releaseSignupLimits`, `mail`

**Testing**: Vitest (jsdom and server render for components and pages; Node for the function's logic and handlers with an in-memory store); `verify:dist`, `verify:hosting`, Lighthouse

**Target Platform**: static product sites on Firebase Hosting; one Cloud Function (2nd generation)

**Project Type**: modular monolith: content, i18n and ui packages, six sites, the new functions module

**Performance Goals**: the panel is in the prerendered HTML (no request to show availability); the function answers in under 1 s; Lighthouse 0.9 or more

**Constraints**: CSP without `'unsafe-inline'` (ADR-0010), extended only with the function's origin on product sites; WCAG 2.2 AA; data in Canada; CASL (research R3); no secrets in Git

**Scale/Scope**: six sites, four new shared components, one function with four routes, tens of signups a week

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | Facts (`install`, endpoint) in `@levix/content`, text in `@levix/i18n`, components in `@levix/ui`, sites import only entry points; `functions/` is a separate module with no import from the others |
| One responsibility per unit | Function split into `validation`, `tokens`, `limits`, `email`, `subscriptions` (rules), `store` (Firestore adapter) and `http` (routing, CORS); UI split into panel, form, and the two subscription pages |
| Simplicity first | One function with four routes; TTL instead of a scheduled cleanup; no App Check yet (ADR-0015); one store interface only because it isolates Firestore and gives the test seam |
| Explicit errors | Each route maps failures to the statuses of the contract; storage errors are logged with the route and answered `500`; the form shows a fallback with the contact address |
| Testability | Rules tested with an in-memory store and a fixed clock; components tested on the server render and in jsdom with a fake fetch |
| Facts only (ADR-0005) | Installation sources taken from the products' READMEs (research R9) |
| Security | Firestore denies clients; tokens hashed; origin allow-list; honeypot and limits; CSP widened by one origin on product sites only |
| Repository content in English, authored by the repository identity | Yes |

Re-check after design: passes. One deviation from the Technical Specification (App Check on every function) is recorded in ADR-0015 with the reason.

## Project Structure

### Documentation (this feature)

```text
specs/010-product-availability-signup/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/release-signup-api.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/content/src/types.ts, portfolio.ts, products/*.ts   # install source, DocMapper site, validation (changed)
packages/content/src/index.ts                                # SiteId with docmapper, releaseSignupEndpoint (changed)
packages/i18n/src/availability.en.json, index.ts             # panel, form and subscription page text (new, changed)
packages/ui/src/components/AvailabilityPanel.vue             # status, download action or disabled button (new)
packages/ui/src/components/ReleaseSignupForm.vue             # form, consent, states (new)
packages/ui/src/components/SubscriptionResultPage.vue        # confirm and unsubscribe pages (new)
packages/ui/src/components/ProductIntro.vue                  # name, statement, panel (new)
packages/ui/src/release-signup/client.ts                     # fetch adapter for the three routes (new)
sites/{anycontext,devcycle,gedo,aurora}/src/...              # home page with ProductIntro, two subscription routes (changed)
sites/docmapper/                                             # new site
functions/package.json, tsconfig.json, .env.levix-digital    # new module (address added by the owner)
functions/src/{index,http,subscriptions,validation,tokens,limits,email,store,firestore-store,products,consent,sender,announcements,release-watch,cli-support,announce-cli,watch-cli}.ts + tests
firestore.rules, firestore.indexes.json                      # deny all; TTL policies (new)
firebase.json, .firebaserc, domains.json                     # docmapper target, functions and firestore, CSP connect-src (changed)
package.json                                                 # functions workspace (changed)
scripts/hosting-setup.mjs, scripts/changed-sites.mjs         # roles and APIs; functions change detection (changed)
.github/workflows/deploy.yml                                  # functions job (changed)
.github/workflows/announce-release-candidates.yml           # hourly announcements (new)
docs/adr/0015-release-signup-with-double-opt-in-before-app-check.md  # (new)
docs/architecture/{content,ui,sites,functions,hosting,ci,i18n}.md   # (changed)
docs/product/TECH_SPEC.md                                    # personal data and functions list (changed)
tests/MANUAL_TESTS.md, README.md                             # (changed)
```

**Structure Decision**: the existing workspaces plus `functions/` and `sites/docmapper`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `SubscriptionStore` interface with two implementations | Isolates Firestore and lets the rules run in tests without an emulator | Calling Firestore from the rules would need the emulator (Java) in every test run |

## Dev Cycle Protocol

### Backlog items and release

FEAT-037 (availability and release candidate signup), FEAT-038 (`releaseSignup` function and the release candidate announcements, added with the owner on 2026-11-13), FEAT-013 (download panel: the panel, without per-platform buttons, which come with each product's download page) and FEAT-036 (DocMapper site, minimal: name, statement, panel). Moved into release v0.1.0 "Company home" at the owner's request. FEAT-010 (availability banner) closed as superseded by FEAT-037.

### Tests (quality-assurance)

- `content`: `install` required for available and preview, refused for in development; every product has a site matching `domains.json`; `products` now lists five links.
- `functions`: validation (email forms, unknown product, missing consent, honeypot); tokens (round trip, wrong secret, malformed); rules with the in-memory store and a fixed clock (new signup, repeat within 24 h sends nothing, repeat after 24 h refreshes tokens, confirmed stays confirmed with no email, confirm before and after 7 days, unsubscribe deletes, unsubscribe twice); limits (10th and 11th request in an hour); email text (product, both links, sender block with the address, `List-Unsubscribe`); HTTP (CORS allow-list, preflight, contract statuses); product ids equal the portfolio's.
- `ui`: panel renders the enabled action or the disabled button by status, the form only for in development; form validation messages next to fields, success, rate-limited and fallback states with a fake client; subscription pages for each result; no `style` attributes; disabled button has `disabled` and `aria-describedby` to the note.
- Sites: each product home renders its intro; the subscription routes prerender; `verify:dist` and `verify:hosting` cover six sites; Lighthouse on product sites.
- Manual test MT-PROD-001 "Release candidate signup end to end" (quickstart, production part) and MT-PROD-002 "Product page availability" (five sites, both themes, 375 and 1280 px, keyboard and screen reader on the disabled button and form).

### Documentation (architecture-docs, user-docs)

- New ADR-0015 "Release candidate signup with double opt-in, before App Check".
- `docs/architecture/functions.md` (the function, collections, TTL, email), `content.md` (`install`, endpoint), `ui.md` (four components, client), `i18n.md` (availability strings), `sites.md` (six sites, product home and subscription routes), `hosting.md` (DocMapper, product CSP), `ci.md` (functions job, `FUNCTIONS_DEPLOY`).
- `TECH_SPEC.md`: personal data now includes release candidate subscriptions (kept until unsubscribe; pending ones 7 days); the function list.
- README: functions commands and the one-time backend setup.
- Rebuild the TECDOC index; `check_docs`, `check_readme`, `manual_tests validate`.

### CI, release and observability (devops-release)

- `ci.yml`: build and test `functions` (part of `npm run check` through the workspace).
- `deploy.yml`: new `functions` job, after `ci`, when the plan reports function changes and `vars.FUNCTIONS_DEPLOY == 'true'`: `firebase deploy --only functions,firestore`. Independent of the hosting job.
- `changed-sites.mjs`: a change in `packages/content` or `packages/ui` already rebuilds every site; it also reports `functions` when `functions/` or the Firestore files changed.
- Version impact: part of v0.1.0, no version files.
- Observability: the function logs one structured line per request (route, result, product; never the address or token) and errors with their cause; the `mail` documents carry the extension's delivery state.

### Security, migration and rollback

- No secret in Git: the SMTP password lives in the extension's Secret Manager entry; the mailing address is public information in `functions/.env.levix-digital`.
- New personal data (email addresses) in Canada, client access denied, deleted on unsubscribe or after 7 days unconfirmed.
- No migration: new collections only.
- Rollback: revert the pull request; the sites go back to their notices. The deployed function stays until `firebase functions:delete releaseSignup`; stored subscriptions stay valid.

## Execution steps and milestones

1. Content and text: `install`, DocMapper site, endpoint, availability strings.
2. Function: module, rules, store, HTTP, Firestore rules and TTL.
3. Components and pages: panel, form, client, subscription pages, product intro.
4. Sites: four product sites updated, DocMapper site, hosting and CSP.
5. CI, deploy and setup script.
6. Release candidate announcements (added with the owner on 2026-11-13).
7. Docs, ADR, manual tests, checks.
