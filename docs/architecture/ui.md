---
title: Design System
summary: Ceramic and Aurora tokens, light and dark themes, shared layout, components and the 3D hero.
code: [packages/ui]
---

# Design System

Ceramic and Aurora tokens, light and dark themes, shared layout, components and the 3D hero.

## Responsibilities

Owns the Ceramic and Aurora design language: tokens (colors, typography, shadows), the light and dark themes, the shared layout (header, footer, availability banner, consent banner, language and theme pickers), components (ceramic cards, buttons, plan tables, download panels) and the 3D hero. Does not own text or facts.

## Structure

`packages/ui/src/styles.css` (Tailwind, the design tokens, the theme selection and the page base, exported as `@levix/ui/styles.css` and imported by every site), `components/` (the layout components, the theme picker), `layout/` (the props types of the layout and the build year), `hero/` (Three.js scene, aurora shader, static fallback). Public entry point `packages/ui/src/index.ts`.

## Design Tokens

Every token is a Tailwind utility and a CSS variable; sites define no colors, shadows or typefaces of their own.

| Group | Tokens (utility names) | Use |
|---|---|---|
| Surfaces | `surface`, `surface-raised` | Page backdrop; ceramic plates, cards, header |
| Lines | `bevel`, `control` | Decorative bevels and dividers; borders of controls that must be seen (3:1) |
| Text | `title`, `body`, `muted` | Headings; paragraphs; secondary text |
| Interaction | `accent`, `on-accent`, `focus` | Links and filled buttons; text on an accent fill; keyboard focus ring |
| Aurora inks | `ink-cyan`, `ink-emerald`, `ink-purple`, `ink-magenta` | Text in an aurora hue (readable in each theme) |
| Status | `success`, `warning`, `error`, `info` | Status text and marks |
| Aurora hues | `aurora-cyan`, `aurora-emerald`, `aurora-purple`, `aurora-magenta`, `bg-aurora` (gradient) | Seams, glows and the hero; never body text |
| Shadows | `shadow-ceramic`, `shadow-ceramic-active` | Plates at rest; hover or highlight |
| Typefaces | `font-display` (Inter Tight), `font-sans` (Inter, the page default), `font-mono` (JetBrains Mono) | Headings; body text; telemetry, badges and code |

The values are in `styles.css`. Theme colors are written as `--levix-<name>: light-dark(<light>, <dark>);` and exposed as `--color-<name>` ([ADR-0011](../adr/0011-theme-colors-with-light-dark-and-color-scheme.md)). Light values come from the original specification; dark values from Aurora Dev Suite's dark theme. The typefaces are variable fonts from the Fontsource packages (SIL Open Font License), bundled into each site's `/assets/` as files (the shared Vite configuration never inlines fonts, which the Content Security Policy would block, and `verify:dist` fails on a font inlined in a stylesheet); a page downloads only the files of the scripts it shows.

The page base styles the root background (`surface`), text (`body`, `font-sans`), headings (`title`, `font-display`), selection and the focus ring from the tokens.

## Themes

| Root element | System preference | Theme |
|---|---|---|
| no `data-theme` | light or none | light |
| no `data-theme` | dark | dark |
| `data-theme="light"` | any | light |
| `data-theme="dark"` | any | dark |

`color-scheme` on the root picks the side of each `light-dark()` value and the theme of the browser's own controls; Tailwind's `dark:` variant follows the same table. The theme is decided by the stylesheet, so it is right on the first paint with no script.

**Theme picker.** `ThemePicker` (props: `labels` with `legend`, `system`, `light`, `dark`, given by the site) shows System, Light and Dark as native radio buttons in a segmented control, so Tab and the arrow keys work and screen readers announce the group and the selected option. `useThemePreference()` returns the current choice and `setPreference()`, which sets or removes `data-theme` on the root and stores the choice in the site's `localStorage` under `levix-theme` (`light` or `dark`; System removes the key; an unknown value or a storage error means System, and a choice that cannot be stored still applies to the page). The choice is read after mount, so the hydrated markup matches the prerendered one, and a `storage` event keeps other tabs of the site in step. Each site is its own origin, so the choice is per site.

