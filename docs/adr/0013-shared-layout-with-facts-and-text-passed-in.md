---
id: 13
title: Shared layout with facts and text passed in
status: accepted
date: '2026-11-01'
version: v0.1.0
subsystems: [ui, sites, content, i18n]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0013: Shared layout with facts and text passed in

## Context

Every page of the five sites needs a header and a footer (FEAT-008). The design system owns no text or facts (`docs/architecture/ui.md`), the sites may import only packages (ADR-0001), and the text must be translatable later (FEAT-029). The product owner wants the product sites to keep the Levix identity as a concept, not to copy the company home's header, and the footer's year to stay current even when no release happens for months after New Year.

## Decision

- `@levix/ui` owns the layout components: `SiteLayout` (skip link, header, `<main id="main">`, footer), `CompanyHeader` on the home, `ProductHeader` on product sites, both built on the same `HeaderBar` frame (menu button below the md breakpoint), `MainNavigation`, `SiteFooter` and `LevixMonogram`. They take every fact and every string through props.
- `@levix/content` holds the facts: the company's name, email and location, `companySite` and `products` (name and production address of each site, checked against `domains.json` by a test).
- `@levix/i18n` holds the English text shared by the five sites, `layoutStrings` (skip link, navigation name, menu, footer headings, theme picker labels), once instead of five copies.
- Each site's `App.vue` wraps its pages in `SiteLayout` with its site id.
- The product header puts the product first with a small "by Levix Digital" link and shares the tokens, not the layout, of the company header; each product's own look comes with the product site items. The footer is the same on the five sites.
- The footer prerenders the build year (`__BUILD_YEAR__`, defined in `tooling/vite-site.ts`) and replaces it with the visitor's current year once mounted.

## Alternatives Considered

- **The same header on every site**: product sites would read as sections of the home; refused by the product owner.
- **Strings in each site's `en.json`**: five copies of the same text to keep in step and translate.
- **The layout in each site**: five copies of the same components.
- **The build year only**: looks outdated when the sites are not rebuilt for a while after New Year. **The current year during render**: the server and the browser can disagree, a hydration mismatch.
- **The logo file as an image**: its light background and dark text do not fit the dark theme, and its `style` attribute would be blocked by the Content Security Policy; the monogram is inlined without them and the name is text in theme colors.

## Consequences

A later item adds a link (contact, legal, research) by passing it from the site's data, without changing the components; the language picker (FEAT-029) goes into the `pickers` slot of the headers. The design system stays free of text and facts, so the translation core translates `layoutStrings` like any site string. The Content Security Policy does not change: the monogram is inline SVG with no inline style.
