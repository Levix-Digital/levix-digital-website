# Levix Digital Website: Technical Specification

A set of statically prerendered websites (the company home and one site per product) built from one repository, with a small serverless backend for the contact form and on-demand translation, all hosted on Google Firebase. The architecture style is a **modular monolith** (`architecture.style` in `.dev-cycle.json`): one repository and one build, split into modules with explicit public interfaces (the sites, the design system, product content, internationalization, and the backend functions). How each part works is described in the technical documentation (`TECDOC.md`); this document holds the product-wide technical decisions and requirements.

## Platforms and Stack

- **Browsers**: the current and previous major versions of Chrome, Edge, Firefox and Safari, on desktop and mobile. WebGL is optional: without it the hero shows a static image.
- **TypeScript (strict)**: one language for the sites and the functions.
- **Vue 3 (Composition API, `<script setup>`)**: the framework of the original specification and of DocMapper, known by the team.
- **Vite with static prerendering (vite-ssg)**: each page is generated as HTML at build time so it is fast and indexable, then hydrated in the browser.
- **Tailwind CSS**: utility styling over the design tokens of the Ceramic and Aurora language, with light and dark themes through CSS variables.
- **Three.js**: the 3D hero (ceramic plates over an aurora shader core).
- **npm workspaces**: one repository with the sites and the shared packages.
- **Firebase Hosting**: one Firebase project with one hosting site per domain (`levix.digital`, `anycontext.levix.digital`, `devcycle.levix.digital`, `gedo.levix.digital`, `aurora.levix.digital`), the hosting Levi chose to centralize future software publishing.
- **Cloud Functions for Firebase (2nd generation, Node.js 22)**: the contact form endpoint and the translation endpoint.
- **Cloud Firestore**: contact messages and the shared translation cache.
- **Google Cloud Translation API (v3)**: build-time translation of French and Spanish, and on-demand translation of other languages through the translation function.
- **Google Analytics 4** with Consent Mode: loaded only after consent.
- **Vitest** for unit tests and **Playwright** for end-to-end and visual checks; **Lighthouse CI** for performance and accessibility budgets.

## Architecture Overview

- **Sites** (`sites/home`, `sites/anycontext`, `sites/devcycle`, `sites/gedo`, `sites/aurora`): each one is a Vite application with its own pages, built into its own folder and deployed to its own Firebase Hosting site. The research pages (R&D and LSIE) belong to the home site (`levix.digital/research`, `levix.digital/research/lsie`).
- **Design system** (`packages/ui`): tokens, light and dark themes, layout (header, footer, availability banner), components (ceramic cards, buttons, plan tables, download panels) and the 3D hero.
- **Product content** (`packages/content`): one typed data file per product (name, status, features, requirements, plans, release source, links), the single source of the facts the sites show.
- **Internationalization** (`packages/i18n`): English source strings, the French and Spanish bundles generated at build time, the on-demand language download, the browser cache and the language picker. One URL per page in every language.
- **Functions** (`functions/`): `contact` (validates, stores the message, emails contact@levix.digital) and `translate` (returns the translations of a set of strings for a language, from the shared cache or the Translation API).
- **Build scripts** (`scripts/`): translation of new or changed strings for the prebuilt languages, and the release information of each product read from its release channel.

Details: [TECDOC.md](../../TECDOC.md).

## Non-Functional Requirements

### Performance

- Lighthouse performance score of 90 or more on mobile for the home page and every product page.
- Largest Contentful Paint under 2.5 s and Cumulative Layout Shift under 0.1 on a mid-range phone over 4G (Lighthouse mobile profile).
- Initial JavaScript under 200 KB compressed per page, without Three.js; the 3D hero loads after the first paint, only when WebGL is available and the visitor does not prefer reduced motion.
- The 3D hero pauses when off screen and keeps 60 frames per second on a mid-range laptop.
- Switching to a language already in the browser cache takes under 100 ms; a first download of a new language finishes in under 10 s.

### Security and Privacy

- No accounts or personal data beyond the contact form (name, email, company, message) and analytics after consent.
- The contact and translation functions validate their input, limit request rates per client, and are protected with Firebase App Check; the translation function accepts only strings that exist in the English source.
- No API key in the pages: the Translation API is called only from functions and build scripts with a service account.
- Firestore rules deny all client access; only functions read and write.
- HTTPS everywhere with HSTS, and a Content Security Policy that allows only the site's own origin, Google Analytics and the functions.
- Privacy policy, cookie notice and terms of use applicable to a company in Alberta, Canada (PIPEDA and Alberta PIPA); analytics follows the visitor's consent.

### Availability and Recovery

- The sites are static files on Firebase Hosting's CDN: availability is Firebase Hosting's.
- Every deploy can be rolled back to the previous release from Firebase Hosting.
- If the translation function is unavailable, the page stays in English and says the language could not be downloaded; if the contact function is unavailable, the form shows contact@levix.digital.
- Contact messages are kept in Firestore even when the email notification fails.

### Accessibility and Localization

- WCAG 2.2 level AA on every page in both themes: keyboard navigation, visible focus, contrast, text alternatives, reduced motion honored.
- English is the source language. French and Spanish are bundled at build time. Any language supported by the Translation API can be downloaded on demand and is kept in the browser's local storage. Right-to-left languages switch the page direction.
- One URL per page whatever the language; English is what search engines index.

## Integrations

| System | Direction | Use | When unavailable |
|---|---|---|---|
| Firebase Hosting | Out | Serves the sites | Site down (Firebase's availability) |
| Cloud Functions, Firestore | In and out | Contact messages, shared translation cache | Fallbacks above |
| Google Cloud Translation API | Out | Build-time and on-demand translation | Build keeps the previous translations; on-demand shows English |
| Email delivery (Gmail SMTP of the account that holds the contact@levix.digital alias, with an app password, through the Firebase Trigger Email extension) | Out | Notifies contact@levix.digital | Message stays in Firestore and is retried |
| Google Analytics 4 | Out | Visits and download clicks, after consent | No effect on the site |
| GitHub Releases of each product | In, at build time | Latest version and download links | Build keeps the last known release |
| Hostinger DNS | — | `levix.digital` and its subdomains point to Firebase Hosting | — |

## Data

- **Product content**: typed data files in the repository, reviewed like code.
- **Translations**: the English source strings in the repository; French and Spanish bundles generated and committed; on-demand translations in Firestore (`translations/{language}/strings/{hash of the English text}`) and in the visitor's local storage, invalidated when the English text changes.
- **Contact messages**: Firestore (`contactMessages`), kept for 24 months, then deleted.
- **Analytics**: in Google Analytics 4, with its retention set to 14 months.
- Changes to the data shapes are additive.

## Constraints

- Every fact on the site comes from the product's repository, its release channel or a reproducible measurement; unavailable products and unpublished research are labeled as such.
- Hosting on Google Firebase, in one Firebase project.
- DNS stays at Hostinger.
- No per-language URLs.
- The design follows the Ceramic and Aurora language of the original specification, with light as the default theme and a complete dark theme.
- All repository content in English, with no reference to the tools used to write it.

## Open Questions

- Firebase project name, region and billing account (the Blaze plan is needed for functions and the Translation API).
