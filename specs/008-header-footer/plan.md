# Implementation Plan: Shared Header and Footer

**Branch**: `feat/008-header-footer` | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-header-footer/spec.md`

## Summary

`@levix/ui` gets a shared layout: `SiteLayout` (skip link, header, main content, footer), `CompanyHeader` on the home (the company's "LD" monogram and name linked to the home, the navigation and the theme picker), `ProductHeader` on product sites (the product's name in front, a smaller "by Levix Digital" link, the theme picker; same tokens, its own layout, ready for each product's look in v0.2), `MainNavigation` (the four product links, folding behind a menu button below 768 px), `SiteFooter` (the same on the five sites: copyright with the current year, contact@levix.digital, Calgary, Alberta, Canada, the product links) and `LevixMonogram` (the monogram of the owner's logo file as an inline SVG that fits both themes). Facts come from `@levix/content` (company location, the four products and their production addresses, checked against `domains.json`), shared English text from `@levix/i18n` (`layoutStrings`). Each site's `App.vue` wraps its pages in `SiteLayout`; the theme picker leaves the home pages. The Content Security Policy does not change. Decisions in [research.md](research.md); interface in [contracts/layout.md](contracts/layout.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3; Node.js 22 and 24

**Primary Dependencies**: none new

**Storage**: none

**Testing**: Vitest with jsdom and the server renderer (components, content, strings); site page tests; `verify:dist`, `verify:hosting` and Lighthouse in the emulator

**Target Platform**: the five static sites (evergreen browsers)

**Project Type**: shared design system, content and i18n packages of the modular monolith, plus the five sites

**Performance Goals**: no extra request (inline SVG, no image file); Lighthouse performance stays at 0.9 or more

**Constraints**: Content Security Policy without `'unsafe-inline'` (ADR-0010): no `style` attributes or inline handlers; WCAG 2.2 AA; no hydration mismatch; works without JavaScript

**Scale/Scope**: seven components, two data exports, one dictionary, five sites

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | Components, facts and strings are exports of `@levix/ui`, `@levix/content` and `@levix/i18n`; the sites use only those entry points |
| One responsibility per unit | Layout frame, company header, product header, navigation, footer and monogram are separate components; facts and text stay outside the design system |
| Simplicity first | Plain props, no state library, no router links for cross-domain addresses; a menu button with one boolean |
| No speculative code | Only links to pages that exist; the language picker is a named slot, not a placeholder control |
| Testability | Components tested on the server render and in jsdom; the product addresses tested against `domains.json` |
| Accessibility | Skip link, landmarks, `aria-current`, `aria-expanded`, visible focus, token colors already checked for AA |
| Security | No inline style or script; the policy and its hash are unchanged |
| Repository content in English, no references to the tools used to write it | Code, docs and messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/008-header-footer/
├── spec.md
├── plan.md
├── research.md
├── contracts/layout.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/content/src/index.ts             # company location, SiteLink, companySite, products (changed)
packages/content/src/index.test.ts        # addresses match domains.json (changed)
packages/i18n/src/index.ts                # layoutStrings export (changed)
packages/i18n/src/layout.en.json          # shared English layout text (new)
packages/i18n/src/index.test.ts           # (changed)
packages/ui/src/layout/types.ts           # props types of the layout (new)
packages/ui/src/layout/build-year.ts      # __BUILD_YEAR__ with a fallback (new)
packages/ui/src/layout/fixtures.ts        # test facts and text (new)
packages/ui/src/components/LevixMonogram.vue      # (new) + test
packages/ui/src/components/HeaderBar.vue          # frame and menu button of both headers (new) + test
packages/ui/src/components/MainNavigation.vue     # (new) + test
packages/ui/src/components/CompanyHeader.vue      # (new) + test
packages/ui/src/components/ProductHeader.vue      # (new) + test
packages/ui/src/components/SiteFooter.vue         # (new) + test
packages/ui/src/components/SiteLayout.vue         # (new) + test
packages/ui/src/index.ts                  # exports (changed)
tooling/vite-site.ts                      # defines __BUILD_YEAR__ (changed)
sites/*/src/App.vue                       # SiteLayout around the pages (changed)
sites/*/src/pages/HomePage.vue            # <main> and the picker removed (changed)
sites/*/src/pages/HomePage.test.ts        # (changed)
sites/*/src/locales/en.json               # theme labels removed (changed)
sites/*/src/App.test.ts                   # header and footer on the prerender (new)
docs/architecture/ui.md, sites.md, content.md, i18n.md   # (changed)
docs/adr/0013-shared-layout-with-facts-and-text-passed-in.md   # (new)
tests/MANUAL_TESTS.md                     # MT-UI-003 header and footer (new), MT-UI-002 picker location (changed)
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-008 (Shared header and footer, EPIC-002), release v0.1.0 "Company home".

### Tests (quality-assurance)

- `content/index.test.ts`: four products in order with their names; every `url` is `https://` plus that site's domain in `domains.json`; the company location is Calgary, Alberta, Canada.
- `i18n/index.test.ts`: `layoutStrings` has every key of the contract, none empty.
- `LevixMonogram.test.ts`: decorative (`aria-hidden`), no `style` attribute, no background rectangle, unique gradient ids for two instances.
- `MainNavigation.test.ts`: four links with the given names and addresses; `aria-current="page"` only on the current site; server render shows the links and no collapsed state; after mount the button toggles `aria-expanded` and the list; Escape closes and focuses the button; a click on a link closes.
- `CompanyHeader.test.ts`: the logo link to `https://levix.digital` named "Levix Digital", the navigation, the theme picker; the `pickers` slot renders its content.
- `ProductHeader.test.ts`: the product's name linked to `/`, the "by Levix Digital" link to `https://levix.digital`, the theme picker, no company navigation.
- `SiteFooter.test.ts`: the server render shows "© <build year> Levix Digital Inc."; once mounted it shows the current year (faked clock in a later year); `aria-current` on the current site's link; `mailto:contact@levix.digital`, "Calgary, Alberta, Canada", four product links.
- `SiteLayout.test.ts`: the skip link is the first focusable element and targets `#main`; landmarks banner, navigation "Main", main, contentinfo; no `style` attribute in the server render.
- Site tests (`App.test.ts` per site): the server render of the app carries the right header (company on the home, product elsewhere) and the footer with that site marked; the home page body no longer carries the picker.
- `verify:dist`, `verify:hosting`, Lighthouse (performance and accessibility at 0.9 or more, no console error) unchanged and green.
- Manual test MT-UI-003 "Header and footer on every site": five sites, both themes, 375 px and 1280 px, keyboard only, screen reader landmarks, links to each product. MT-UI-002 updated: the picker is in the header.
- Acceptance: the spec's scenarios and SC-001 to SC-004.

### Documentation (architecture-docs, user-docs)

- New ADR-0013 "Shared layout with facts and text passed in" (layout in ui, facts in content, shared text in i18n).
- `docs/architecture/ui.md` (layout components, monogram, how to add a link), `sites.md` (App wraps pages in the layout), `content.md` (company and product links), `i18n.md` (shared layout dictionary).
- README: no change unless it lists the design system (checked).
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change: tests, build, `verify:dist`, `verify:hosting` and Lighthouse already run in CI and the preview.
- Version impact: none; part of release v0.1.0. Merge to `main` deploys the five sites (ADR-0008).
- Observability: a blocked style or script shows as a console error, which Lighthouse fails on; `verify:dist` names the page with inline code.

### Security, migration and rollback

- No secrets, no data, no policy change.
- Rollback: revert the pull request; the sites go back to the home page with the picker in the body.

## Execution steps and milestones

1. Facts and text: content and i18n exports with tests.
2. Components: monogram, navigation, company header, product header, footer, layout with tests.
3. Sites: App wraps pages, picker moved, site tests, footer year.
4. Checks and docs: verify:dist, hosting and Lighthouse, ADR, architecture pages, manual tests.
