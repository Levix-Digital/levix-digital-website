# Feature Specification: Company Home Page

**Feature Branch**: `feat/009-company-home`

**Created**: 2026-11-12

**Status**: Draft

**Input**: Backlog item FEAT-017: "Hero, introduction of Levix Digital Inc. and the product portfolio linking to each product site", with the minimum of FEAT-009 (ceramic components) and FEAT-014/FEAT-015 (product data) the page needs. Decisions taken with the product owner on 2026-11-12: the home is built now, before the product sites; the hero is sober, with no 3D scene (the 3D vault prototype was rejected and is not reused); the company's distribution and positioning document (`/mnt/project-files/website-planning/estrategia-distribuicao-posicionamento.pdf`, 2026-11-05) guides priorities and tone but is not a source of facts, since parts of it (notably the platform layer) do not match the repositories. Also confirmed by the product owner on 2026-11-12: the company is presented clearly as one that develops products that run only inside the customer's perimeter; and the portfolio shows five products in two lines, documents (DocMapper, AnyContext) first and software development with agents (Dev Cycle Protocol, Gedo, Aurora Dev Suite) second; the administration server ("Admin Hub") and the platform layer are not presented until a repository backs them.

## User Scenarios & Testing *(mandatory)*

The users of this page are the visitors of `levix.digital`: technical and security decision makers in organizations whose data cannot leave their premises, developers who evaluate tools, and partners, investors and candidates who want to know what the company does.

### User Story 1 - Understand what Levix Digital does in seconds (Priority: P1)

A visitor lands on the home and, without scrolling, reads what Levix Digital is: a company that builds products made to run only inside the customer's perimeter (their machines and network), governed by the customer and open to inspection.

**Why this priority**: the home is the company's first impression; the positioning document makes the category ("AI where the cloud does not go") the frame of everything else.

**Independent Test**: open the home at a 1280 px and a 375 px wide window; the hero shows the headline, a one-sentence explanation and two actions (see the products, contact) above the fold, in both themes.

**Acceptance Scenarios**:

1. **Given** the home, **When** it loads, **Then** the first screen shows a headline, a short supporting sentence and two actions: one that scrolls to the products and one that goes to the contact section.
2. **Given** the home, **When** it is shown, **Then** the hero has no 3D scene, animation loop or game-like element; it is text over the ceramic surface with at most a static aurora accent.
3. **Given** a visitor with reduced motion or without JavaScript, **When** the home loads, **Then** the hero content is the same and fully readable.

---

### User Story 2 - See the products and know which ones I can use today (Priority: P1)

A visitor scans the portfolio, sees each product's name, what it does in one sentence, which line it belongs to and whether it is available, and opens the product's site when there is one.

**Why this priority**: the portfolio is the reason the home exists (FEAT-017), and stating availability honestly is a requirement of the vision ("only facts that are true").

**Independent Test**: open the home; the portfolio shows two labeled groups with the five products in the agreed order, each with its status; each product that has a site links to it, and a product without a site shows no dead link.

**Acceptance Scenarios**:

1. **Given** the portfolio, **When** it is shown, **Then** the documents line (DocMapper, AnyContext) comes before the development line (Dev Cycle Protocol, Gedo, Aurora Dev Suite), each line with a short heading and one sentence on whom it serves.
2. **Given** a product card, **When** it is shown, **Then** it carries the product name, a one-sentence value statement and an availability status taken from the product data (available, preview or in development).
3. **Given** a product that has a site (AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite), **When** the visitor activates its card, **Then** the product's site opens.
4. **Given** DocMapper, which has no site yet, **When** its card is shown, **Then** it has no link and says it is in development.
5. **Given** any product, **When** its status or one-line statement changes, **Then** only that product's data entry changes and the home, the header and the footer follow.

---

### User Story 3 - Know who is behind the company and how to reach it (Priority: P2)

A visitor reads a short paragraph on who Levix Digital is (an independent software company in Calgary, Alberta, Canada, that builds the products it presents) and finds how to contact it.

**Why this priority**: a commercial site must say who runs it, and contact is how interest becomes a conversation; the contact form itself comes with FEAT-018.

**Independent Test**: open the home; the "About" and "Contact" sections show the company name, its city, province and country, the approach in two or three sentences, and contact@levix.digital as a mail link.

**Acceptance Scenarios**:

1. **Given** the home, **When** the visitor reaches the about section, **Then** it states the company's name, location and approach without numbers, customers, certifications or claims the repositories do not back.
2. **Given** the contact section, **When** the visitor activates the email address, **Then** their mail client opens addressed to contact@levix.digital.
3. **Given** the hero's contact action, **When** the visitor activates it, **Then** the page moves to the contact section and focus lands on it.

---

### User Story 4 - Learn that Levix Digital does research (Priority: P3)

A visitor sees a short research section presenting the LSIE line (deterministic, scale-invariant document extraction that runs locally) and that its paper is a work in progress.

**Why this priority**: research supports the company's credibility with technical readers, but its full pages belong to v0.4.

**Independent Test**: open the home; the research section names LSIE, explains it in at most three sentences, marks the paper as a work in progress, and contains no link to a page that does not exist.

**Acceptance Scenarios**:

