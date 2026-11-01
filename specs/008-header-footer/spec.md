# Feature Specification: Shared Header and Footer

**Feature Branch**: `feat/008-header-footer`

**Created**: 2026-11-01

**Status**: Draft

**Input**: Backlog item FEAT-008: "Header with navigation, theme and language pickers; footer with contact@levix.digital, Calgary, Alberta, Canada and legal links." Decisions taken with the product owner on 2026-11-01: the navigation shows only pages that exist (today the four product sites); research, contact and legal links are added by the items that create those pages (FEAT-018, FEAT-019, v0.4); the language picker comes with the translation core (FEAT-029) and the header keeps its place; the logo is the company's "LD" monogram (`levix-digital-logo.svg`) next to the company name; the product sites do not copy the company header: each has its own header (the product's name in front, a small "by Levix Digital" link to the home, the theme picker) built from the same design tokens, so the Levix identity is kept as a concept, not as the same design, and the product-specific look (logo, accent, product menu) comes with the product site items of v0.2; the footer is the same on the five sites; on small screens the navigation folds behind a menu button; the footer shows the copyright with the current year (set in the browser, the build year without JavaScript), the email as a link, the city, province and country, and the product links.

## User Scenarios & Testing *(mandatory)*

The users of this feature are the visitors of the five sites: developers who arrive at a product site and decision makers who look at the company.

### User Story 1 - Know where I am and go to a product (Priority: P1)

A visitor sees at the top of every page which site they are on (Levix Digital or a product) and reaches the home or any of the four products in one step.

**Why this priority**: navigation between the company and its products is the reason the header exists; without it each site is an island.

**Independent Test**: open each of the five sites; the home header shows the company logo and the product links; each product header shows the product's name and the "by Levix Digital" link; every link opens the right site.

**Acceptance Scenarios**:

1. **Given** the company home, **When** the header is shown, **Then** it carries the Levix Digital logo and name, linked to the home, and a link to each of the four products.
2. **Given** a product site, **When** the header is shown, **Then** it is the product's own header: the product's name in front, linked to the product's home, and a smaller "by Levix Digital" link to the company home; it does not repeat the company header.
3. **Given** a product site, **When** the visitor wants another product, **Then** the footer lists the four products, the current one marked as the current site to sight and to assistive technology.

---

### User Story 2 - Find the company's contact details (Priority: P1)

A visitor finds, at the bottom of every page, who runs the site and how to reach them: the company name, contact@levix.digital and Calgary, Alberta, Canada.

**Why this priority**: the vision requires the contact details in the footer, and a commercial site must say who is behind it.

**Independent Test**: open each site; the footer shows the copyright line with the current year, the email as a mail link, the city, province and country, and the product links.

**Acceptance Scenarios**:

1. **Given** any page, **When** the footer is shown, **Then** it shows "© <current year> Levix Digital Inc.", contact@levix.digital as a mail link and "Calgary, Alberta, Canada".
2. **Given** a site last built in an earlier year, **When** a visitor opens it after New Year, **Then** the copyright shows the current year.
3. **Given** any page, **When** the footer is shown, **Then** it lists the four products with links to their sites.

---

### User Story 3 - Choose the theme from the header (Priority: P1)

A visitor changes the theme with the picker in the header, on every page of every site.

**Why this priority**: the picker of FEAT-007 sits in the body of each home page only as a placeholder until the header exists.

**Independent Test**: on each site, the picker is in the header and works as in FEAT-007; it is no longer in the page body.

**Acceptance Scenarios**:

1. **Given** any page, **When** the header is shown, **Then** it carries the theme picker, and the page body does not.
2. **Given** the dark theme, **When** the header and footer are shown, **Then** the logo, the text and the links stay legible (the company name turns light, the monogram keeps its colors).

---

### User Story 4 - Navigate on a phone and with a keyboard (Priority: P2)

A visitor on a narrow screen opens the navigation with a menu button; a keyboard or screen reader user reaches and uses every link and control.

**Why this priority**: WCAG 2.2 AA is a requirement of the technical specification, and many visitors arrive on phones; it builds on stories 1 and 3.

**Independent Test**: on the company home at 375 px wide, the links are hidden behind a menu button that opens and closes them; with the keyboard alone, every link, the menu button and the picker are reachable with a visible focus; a "Skip to content" link is the first stop.

**Acceptance Scenarios**:

1. **Given** the company home on a screen narrower than the medium breakpoint (768 px), **When** the page opens, **Then** the navigation links are hidden behind a menu button that says whether it is open.
2. **Given** the open menu, **When** the visitor presses Escape or follows a link, **Then** the menu closes and the focus returns to the button when closed with Escape.
3. **Given** a keyboard user, **When** they press Tab on a fresh page, **Then** the first stop is a "Skip to content" link that moves the focus to the main content.
4. **Given** a screen reader, **When** it lists the landmarks, **Then** it finds a banner, a navigation named "Main", the main content and a content information region.

