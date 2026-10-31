---
id: 11
title: Theme colors with light-dark and color-scheme
status: accepted
date: '2026-10-31'
version: v0.1.0
subsystems: [ui]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0011: Theme colors with light-dark and color-scheme

## Context

The five sites need a complete light theme (the default) and dark theme of the Ceramic and Aurora tokens (FEAT-006). The dark theme follows the visitor's system preference until the visitor chooses a theme with the picker (FEAT-007). The theme must be right on the first paint: the pages are prerendered and the Content Security Policy blocks inline scripts (ADR-0010), so a script that sets the theme before paint needs its own hash in the policy. Every theme color also has to pass WCAG 2.2 AA in both themes.

## Decision

Each theme color is one variable in `packages/ui/src/styles.css`, written as `--levix-<name>: light-dark(<light>, <dark>);`, and exposed to Tailwind through `@theme inline` (`--color-<name>: var(--levix-<name>)`), so a utility such as `bg-surface` changes with the theme and components need no `dark:` classes. The `color-scheme` property of the root element selects the side of every `light-dark()` value and the browser's own controls: `light` by default, `dark` under `@media (prefers-color-scheme: dark)` unless the root has `data-theme="light"`, and `dark` when the root has `data-theme="dark"`. Tailwind's `dark:` variant is redefined with `@custom-variant` to follow the same rule. The theme picker only sets or removes `data-theme` on the root. Values that do not change with the theme (the bright aurora hues, the typefaces) are plain `@theme` tokens. `src/theme.test.ts` reads the `light-dark()` pairs and checks the contrast of each declared pair in both themes.

## Alternatives Considered

- **A variable block per theme** (`:root`, `[data-theme="dark"]` and a copy of the dark block inside the media query): three places to edit per value, which drift apart.
- **A class set by a script only** (Tailwind's class strategy): a flash of the light theme before the script runs, and no dark theme without JavaScript.
- **`dark:` classes on every component over Tailwind's default palette**: each component repeats both themes and the design tokens are lost.

## Consequences

Both values of a color sit on one line, readable by the contrast test, and the theme is set by the stylesheet before any script, so a dark system shows no light flash. Tailwind's build (Lightning CSS) rewrites `light-dark()` into two variables set next to each `color-scheme` declaration, so browsers without native `light-dark()` also get both themes (checked in the 2026-10-31 build). `light-dark()` holds colors only: shadows take their colors from theme variables instead. A visitor's stored choice still needs a small script before paint to set `data-theme`; FEAT-007 adds it with its hash in the Content Security Policy.
