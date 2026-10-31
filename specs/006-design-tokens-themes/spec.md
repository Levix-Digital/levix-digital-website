# Feature Specification: Design Tokens and Themes

**Feature Branch**: `feat/006-design-tokens-themes`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Backlog item FEAT-006: "Ceramic and Aurora tokens as CSS variables with complete light and dark themes, in the shared Tailwind theme of `@levix/ui` (ADR-0006)." The vision asks for "ceramic white surfaces, aurora light seams" with light as the default theme and a complete dark theme that follows the visitor's system preference or choice; the technical specification asks for WCAG 2.2 level AA on every page in both themes.

## User Scenarios & Testing *(mandatory)*

The users of this feature are the visitors of the five sites, who see one consistent, readable design in light or dark, and the people who build the pages and components, who style them from one named set of design values instead of loose colors.

### User Story 1 - Every site shares the Ceramic and Aurora look (Priority: P1)

A visitor opens any of the five sites and sees the same ceramic surfaces, text colors, typefaces and aurora accents, because every site takes them from one shared set of design tokens.

**Why this priority**: it is the goal of the item and the base of every later visual item (header and footer, components, hero).

**Independent Test**: build the five sites; each one's stylesheet carries the same token values and the page background, text color and typefaces come from the tokens.

**Acceptance Scenarios**:

1. **Given** the five sites built, **When** a home page is opened, **Then** its background, text and headings use the ceramic surface, body text and title colors and the shared typefaces.
2. **Given** a token value changed in the shared stylesheet, **When** the sites are built again, **Then** all five sites show the new value with no change in any site.
3. **Given** a page or component, **When** it needs a color, typeface or shadow of the design language, **Then** a named utility exists for it (for example a surface background, a body text color, an aurora seam color, the ceramic shadow).

---

### User Story 2 - A complete dark theme (Priority: P1)

A visitor whose system prefers dark sees every site in a complete dark theme: dark ceramic surfaces, light text and the same aurora accents, with nothing left in light colors. Light stays the default for everyone else. A page can also force either theme (the theme picker, FEAT-007, will use this).

**Why this priority**: the vision promises a complete dark theme; tokens that only define light would have to be redone for it.

**Independent Test**: open a home page with the system preference set to dark, and again with the page forced to light and to dark; each time every token used by the page takes the value of that theme.

**Acceptance Scenarios**:

1. **Given** a visitor with no system preference or a light one, **When** a page opens, **Then** it is in the light theme.
2. **Given** a visitor whose system prefers dark, **When** a page opens, **Then** it is in the dark theme, including form controls and scroll bars drawn by the browser.
3. **Given** a page whose root is marked for the light or the dark theme, **When** it renders, **Then** it uses that theme whatever the system preference.

---

### User Story 3 - Readable in both themes (Priority: P1)

A visitor with low vision can read every text color of the design on every background color it is meant for, in both themes, and sees where the keyboard focus is.

**Why this priority**: WCAG 2.2 AA is a requirement of the technical specification, and the aurora colors of the original design (bright cyan, green and magenta) are not readable as text on white.

**Independent Test**: the automated tests compute the contrast of every declared text and background pair of each theme and fail naming the pair below the minimum.

**Acceptance Scenarios**:

1. **Given** the tokens, **When** the tests run, **Then** every text token reaches 4.5:1 on every surface it is used on, in both themes.
2. **Given** the tokens, **When** the tests run, **Then** the focus ring and control borders reach 3:1 on every surface, in both themes.
3. **Given** a token changed to a value below the minimum, **When** the tests run, **Then** they fail naming the theme, the pair and the ratio.

### Edge Cases

- The bright aurora colors are decorative (seams, glows, the hero); text in an aurora hue uses its readable "ink" variant of the theme.
- The page is styled before any script runs: the theme comes from the stylesheet alone, so no light flash appears for a visitor whose system prefers dark. A visitor's stored choice (FEAT-007) needs a small script before paint, which that item adds with its policy hash.
- Typefaces are served from the site's own origin (the Content Security Policy allows fonts only from it); until they load, the page shows the system font with the same layout.
- Text in scripts the shared typefaces do not cover (for example languages translated on demand) falls back to the system font.
- Browsers without native support for the color function that pairs light and dark values get an equivalent produced by the build, so both themes still work.
- The visitor's reduced motion preference is honored by the components and the hero, not by the tokens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The shared stylesheet of `@levix/ui` MUST define the Ceramic and Aurora tokens: surfaces, bevel and control borders, title, body and muted text, the four aurora hues (cyan, emerald, purple, magenta) and their readable ink variants, an accent, a focus color, status colors (success, warning, error, information), the ceramic resting and active shadows, the aurora gradient and the three typefaces (display, body, monospace).
- **FR-002**: Each color token MUST have a light and a dark value defined together, and every token MUST be available as a Tailwind utility and as a CSS variable.
- **FR-003**: The light theme MUST be the default; the dark theme MUST apply when the system prefers dark and the page does not force light; a page MUST be able to force either theme with an attribute on its root element; Tailwind's `dark:` variant MUST follow the same rule.
- **FR-004**: The stylesheet MUST style the page base from the tokens: background, body text, headings, typefaces, the focus ring, text selection and the browser's color scheme.
- **FR-005**: The typefaces MUST be self-hosted (bundled with each site), loaded without blocking the text, and licensed for this use.
- **FR-006**: The automated tests MUST check the WCAG 2.2 AA contrast of every declared text and non-text pair in both themes, and that each color token has both values.
- **FR-007**: The pages MUST keep passing the existing checks: no inline styles (the Content Security Policy), the Lighthouse performance and accessibility scores and a clean console.
- **FR-008**: The technical documentation MUST list the tokens and their use, and explain how a theme is applied and forced.

### Key Entities

- **Design token**: a named design value (color, shadow, typeface, gradient) with one value per theme where it differs.
- **Theme**: the set of token values for light or dark, chosen by the system preference or forced by the page.
- **Contrast pair**: a foreground token, a background token and the minimum ratio between them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The five home pages render in light and in dark from the shared tokens, with no color, shadow or typeface defined in a site.
- **SC-002**: Every declared contrast pair passes AA in both themes (automated tests).
- **SC-003**: Lighthouse keeps performance and accessibility at 0.9 or more and no console error on the audited pages.
- **SC-004**: Switching the system preference shows the matching theme with no flash of the other theme.

## Assumptions

- The colors of the original specification are the light theme's base: ceramic pure `#FFFFFF`, ceramic body `#FAFAFC`, chassis bevel `#E2E8F0`, obsidian text `#0A0D12`, slate body `#475569`, aurora cyan `#00F0FF`, emerald `#00FFA3`, purple `#7928CA` and magenta `#FF007A`.
- The dark theme starts from the dark values of Aurora Dev Suite (`crates/aurora-ui/styles/tokens.css`), so the website and the product share the design language.
- Typefaces from the original specification: Inter Tight for display (one of its two options), Inter for body text and JetBrains Mono for telemetry, badges and code, all under the SIL Open Font License.
- The theme picker and the stored choice are FEAT-007; components (cards, buttons, badges) are FEAT-009.