1. **Given** the research section, **When** it is shown, **Then** it names LSIE, says it powers DocMapper's extraction, and labels the paper as not yet published.
2. **Given** the research pages are not built, **When** the section is shown, **Then** it carries no link to them.

---

### Edge Cases

- A product without a site: its card is not a link and nothing on the page points to a missing address.
- A product whose status changes between builds: the card reflects the data file of the build; no status is hard-coded in the page.
- A narrow screen (320 px): the product cards stack in one column, no horizontal scrolling, all text readable.
- Dark theme: every card, status badge and heading keeps a contrast ratio of at least 4.5:1 for text.
- No JavaScript: the whole page content is in the prerendered HTML; only the theme choice and the copyright year depend on scripts, as today.
- Keyboard only: every link and action is reachable in reading order with a visible focus ring.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home MUST present, in this order: hero, product portfolio, about, research, contact.
- **FR-002**: The hero MUST show a headline and one supporting sentence that state, without ambiguity, that Levix Digital focuses on products that run inside the customer's perimeter, governed by the customer and verifiable, and two actions: "See the products" (to the portfolio) and "Contact" (to the contact section).
- **FR-003**: The hero MUST NOT contain a 3D scene, an animation loop or WebGL; any decoration is static and purely visual (hidden from assistive technology).
- **FR-016**: The about section MUST repeat the focus in its first sentence: Levix Digital develops products that run inside the customer's perimeter, never as a service hosted by Levix Digital.
- **FR-017**: A product card MUST NOT claim more than its product does today: where a product can use an outside service by the customer's choice (for example AnyContext with a cloud model), the card does not say it never connects out.
- **FR-018**: A product's statement MUST describe its purpose, not its application type (desktop, web, command line, hosting model), so the home does not change when a product changes form; the product's own site carries those details.
- **FR-004**: The positioning copy MUST NOT state absolute guarantees ("100% secure", "unbreakable", "nothing ever leaves") or facts not backed by a repository: no customers, certifications, audits, metrics or prices.
- **FR-005**: The portfolio MUST group the products in two lines, documents and knowledge (DocMapper, AnyContext) first and software development with agents (Dev Cycle Protocol, Gedo, Aurora Dev Suite) second, each line with a heading and a one-sentence description.
- **FR-006**: Each product card MUST show the product's name, a one-sentence value statement and its availability status, all read from the product data.
- **FR-007**: The availability status MUST be one of: "Available" (a public release can be installed today), "Preview" (pre-release builds are published), "In development" (no installable release). The initial values MUST be checked against each repository when the data is written.
- **FR-008**: A product card MUST link to the product's site when the product has one, and MUST NOT be a link otherwise.
- **FR-009**: The product data MUST be one typed entry per product in the shared content module, validated by the build (a missing field, an unknown status or an unknown line fails the build), and the header and footer MUST keep reading the products with a site from the same entries.
- **FR-010**: The about section MUST state the company's legal name, Calgary, Alberta, Canada, and its approach in at most three sentences.
- **FR-011**: The research section MUST present LSIE in at most three sentences, state that the paper is a work in progress, and carry no link while the research pages do not exist.
- **FR-012**: The contact section MUST show contact@levix.digital as a mail link and the company's location; it MUST NOT contain a form (FEAT-018 adds it).
- **FR-013**: All visible text MUST come from the site's English string file, so the translation items can translate it.
- **FR-014**: The page MUST set a descriptive title and meta description for search engines and link previews.
- **FR-015**: The cards, section headings, status badges and buttons MUST be reusable components of the shared UI package built on the existing design tokens, in both themes.

### Key Entities

- **Product**: a product of the portfolio: identifier, name, line, one-sentence value statement, availability status, and the address of its site when it has one.
- **Product line**: documents and knowledge, or software development with agents: a name and a one-sentence description, in display order.
- **Availability status**: Available, Preview or In development, with the label shown to visitors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a five-second look at the first screen, a reviewer can say what Levix Digital does and for whom (checked by the product owner on the release candidate).
- **SC-002**: Every statement on the page about a product (status, platforms, capability) can be traced to the product's repository; zero statements without a source in the review.
- **SC-003**: The home scores 90 or more for performance, accessibility, best practices and SEO in Lighthouse, as every page already must.
- **SC-004**: The page shows no horizontal scrolling from 320 px to 1920 px wide, in both themes.
- **SC-005**: Changing a product's status takes one edit in one file and changes it everywhere it appears.

## Assumptions

- The product line-up and order were confirmed by the product owner on 2026-11-12.
- DocMapper joins the product data without a site or subdomain; its site is a separate backlog item.
- Initial statuses, to be confirmed against the repositories in the plan: AnyContext available (public releases with installers); Dev Cycle Protocol available (open source, installable from its repository); Aurora Dev Suite in development (becoming a self-hosted web application, not released); Gedo in development (a library without a command yet); DocMapper in development (no installers before 1.0).
- FEAT-011 (3D hero) is replaced by the sober hero of this feature; the plan proposes removing it from v0.1.0.
- The contact form (FEAT-018), legal pages (FEAT-019), language picker (FEAT-029), analytics (FEAT-034), the research pages (v0.4) and the product sites (v0.2) are out of scope.
- The home stays a single page; "About" is a section here, and FEAT-020 (About page) remains in v0.2.
