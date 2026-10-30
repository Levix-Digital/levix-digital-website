# Backlog

Work captured for later planning: bugs, features, improvements and adjustments, grouped under epics when the product is planned as a whole. Capturing an item takes no discovery; when the user decides to work on items, they are promoted into a plan (`plan-memory/backlog.py promote`), where the discovery and the planning happen. Open bugs come before new work.

Each item: `### <ID>: <title>` with the fields `Severity` (bugs: critical, high, medium, low) or `Priority` (others: high, medium, low), an optional `Epic`, `Status` (open, planned, in_progress), `Found`, `Plan` and `Description`. Epics (`EPIC-NNN`) group items of the complete product; they have no `Plan` and are never promoted: their items are. The roadmap (`docs/ROADMAP.md`) says which items go into which release. Closed items (done, dropped, duplicate, superseded by better defined items) move to `Closed` with a `Closed` note and keep their ids, which are never reused. Edit this file with `plan-memory/backlog.py` or by hand, and check it with `backlog.py validate`.

## Bugs

## Features

### FEAT-004: DNS for levix.digital and product subdomains
- **Priority**: high
- **Epic**: EPIC-001
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Hostinger DNS records pointing the apex and each product subdomain to Firebase Hosting, verified by Firebase.

### FEAT-005: Security headers
- **Priority**: medium
- **Epic**: EPIC-001
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: HSTS, Content Security Policy and other security headers set in firebase.json for every site.

### FEAT-006: Design tokens and themes
- **Priority**: high
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Ceramic and Aurora tokens as CSS variables with complete light and dark themes, in the shared Tailwind theme of `@levix/ui` (ADR-0006).

### FEAT-007: Theme picker
- **Priority**: high
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Light by default, dark following the system preference until the visitor chooses; the choice kept in local storage.

### FEAT-008: Shared header and footer
- **Priority**: high
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Header with navigation, theme and language pickers; footer with contact@levix.digital, Calgary, Alberta, Canada and legal links.

### FEAT-009: Ceramic components
- **Priority**: high
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Ceramic cards with aurora seams, buttons, badges and section layouts in both themes.

### FEAT-010: Availability banner
- **Priority**: high
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Full-width banner at the top of every page of a product not yet available, saying it will be available soon.

### FEAT-011: 3D hero
- **Priority**: high
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Three.js icosahedron of ceramic plates over an aurora shader core, loaded after first paint, paused off screen, static fallback without WebGL or with reduced motion.

### FEAT-012: Plans and pricing table
- **Priority**: medium
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Component that renders a product's plans and prices from its data file.

### FEAT-013: Download panel
- **Priority**: medium
- **Epic**: EPIC-002
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Per-platform download buttons and install instructions, disabled while the product is not available.

### FEAT-014: Product data schema
- **Priority**: high
- **Epic**: EPIC-003
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Typed schema for product facts (status, features, platforms, requirements, plans, links, release source) validated at build time.

### FEAT-015: Product data files
- **Priority**: high
- **Epic**: EPIC-003
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Data files for AnyContext, Dev Cycle Protocol, Gedo and Aurora Dev Suite written from their repositories, with only verifiable facts.

### FEAT-016: Release information at build time
- **Priority**: medium
- **Epic**: EPIC-003
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Latest version and download links of released products read from their GitHub Releases during the build.

### FEAT-017: Home page
- **Priority**: high
- **Epic**: EPIC-004
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Hero, introduction of Levix Digital Inc. and the product portfolio linking to each product site.

### FEAT-018: Contact page and form
- **Priority**: high
- **Epic**: EPIC-004
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Contact page with the form (name, email, company, message) and the company details.

### FEAT-019: Legal pages
- **Priority**: high
- **Epic**: EPIC-004
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Privacy policy, cookie notice and terms of use written for Levix Digital Inc. (PIPEDA and Alberta PIPA), reviewed before launch.

### FEAT-020: About page
- **Priority**: medium
- **Epic**: EPIC-004
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Who Levix Digital is: mission, location and approach.

### FEAT-021: Not-found page
- **Priority**: low
- **Epic**: EPIC-004
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Branded not-found page for every site.

### FEAT-022: AnyContext site
- **Priority**: high
- **Epic**: EPIC-005
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Overview, features, requirements, privacy, plans and pricing, and a working download page for Windows and Linux.

### FEAT-023: Dev Cycle Protocol site
- **Priority**: high
- **Epic**: EPIC-005
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Overview, features, requirements and download page of the Dev Cycle Protocol.

### FEAT-024: Gedo site
- **Priority**: high
- **Epic**: EPIC-005
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Overview, features and roadmap of Gedo, with the availability banner and disabled downloads.

### FEAT-025: Aurora Dev Suite site
- **Priority**: high
- **Epic**: EPIC-005
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Overview, features and roadmap of Aurora Dev Suite, with the availability banner and disabled downloads.