### Edge Cases

- JavaScript disabled or not yet loaded: the prerendered page shows the header with the links visible on wide screens; on narrow screens the links are shown under the header instead of hidden, so nothing is out of reach; the copyright shows the year of the build.
- A product header has no menu yet (the product sites have one page); the product menu comes with the product site items, in the same header.
- Preview channels and the `web.app` addresses: product links point at the production domains (`<product>.levix.digital`); there is no per-preview cross-linking.
- The logo file has an opaque light background and an inline style: the header uses the monogram alone, without the background, and with no inline style, so it fits both themes and the Content Security Policy (no `'unsafe-inline'`).
- Fonts: the company name is real text in the site's font, not text inside the image, so it follows the theme and is read by screen readers.
- A long product name on a narrow screen: the header keeps the logo, the name and the menu button on one line; the name may wrap but never overlaps the button.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every page of the company home MUST show the company header: the company monogram and name linked to the home, the navigation, and the theme picker.
- **FR-001a**: Every page of a product site MUST show that product's header: the product's name in front, linked to the product's home, a smaller "by Levix Digital" link to the company home, and the theme picker; it MUST use the same design tokens as the company header and MUST NOT repeat the company header's layout.
- **FR-002**: The company navigation and the footer MUST link to the four product sites at their production domains; the footer MUST mark the current site with `aria-current`.
- **FR-003**: The navigation MUST contain only links to pages that exist; links to research, contact and legal pages are added by the items that create them.
- **FR-004**: The header MUST keep a place for the language picker (FEAT-029) next to the theme picker, without showing an empty control.
- **FR-005**: Every page MUST show the same footer: "© <year> Levix Digital Inc." with the current year in the visitor's browser (the year of the build when JavaScript does not run), contact@levix.digital as a `mailto:` link, "Calgary, Alberta, Canada", and links to the four products.
- **FR-006**: The theme picker MUST move from the page body to the header on the five sites, with its behavior of FEAT-007 unchanged.
- **FR-007**: Below 768 px the company navigation MUST fold behind a menu button that exposes its state (`aria-expanded`) and closes with Escape and when a link is followed; without JavaScript the links MUST stay reachable.
- **FR-008**: Every page MUST start with a "Skip to content" link to the main content, and use the banner, navigation, main and content information landmarks.
- **FR-009**: The header and footer MUST be legible in both themes (WCAG 2.2 AA contrast for text and focus), using the theme tokens of FEAT-006.
- **FR-010**: The monogram MUST be drawn from the company's logo file without its background and without inline styles or scripts; the Content Security Policy MUST NOT change.
- **FR-011**: The header and footer MUST live in the shared design system and take all their text from the site (the design system owns no text), so the translation core can translate it later.
- **FR-012**: The technical documentation MUST describe the shared layout, its inputs and how a later item adds a link.

### Key Entities

- **Site link**: a destination in the navigation or footer: a label, an address and whether it is the current site.
- **Company facts**: name, email and location (city, province, country) shown in the footer, held with the other company facts in the content package.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On each of the five sites, the right header (company or product) and the footer are present on the prerendered page, with the four product links and the contact details, checked by automated tests.
- **SC-002**: Lighthouse keeps performance and accessibility at 0.9 or more and no console error on the audited pages, in the existing CI audit.
- **SC-003**: At 375 px and at 1280 px, every link and control of each header is reachable by keyboard alone, checked by component tests and the manual test suite.
- **SC-004**: The served Content Security Policy is unchanged and the build check of inline code still passes.

## Assumptions

- Product names on the site are the products' names: AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite; they are added to the content package with their production addresses, ahead of the full product data of FEAT-014 and FEAT-015, which will extend them.
- Labels are English, in each site's strings, until the translation core (FEAT-029); text shared by the five sites (navigation name, menu button, skip link, location) is kept once in a shared place rather than copied five times.
- The year is set in the visitor's browser once the page has loaded, so a site not rebuilt for months still shows the current year; the prerendered page carries the build year for visitors without JavaScript.
- The full logo (monogram over the name, 760 × 380) stays the product owner's file; only the monogram is put in the repository, as an asset of the design system.
- The availability banner of unreleased products is a separate item and is not part of this header.
- The product-specific look of each product header (product logo, accent color, product menu such as Features, Pricing, Download) belongs to the product site items of v0.2; this item delivers the product header's structure ready to receive it.