**Before the first paint.** `src/theme/theme-init.js` (exported as `@levix/ui/theme-init.js`) is put inline at the top of every page's head by `tooling/vite-site.ts`; it applies a stored choice before the body is painted. The Content Security Policy allows it by its hash ([ADR-0012](../adr/0012-stored-theme-applied-by-a-hashed-inline-script.md)): any change to the file needs the new hash in `firebase.json` (the security headers test says so).

`src/theme.test.ts` checks that every theme color has both values and that each declared pair passes WCAG 2.2 AA in both themes: text tokens on both surfaces and `on-accent` on `accent` at 4.5:1, `focus` and `control` on both surfaces at 3:1. `src/theme-build.test.ts` builds the stylesheet with Tailwind and checks the utilities, the theme rules and the `dark:` variant.

## Layout

`SiteLayout` frames every page: a "Skip to content" link (first in the tab order, visible on focus), the header, the page in `<main id="main" tabindex="-1">` and `SiteFooter`. Its props are the current `site` id, `company` (name, email, location), `companySite` and `products` (name and address of each site) and `strings` (the shared layout text); the site passes them from `@levix/content` and `@levix/i18n` ([ADR-0013](../adr/0013-shared-layout-with-facts-and-text-passed-in.md)).

- **Headers.** On the home (`site` is not a product), `CompanyHeader`: the monogram and "LEVIX DIGITAL" linked to the home, `MainNavigation` (a `<nav>` named by `layout.nav` with the product links) and the theme picker. On a product site, `ProductHeader`: the product's name linked to `/`, a small "by Levix Digital" link with the monogram to the company home, and the theme picker; it shares the tokens, not the layout, of the company header, and each product's own look (logo, accent, menu) is added to it by the product site items. Both headers sit on `HeaderBar` and have a `pickers` slot next to the theme picker for the language picker.
- **Small screens.** Below the `md` breakpoint (768 px) `HeaderBar` folds the navigation and the pickers behind a menu button (`aria-expanded`, `aria-controls`); Escape closes it and returns the focus to the button, and following a link closes it. The prerendered page shows them unfolded and the button appears once mounted, so the page works without JavaScript and the hydrated markup matches the prerendered one.
- **Footer.** `SiteFooter`, the same on the five sites: contact (email as a `mailto:` link, city, province, country), the product links with `aria-current="page"` on the current site, and "© <year> <company>". The year is the build year in the prerendered page (`__BUILD_YEAR__`, defined by `tooling/vite-site.ts`; `src/layout/build-year.ts`) and the visitor's current year once mounted.
- **Monogram.** `LevixMonogram` is the "LD" symbol of the company logo file (`levix-digital-logo.svg`) as inline SVG, without the file's light background and text: the groove follows the `bevel` token, the opal metal keeps its colors, the sheen uses the `mix-blend-screen` class instead of an inline style, and each instance gets its own gradient and filter ids. It is decorative (`aria-hidden`); the link around it carries the name.
- **Adding a link.** Contact, legal and research links are passed from the site's data by the items that create those pages; the components do not change.

## Behavior

Light is the default theme; dark follows the system preference (see Themes). A visitor's choice in the theme picker overrides the system preference on that site (see Themes). The hero loads Three.js after the first paint, only with WebGL and without a reduced-motion preference; otherwise it shows a static image. It pauses when off screen.

## Interfaces

Components receive text through props or the i18n `t()` function; they never import product content directly.

## Decisions

- [ADR-0002](../adr/0002-vue-3-with-vite-static-prerendering.md): Vue 3, Tailwind and Three.js.
- [ADR-0006](../adr/0006-tailwind-css-4-with-a-shared-stylesheet-theme.md): Tailwind CSS 4 with a shared stylesheet theme.
- [ADR-0011](../adr/0011-theme-colors-with-light-dark-and-color-scheme.md): Theme colors with light-dark and color-scheme.
- [ADR-0012](../adr/0012-stored-theme-applied-by-a-hashed-inline-script.md): Stored theme applied by a hashed inline script.
- [ADR-0013](../adr/0013-shared-layout-with-facts-and-text-passed-in.md): Shared layout with facts and text passed in.
