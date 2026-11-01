# Research: Shared Header and Footer

## R1. Where the layout lives and who owns its text

**Decision**: `@levix/ui` gets `SiteLayout` (skip link, header, main slot, footer), `CompanyHeader`, `ProductHeader`, `SiteFooter`, `MainNavigation` and `LevixMonogram`. `SiteLayout` picks `CompanyHeader` on the home and `ProductHeader` on a product site. They take every text and fact through props. The facts (company name, email, location, the four products and their addresses) go into `@levix/content`; the text shared by the five sites (navigation name, menu button, skip link, theme picker labels) goes into one English dictionary of `@levix/i18n`, `layoutStrings`. Each site's `App.vue` wraps its `RouterView` in `SiteLayout` with its site id.

**Rationale**: ADR-0001 and `docs/architecture/ui.md` say the design system owns no text or facts; keeping the shared strings once in i18n avoids five copies (the theme labels are copied five times today) and gives FEAT-029 one dictionary to translate.

**Alternatives**: strings in each site's `en.json` (five copies of the same text); a site-shared folder (sites may only import packages, ADR-0001); facts inside `@levix/ui` (breaks "ui owns no facts").

## R2. Product list ahead of the product data files

**Decision**: `@levix/content` exports `products`, a list of `{ id, name, url }` for AnyContext, Dev Cycle Protocol, Gedo and Aurora Dev Suite, and `companySite` for the home. A unit test checks that every address is `https://` plus the domain of `domains.json` for that site.

**Rationale**: the header needs names and addresses now; FEAT-014 and FEAT-015 will extend the same entries with the full product facts, so nothing is thrown away. The test keeps the links and the hosting configuration from drifting.

**Alternatives**: reading `domains.json` at runtime from the sites (it is a build file outside the packages); waiting for FEAT-014 (blocks the header).

## R3. The logo

**Decision**: the "LD" monogram of `levix-digital-logo.svg` (owner's file, 760 × 380) becomes `LevixMonogram.vue`, an inline SVG cropped to the monogram, without the light background rectangle and without the text. The groove stroke takes the `bevel` token (`#E2E8F0` light, as in the file; `#334155` dark); the opal gradients and the deboss filter keep their colors; the `style="mix-blend-mode: screen"` attribute becomes the Tailwind class `mix-blend-screen`. Gradient and filter ids are made unique with `useId()`. The name "LEVIX DIGITAL" is HTML text next to it, bold "LEVIX" in the `title` token and "DIGITAL" in the `body` token, so it turns light in the dark theme. The SVG is decorative (`aria-hidden`); the link's accessible name is the text.

**Rationale**: tried on both themes (owner saw the comparison on 2026-11-01): the monogram reads on dark; the file's text and background do not. Inline SVG means no request and no `style` attribute, so the Content Security Policy and `verify:dist` stay unchanged.

**Alternatives**: the file as an `<img>` (white plate on the dark theme, the text inside it does not change color, and a `style` attribute served as an image is blocked by `style-src`); two image files per theme (two requests, the theme switch would need JavaScript or `<picture>` with the system preference only, not the picker).

## R4. Navigation on small screens without breaking prerendering

**Decision**: below the `md` breakpoint (768 px) the links fold behind a menu button (`aria-expanded`, `aria-controls`). The prerendered HTML shows the links (no JavaScript: nothing hidden); once mounted, the component switches to the folding behavior. Escape closes the menu and returns the focus to the button; following a link closes it.

**Rationale**: works without JavaScript, avoids hydration mismatch (the first client render equals the server render, the switch happens in `onMounted`), and uses a native button.

**Alternatives**: `<details>`/`<summary>` (no Escape handling without script, and its open state is announced differently across screen readers); a CSS-only checkbox hack (not a real button).

## R5. The year in the footer

**Decision**: the shared Vite configuration defines `__BUILD_YEAR__` (the year at build time); `SiteFooter` renders it, then sets the visitor's current year (`new Date().getFullYear()`) once mounted. The UI test configuration defines it too.

**Rationale**: a site that is not rebuilt for months after New Year still shows the current year (raised by the product owner); changing it after mount keeps the first client render equal to the server render, so there is no hydration mismatch; without JavaScript the build year is shown.

**Alternatives**: the build year only (looks outdated when no merge happens for a while after New Year); `new Date()` during render (server and client can differ, a hydration mismatch); a year written by hand (forgotten every January).

## R6. Accessibility

**Decision**: a "Skip to content" link first in the page, visible on focus, to `#main`; landmarks `header` (banner), `nav` named "Main", `main` (`id="main"`, `tabindex="-1"`), `footer` (content information); `aria-current="page"` on the link of the current site; focus ring from the `focus` token; text colors from `title`, `body`, `muted` and `accent`, whose pairs FEAT-006 already checks for AA contrast on `surface` and `surface-raised`.

**Rationale**: WCAG 2.2 AA (technical specification); Lighthouse accessibility already runs in CI.

## R7. Product headers: the Levix concept, not the same design

**Decision**: a product site has its own header, `ProductHeader`: the product's name in front (display font, linked to the product's home), a smaller "by Levix Digital" link with the monogram to the company home, and the theme picker. It uses the same tokens (surfaces, text, accent, focus, fonts) as `CompanyHeader` but not its layout or navigation. The product's look (logo, accent color, menu with Features, Pricing, Download) is added by the product site items of v0.2, through props of `ProductHeader`, when those pages exist. The footer stays the same on the five sites.

**Rationale**: decided with the product owner on 2026-11-01. Large vendors give each product site its own header while keeping the parent brand discreet and the corporate footer shared: contact, company and legal facts are the company's, the same on every product.

**Alternatives**: the company header on every site (product sites look like sections of the home, raised by the product owner); a fully separate design per product now (no product pages or product logos yet; speculative).
