# Research: Design Tokens and Themes

## R1. Where the tokens live

- **Decision**: in `packages/ui/src/styles.css` (ADR-0006): theme colors as `--levix-*` variables on `:root`, exposed to Tailwind through `@theme inline` (`bg-surface`, `text-body`, `shadow-ceramic`...); values that do not change with the theme (the bright aurora hues, the typefaces) directly in `@theme`.
- **Rationale**: one file read by Tailwind and by plain CSS; `@theme inline` makes each utility read the variable, so a theme switch changes every utility with no `dark:` class in components.
- **Alternatives**: tokens in a TypeScript or JSON file generated into CSS (a build step for a few dozen values); Tailwind's default palette with `dark:` classes everywhere (every component would repeat both themes).

## R2. How the two themes are written and switched

- **Decision**: each theme color is `light-dark(<light>, <dark>)`; `color-scheme` on the root picks the side: `light` by default, `dark` under `prefers-color-scheme: dark` unless the root has `data-theme="light"`, and `dark` when the root has `data-theme="dark"`. Tailwind's `dark:` variant is redefined with `@custom-variant` to follow the same rule.
- **Rationale**: both values of a token sit on one line, so they cannot drift apart and a test can read them; one rule (`color-scheme`) switches the colors and the browser's own controls and scroll bars together; the theme is decided by the stylesheet before any script runs, so a dark system shows no light flash. The `data-theme` attribute is what the theme picker (FEAT-007) sets. Checked on 2026-10-31: Tailwind's build (Lightning CSS) turns `light-dark()` into an equivalent based on two variables set next to each `color-scheme`, so browsers without native `light-dark()` get both themes too.
- **Alternatives**: two blocks of variables (`:root` and `[data-theme=dark]`) plus a copy of the dark block inside `@media (prefers-color-scheme: dark)`: three places per value; a class toggled by a script only: a flash of light before the script runs, and no dark theme without JavaScript.

## R3. Light values

- **Decision**: the original specification's palette: surfaces `#FAFAFC` (page) and `#FFFFFF` (plates), bevel `#E2E8F0`, title `#0A0D12`, body `#475569`. Added for AA: muted `#64748B`, accent and focus `#0E7490`, readable aurora inks (`#0E7490`, `#047857`, `#7928CA`, `#C8006A`), control border `#64748B`, status colors of Aurora Dev Suite's light theme.
- **Rationale**: the bright aurora hues fail as text on white (cyan `#00F0FF` is about 1.4:1, magenta `#FF007A` about 3.9:1), so they stay decorative and each hue gets an ink that passes 4.5:1. The bevel (about 1.2:1) is decorative; a control that must be seen uses the control border (4.6:1).

## R4. Dark values

- **Decision**: Aurora Dev Suite's dark theme (`crates/aurora-ui/styles/tokens.css`): page `#0B0F19`, plates `#161F30`, bevel `#334155`, title `#F1F5F9`, body `#CBD5E1`, muted `#94A3B8`, accent and focus `#00F0FF`; inks are the bright hues where they pass (cyan, emerald) and lighter tints where they do not (purple `#C084FC`, magenta `#FF5CA8`); control border `#64748B` (3.5:1 on plates).
- **Rationale**: the vision says the design language is shared with Aurora Dev Suite; its dark values were already checked for AA there.
- **Alternatives**: invert the light palette (loses the "graphite ceramic" look and the shared language).

## R5. Contrast check

| Pair | Minimum | Where |
|---|---|---|
| title, body, muted, accent, the four inks, the four status colors on surface and surface-raised | 4.5:1 | WCAG 1.4.3 |
| on-accent on accent | 4.5:1 | text on a filled button or selection |
| focus and control border on surface and surface-raised | 3:1 | WCAG 1.4.11 |

- **Decision**: `packages/ui/src/theme.test.ts` reads `styles.css`, takes both values of every `light-dark(#RRGGBB, #RRGGBB)` theme color, computes the WCAG ratio of each declared pair in each theme and fails naming the theme, pair and ratio. It also fails when a theme color is not in that form, so a new color cannot skip the check.
- **Rationale**: the same approach as Aurora Dev Suite's `theme_contrast.rs`; Lighthouse only checks the colors a page uses today.

## R6. Typefaces

- **Decision**: Inter Tight (display), Inter (body) and JetBrains Mono (telemetry, badges, code), as variable fonts from the Fontsource packages (`@fontsource-variable/*` 5.3.0, SIL Open Font License 1.1), imported by the shared stylesheet so Vite bundles the files under each site's `/assets/`.
- **Rationale**: the Content Security Policy allows fonts only from the site's origin (ADR-0010), so a font service is out; the packages give `font-display: swap` and one file per script with `unicode-range`, so a page downloads only the latin files it uses (about 45 to 50 KB each; checked on the 2026-10-31 build). Vite inlines assets under 4 KB as data URLs, which `font-src 'self'` blocks (seen as a Lighthouse console error on the first build): `tooling/vite-site.ts` keeps fonts as files, and `verify:dist` fails on a font inlined in a stylesheet. Inter Tight is the original specification's alternative to Geist Sans and matches the Inter body text.
- **Alternatives**: Geist Sans (the specification's first option; a second design family next to Inter); system fonts only (no download, but not the design language).

## R7. Shadows

- **Decision**: the specification's two shadows (`shadow-ceramic` at rest, `shadow-ceramic-active` on hover or highlight) with their colors as theme variables: the same values in light, a deeper depth and a slightly brighter glow in dark, where a 3% black shadow would not show.
