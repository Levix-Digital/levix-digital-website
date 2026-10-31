# Implementation Plan: Design Tokens and Themes

**Branch**: `feat/006-design-tokens-themes` | **Date**: 2026-10-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-design-tokens-themes/spec.md`

## Summary

The shared stylesheet `@levix/ui/styles.css` gets the Ceramic and Aurora tokens: theme colors written once as `light-dark(<light>, <dark>)` variables and exposed as Tailwind utilities through `@theme inline`, the fixed aurora hues and the three self-hosted typefaces in `@theme`, the ceramic shadows, an aurora gradient utility and a page base (background, text, headings, focus ring, selection) built from them. `color-scheme` on the root selects the theme: light by default, dark under a dark system preference, either one forced by `data-theme` on the root (used by FEAT-007), and Tailwind's `dark:` variant follows the same rule. A unit test checks AA contrast of every declared pair in both themes. Decisions in [research.md](research.md); token values in [contracts/tokens.md](contracts/tokens.md).

## Technical Context

**Language/Version**: CSS (Tailwind CSS 4), TypeScript for the test; Node.js 22 and 24

**Primary Dependencies**: `@fontsource-variable/inter`, `@fontsource-variable/inter-tight`, `@fontsource-variable/jetbrains-mono` 5.3.0 (SIL OFL 1.1), dependencies of `@levix/ui`

**Storage**: N/A

**Testing**: Vitest (`packages/ui/src/theme.test.ts`: contrast and token form; a build-output test that the theme rules and fonts reach a site's stylesheet); Lighthouse CI in the emulator (performance, accessibility, console); `verify:dist` (no inline styles)

**Target Platform**: the five static sites (evergreen browsers)

**Project Type**: shared design system package of the modular monolith

**Performance Goals**: Lighthouse performance stays at 0.9 or more; a page downloads only the latin font files it uses (about 45 to 50 KB each)

**Constraints**: Content Security Policy self-only with no inline styles (ADR-0010); WCAG 2.2 AA in both themes; no theme flash

**Scale/Scope**: 18 theme colors, 4 fixed hues, 2 shadows, 1 gradient, 3 typefaces

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | Tokens are part of `@levix/ui`'s public stylesheet export; sites import it and define no colors of their own |
| Simplicity first | Plain CSS in one file; no token generator; one rule (`color-scheme`) selects the theme |
| No speculative code | Only the tokens the design language defines and the pages and components of the roadmap need; no theme picker, components or hero here |
| Testability | Contrast and token form checked by a pure test over the stylesheet; theme selection checked in the built CSS |
| Accessibility | AA contrast pairs tested in both themes; visible focus ring in the base |
| Security | Fonts served from the own origin; no inline styles; the Content Security Policy is unchanged |
| Repository content in English, no references to the tools used to write it | Code, docs and messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/006-design-tokens-themes/
├── spec.md
├── plan.md
├── research.md
├── contracts/tokens.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/ui/
├── package.json                 # Fontsource dependencies (changed)
├── src/styles.css               # tokens, themes, base (changed)
├── src/theme.test.ts            # contrast pairs and token form (new)
└── src/theme-build.test.ts      # the built stylesheet carries the theme rules and fonts (new)
docs/adr/0011-theme-colors-with-light-dark-and-color-scheme.md   # (new)
docs/architecture/ui.md          # tokens, theme selection (changed)
tests/MANUAL_TESTS.md            # light and dark appearance (changed)
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-006 (Design tokens and themes, EPIC-002), release v0.1.0 "Company home".

### Tests (quality-assurance)

- `theme.test.ts`: every theme color variable has the `light-dark(#RRGGBB, #RRGGBB)` form; every pair of the contract passes its minimum in light and in dark; a failing pair names theme, pair and ratio; every color named in the pairs exists.
- `theme-build.test.ts`: building the stylesheet through Tailwind gives the utilities (`bg-surface`, `text-body`, `shadow-ceramic`, `bg-aurora`, `font-display`), the three `color-scheme` rules and the `dark:` variant on `data-theme` and the media query.
- Existing checks: `verify:dist` (no inline style), Lighthouse (performance and accessibility at 0.9 or more, no console error) on the emulator.
- Manual test: "Light and dark themes": home page of each site with the system in light and in dark; no flash, readable text, fonts loaded, browser controls in the theme.
- Acceptance: the spec's scenarios and SC-001 to SC-004.

### Documentation (architecture-docs, user-docs)

- New ADR-0011 "Theme colors with light-dark() and color-scheme".
- `docs/architecture/ui.md`: the token groups, utilities, theme selection table, how FEAT-007 forces a theme, the contrast test.
- README: no change unless it lists the design system (checked).
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change: tests, build, `verify:dist`, `verify:hosting` and Lighthouse already run in CI and the preview.
- Version impact: none; part of release v0.1.0. Merge to `main` deploys the five sites (ADR-0008).
- Observability: the contrast test prints the pair and ratio that fail.

### Security, migration and rollback

- No secrets; no change to the Content Security Policy (fonts from the own origin).
- No data or migrations.
- Rollback: revert the pull request; the sites return to Tailwind's defaults.
