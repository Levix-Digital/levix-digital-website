# Implementation Plan: Company Home Page

**Branch**: `feat/009-company-home` | **Date**: 2026-11-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-company-home/spec.md`

## Summary

The home page of `levix.digital` replaces its "under construction" notice with five sections: a sober hero (no 3D), the product portfolio in two lines, about, research and contact. `@levix/content` gains the portfolio: one typed data file per product under `src/products/` (name, line, one-line statement, availability status, optional site address), the two product lines and a build-time validation; `products` (the products with a site, read by the header and footer) is derived from it, so the layout does not change. `@levix/ui` gains four small components (`CeramicCard`, `SectionHeading`, `StatusBadge`, `ActionLink`). The home's English strings live in `sites/home/src/locales/en.json`; product statements stay in the data files. Decisions in [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3; Node.js 22 and 24

**Primary Dependencies**: none new

**Storage**: none

**Testing**: Vitest with jsdom and the server renderer; `verify:dist`, `verify:hosting` and Lighthouse in the emulator

**Target Platform**: the static home site (evergreen browsers)

**Project Type**: content and design system packages of the modular monolith, plus the home site

**Performance Goals**: no new request, no script beyond the existing ones; Lighthouse 0.9 or more in all four categories

**Constraints**: Content Security Policy without `'unsafe-inline'` (ADR-0010): no `style` attributes; WCAG 2.2 AA in both themes; full content in the prerendered HTML

**Scale/Scope**: five product data files, four components, one page with five sections

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | Facts in `@levix/content`, components in `@levix/ui`, page text in the home site; the site uses only package entry points |
| One responsibility per unit | One data file per product; validation separate from data; each component one visual job |
| Simplicity first | Four components only; no data fetching; the release reader of FEAT-016 is not built |
| Facts only (ADR-0005) | Statuses and statements come from the data files, each checked against its repository (research R3, R5) |
| Testability | Validation is a pure function tested with invalid entries; components tested on the server render and in jsdom |
| Accessibility | Landmarked sections with headings, status as text (not color only), visible focus, decorative seam hidden |
| Security | No inline style or script; policy unchanged |
| Repository content in English, no references to the tools used to write it | Code, docs and messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/009-company-home/
├── spec.md
├── plan.md
├── research.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/content/src/types.ts                 # Product, ProductLine, AvailabilityStatus (new)
packages/content/src/products/*.ts            # docmapper, anycontext, devcycle, gedo, aurora (new)
packages/content/src/portfolio.ts             # lines, portfolio in order, validatePortfolio (new)
packages/content/src/portfolio.test.ts        # (new)
packages/content/src/index.ts                 # exports portfolio, lines; products derived (changed)
packages/content/src/index.test.ts            # (changed)
packages/ui/src/components/CeramicCard.vue    # (new) + test
packages/ui/src/components/SectionHeading.vue # (new) + test
packages/ui/src/components/StatusBadge.vue    # (new) + test
packages/ui/src/components/ActionLink.vue     # (new) + test
packages/ui/src/index.ts                      # exports (changed)
sites/home/src/pages/HomePage.vue             # five sections (changed)
sites/home/src/pages/home/*.vue               # HeroSection, PortfolioSection, AboutSection, ResearchSection, ContactSection (new)
sites/home/src/pages/HomePage.test.ts         # (changed)
sites/home/src/locales/en.json                # page text, title, description (changed)
docs/architecture/content.md, ui.md, sites.md # (changed)
docs/adr/0014-portfolio-with-three-availability-statuses.md   # (new)
docs/BACKLOG.md, docs/ROADMAP.md              # FEAT-011 dropped from v0.1.0, DocMapper site item added (changed)
tests/MANUAL_TESTS.md                         # MT-HOME-001 home page review (new)
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-017 (Home page, EPIC-004) in full; the part of FEAT-009 (Ceramic components), FEAT-014 (Product data schema) and FEAT-015 (Product data files) the home needs. Release v0.1.0 "Company home". Proposed backlog changes, applied with the plan: FEAT-011 (3D hero) removed from v0.1.0 and closed as replaced by the sober hero; a new item "DocMapper site" in v0.2.0.

### Tests (quality-assurance)

- `portfolio.test.ts`: five products in the agreed order and lines; every status is one of the three; `validatePortfolio` rejects an empty statement, an unknown status, an unknown line and a duplicate id, with a message naming the product; every site address matches `domains.json`; DocMapper has no site.
- `index.test.ts`: `products` equals the portfolio entries with a site, in order (the header and footer keep the same four links).
- `CeramicCard.test.ts`, `SectionHeading.test.ts`, `StatusBadge.test.ts`, `ActionLink.test.ts`: render on the server without `style` attributes; heading level from props; the badge shows its label as text; a card with a link is one link with an accessible name; a card without a link has no anchor.
- `HomePage.test.ts`: sections in order with their headings; one `h1`; the hero has two actions targeting `#products` and `#contact`; five cards with their statuses; DocMapper's card is not a link; the contact section has the mail link and no form; the research section has no link; the page sets title and description.
- `verify:dist`, `verify:hosting` and Lighthouse (all four categories at 0.9 or more, no console error) green.
- Manual test MT-HOME-001 "The home page reads right": both themes, 320, 375, 1280 and 1920 px, keyboard only, screen reader headings, every link, and the five-second review of SC-001.

### Documentation (architecture-docs, user-docs)

- New ADR-0014 "Portfolio with three availability statuses" (amends ADR-0005: `available`, `preview`, `in-development`; products without a site).
- `docs/architecture/content.md` (portfolio, lines, statuses, derived `products`), `ui.md` (the four components), `sites.md` (the home's sections).
- README: checked; no change expected.
- Rebuild the TECDOC index, run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change. Version impact: none; part of release v0.1.0. Merge to `main` deploys the changed sites (ADR-0008).
- Observability: an invalid data file fails the build with the product named.

### Security, migration and rollback

- No secrets, no data migration, no policy change.
- Rollback: revert the pull request; the home goes back to the notice.

## Execution steps and milestones

1. Product data: types, five data files, portfolio and validation, derived `products`.
2. Components: card, section heading, badge, action link.
3. Home page: five sections and strings (US1 to US4).
4. Checks and docs: verify:dist, hosting and Lighthouse, ADR, architecture pages, backlog, manual test.