### FEAT-026: Plans of the other products
- **Priority**: medium
- **Epic**: EPIC-005
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Plans and prices of Dev Cycle Protocol, Gedo and Aurora Dev Suite, as defined by Levi at implementation time.

### FEAT-027: R&D page
- **Priority**: medium
- **Epic**: EPIC-006
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Page presenting the research line of Levix Digital, linking to each research project.

### FEAT-028: LSIE page
- **Priority**: medium
- **Epic**: EPIC-006
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: The LSIE algorithm: the paper (work in progress, not yet published), the explanation of the method, the benchmark and the code.

### FEAT-029: Translation core and language picker
- **Priority**: high
- **Epic**: EPIC-007
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: t() function, English source dictionaries per site and shared, and a language picker listing every supported language.

### FEAT-030: Build-time French and Spanish
- **Priority**: high
- **Epic**: EPIC-007
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Script that sends only new or changed strings to the Cloud Translation API and writes the French and Spanish bundles.

### FEAT-031: translate function
- **Priority**: medium
- **Epic**: EPIC-007
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Cloud Function returning translations from a shared Firestore cache, translating only missing strings, protected by App Check and rate limits.

### FEAT-032: On-demand languages in the browser
- **Priority**: medium
- **Epic**: EPIC-007
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Download of any other language with progress, kept in local storage, refreshed only for changed strings, with right-to-left support.

### FEAT-033: contact function
- **Priority**: high
- **Epic**: EPIC-008
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Validation, App Check, rate limit, storage in Firestore and email notification to contact@levix.digital.

### FEAT-034: Consent and Google Analytics 4
- **Priority**: medium
- **Epic**: EPIC-008
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Cookie consent banner with Google Analytics 4 Consent Mode; analytics only after consent.

### FEAT-035: Analytics events
- **Priority**: medium
- **Epic**: EPIC-008
- **Status**: open
- **Found**: 2026-10-30
- **Plan**: -
- **Description**: Download clicks and contact submissions recorded as Google Analytics 4 events.

## Improvements

## Adjustments

## Epics

### EPIC-001: Foundation and deployment
- **Priority**: high
- **Status**: open
- **Found**: 2026-10-30
- **Description**: Repository, build, quality checks and Firebase deployment of every site

### EPIC-002: Design system
- **Priority**: high
- **Status**: open
- **Found**: 2026-10-30
- **Description**: Ceramic and Aurora tokens, light and dark themes, layout and components

### EPIC-003: Product content
- **Priority**: high
- **Status**: open
- **Found**: 2026-10-30
- **Description**: Typed data file per product, the single source of product facts

### EPIC-004: Company home
- **Priority**: high
- **Status**: open
- **Found**: 2026-10-30
- **Description**: levix.digital: who Levix Digital is, the portfolio, research, contact and legal

### EPIC-005: Product sites
- **Priority**: high
- **Status**: open
- **Found**: 2026-10-30
- **Description**: One site per product at its subdomain, with overview, features, plans and download

### EPIC-006: Research and development
- **Priority**: medium
- **Status**: open
- **Found**: 2026-10-30
- **Description**: R&D page and the LSIE page with the paper, method, benchmark and code

### EPIC-007: Internationalization
- **Priority**: high
- **Status**: open
- **Found**: 2026-10-30
- **Description**: English source, French and Spanish at build time, any other language on demand

### EPIC-008: Backend and analytics
- **Priority**: medium
- **Status**: open
- **Found**: 2026-10-30
- **Description**: Contact function, consent and Google Analytics 4

## Closed

### FEAT-001: Workspace and build setup
- **Priority**: high
- **Epic**: EPIC-001
- **Status**: done
- **Found**: 2026-10-30
- **Plan**: levix_digital_website_workspace_and_build_setup
- **Closed**: 2026-10-30, plan levix_digital_website_workspace_and_build_setup
- **Description**: npm workspaces with Vite, Vue 3, TypeScript strict, Tailwind and vite-ssg, one folder per site and per package.

### FEAT-002: Firebase hosting sites and preview channels
- **Priority**: high
- **Epic**: EPIC-001
- **Status**: done
- **Found**: 2026-10-30
- **Plan**: levix_digital_website_firebase_hosting_sites_and_preview_channels
- **Closed**: 2026-10-30, plan levix_digital_website_firebase_hosting_sites_and_preview_channels
- **Description**: One Firebase project with a hosting site and target per domain, and preview channels for pull requests.

### FEAT-003: Continuous integration and deployment
- **Priority**: high
- **Epic**: EPIC-001
- **Status**: done
- **Found**: 2026-10-30
- **Plan**: levix_digital_website_continuous_integration_and_production_deploy
- **Closed**: 2026-10-30, plan levix_digital_website_continuous_integration_and_production_deploy
- **Description**: Type check, lint, unit tests, build and Lighthouse CI on every pull request; deploy each changed site on merge to main.
