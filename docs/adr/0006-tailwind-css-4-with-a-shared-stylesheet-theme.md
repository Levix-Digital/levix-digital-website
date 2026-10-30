---
id: 6
title: Tailwind CSS 4 with a shared stylesheet theme
status: accepted
date: '2026-10-30'
version: v0.1.0
subsystems: [ui]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0006: Tailwind CSS 4 with a shared stylesheet theme

## Context

The five sites share one design language (ADR-0001, ADR-0002), so the Tailwind theme (colors, typography, shadows of the Ceramic and Aurora tokens) must be defined once and used by every site. The design system page named a JavaScript `tailwind.preset.ts` for this, which is how Tailwind CSS 3 shares a configuration. The current major version, Tailwind CSS 4, is configured in CSS (`@theme`, `@source`) and ships a Vite plugin; JavaScript configuration files remain only as a compatibility path.

## Decision

Tailwind CSS 4 with the `@tailwindcss/vite` plugin, added to every site by `tooling/vite-site.ts`. The shared theme is a stylesheet in the design system package, `packages/ui/src/styles.css`, exported as `@levix/ui/styles.css`: it imports Tailwind, holds the `@theme` block with the design tokens (FEAT-006) and declares `@source "./components"` so the classes used by shared components are generated in every site. Each site's `src/styles.css` imports `@levix/ui/styles.css` and adds nothing else unless the site needs it.

## Alternatives Considered

- **Tailwind CSS 3 with a `tailwind.preset.ts` in `packages/ui`**: the older major version, configured in JavaScript, with a PostCSS setup per site.
- **Tailwind CSS 4 with a JavaScript configuration loaded through `@config`**: a compatibility path that keeps two places to read the theme from.

## Consequences

The tokens live in one CSS file that both Tailwind and plain CSS (CSS variables) read, which fits the light and dark themes. A shared component's classes only reach the sites if the component sits under `packages/ui/src/components`, or another folder added with `@source`. Verified by the build: the classes of `PageContainer` appear in every site's stylesheet.
