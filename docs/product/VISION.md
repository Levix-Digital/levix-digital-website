# Levix Digital Website

The public website of Levix Digital Inc. (Calgary, Alberta, Canada): the company's home at `levix.digital` and one site per product at `<product>.levix.digital`, presenting what each product does, its plans and its downloads, in English with any other language on demand.

## Problem

Levix Digital builds several software products and a research line, but has no public place that presents them. Today a person who hears about AnyContext, Gedo, the Dev Cycle Protocol or Aurora Dev Suite only finds GitHub repositories written for developers and maintainers:

- There is no single page that says what Levix Digital is and which products it makes.
- A product's README mixes what it does with how to build it, and some READMEs are out of date (the AnyContext releases page still describes the earlier Python version).
- There is no page to download a product, compare its plans or know whether it is available yet.
- The LSIE research (paper, code and benchmark) is only visible inside a private repository.
- Everything is in English only, while the audience is international.

## Target Users

- **Developers and technical leads (primary).** People who build software and evaluate tools for their own work or their team. They want to understand quickly what a product does, whether it runs on their platform, whether it keeps their data private, how much it costs and how to install it.
- **Decision makers in companies (secondary).** CTOs and engineering managers who compare tools for a team. They want plans, pricing, privacy and licensing facts, and a way to contact the company.
- **Researchers and technical readers.** People interested in the LSIE algorithm: the paper, the method, the reproducible benchmark and the code.
- **Partners, investors and candidates.** People who want to know who Levix Digital is and what it builds.

## Value Proposition

- **One place for the whole company**: what Levix Digital is and every product it makes, from the home page.
- **A focused site per product**: each product has its own subdomain with its features, requirements, plans and download page, without the noise of the other products.
- **Only facts that are true**: every capability, number, platform and status on the site comes from the product's repository or a reproducible measurement; products not yet available are labeled as such.
- **Readable in the visitor's language**: English, French and Spanish ready, and any other language translated on demand in the browser.
- **A design that matches the products**: the Ceramic and Aurora design language, shared with Aurora Dev Suite.

## Business Model

The website is not sold. It supports the products' revenue:

- AnyContext is distributed with a free Community plan and paid plans (Personal, Pro, Team, Enterprise), published on its site as defined in the product (prices will change; the site follows the product).
- The plans of the other products are defined when their pages are implemented.
- Costs that matter: Firebase Hosting (one Firebase project, one hosting site per subdomain), the Google Cloud Translation API for build-time and on-demand translation, the domain, and the contact form backend.

## Success Metrics

Proposed, to be confirmed (see Open Questions):

- Every product has a live page at its subdomain, with no claim that its repository or a measurement does not support.
- AnyContext downloads started from the site per month.
- Contact requests received through the site per month.
- Lighthouse scores of 90 or more for performance, accessibility, best practices and SEO on the home page and every product page.
- The site works in French and Spanish without any network call for translation, and in other languages after a one-time download.

## Scope

- **Company home (`levix.digital`)**: who Levix Digital is, the product portfolio (AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite), the research line, the interactive 3D hero, contact and legal information.
- **Product sites (`<product>.levix.digital`)**: one site per product, built as if the product were released: overview, features, requirements and platforms, privacy, plans and pricing, documentation links, and a download page.
- **Availability status**: for a product not yet available, a full-width banner at the top of its pages says it will be available soon, and the download buttons are disabled until a release exists.
- **Downloads**: the download page points to the product's published release (for AnyContext, its GitHub releases and install scripts), with per-platform instructions.
- **Plans and pricing**: AnyContext's plans as currently defined; the other products' plans when defined.
- **Research and development**: an R&D page presenting the research line, linking to a dedicated LSIE page with the paper (a work in progress, not yet published), the explanation of the method, the benchmark and the code.
- **Languages**: English as the source; French and Spanish translated at build time; any other language translated on demand in the browser through Google's official translation API and kept in the visitor's browser storage. One URL per page, whatever the language.
- **Contact**: a contact form and the company's contact details.
- **Legal**: privacy policy and terms of use.
- **Design language**: Ceramic and Aurora (ceramic white surfaces, aurora light seams, 3D hero), shared by the company home and the product sites.

## Non-Goals

- Products that are no longer part of the portfolio: Intellexis, Forklift License Manager, TensorLiteDB, AeternaQuartz, VentureHub and the DSA agency.
- Claims that cannot be backed by a repository or a reproducible measurement: no invented metrics, certifications, customers or return-on-investment figures.
- A return-on-investment simulator.
- Separate URLs per language.
- Selling or billing on the site: checkout, accounts and license management belong to the products.
- Hosting product binaries on the website: downloads come from each product's release channel.
- A blog or content management system in the first releases.

## Risks and Assumptions

- **Misleading claims (legal and reputational).** A number or status that is not true exposes the company under Canadian advertising law. Reduced by taking every fact from the product repositories, labeling unavailable products and unpublished research as such, and reviewing the copy before each release.
- **Product facts drift.** Products change faster than the site (versions, plans, prices). Reduced by keeping product facts in one data file per product and updating it with each product release.
- **On-demand translation quality and cost.** Machine translation may be imprecise and the official API has a cost per character. Reduced by translating only missing or changed strings, caching in the browser, and pre-translating the most used languages at build time.
- **Search visibility of other languages.** Languages translated in the browser are not indexed by search engines; only English (and the build-time languages, if served in the page) are. Accepted by the decision of no per-language URLs.
- **3D performance.** The WebGL hero can be heavy on low-end devices. Reduced by a static fallback, pausing it off screen and honoring reduced-motion preferences.
- **Translation API key exposure.** A browser-side call to the official API needs protection. Reduced by calling it through a server-side function with quotas, never with a key embedded in the page.

## Open Questions

- Success metric targets (monthly downloads and contact requests).
- Dark theme alongside the light ceramic theme, or light only as in the original specification.
- Contact: the address that receives messages, and the company details for the footer.
- Analytics: Google Analytics 4 with cookie consent, or no analytics.
- Where the `levix.digital` DNS is managed.
- Legal texts: who reviews the drafted privacy policy and terms.
- Plans and prices of Dev Cycle Protocol, Gedo and Aurora Dev Suite (asked at implementation time).
