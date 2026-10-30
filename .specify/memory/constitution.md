<!-- dev-cycle-constitution
generated-by: dev-cycle-protocol/constitution.py (do not edit; change a source and regenerate)
sources-sha256: e8583c849e90199f1f0d43650d9ba37bc33671234ff2ef027b5ada14bd9d181d
content-sha256: dee3f287c0b8ab84a21b822bbf77e5703ead7ac8e2cc67c2387d4846bd5037c8
-->
# levix-digital-website Constitution

The non-negotiable rules every specification, plan and task of this project follows. It is generated from the project's sources of truth by `dev-cycle-protocol/constitution.py`; change a source and regenerate it, never edit it.

## Core Principles

### I. Design

*Source: software-design*

#### Modularity and separation of responsibilities
- One module, type or function has **one reason to change**. When a description needs "and", split it.
- Group code by what it is about (a domain concept or a feature), not by what kind of file it is, unless the architecture style says otherwise.
- Business rules never live in the user interface, in transport code (HTTP handlers, CLI argument parsing) or in persistence code.
- Dependencies point toward stable code: details (frameworks, databases, network, UI) depend on the core, never the other way around.

#### SOLID, in practice
| Principle | What it means when writing code | Smell that it is violated |
|---|---|---|
| **S**ingle responsibility | Each unit does one job and can be named without "and". | A 600-line file mixing parsing, rules and output. |
| **O**pen/closed | Add behavior by adding a new implementation, not by growing an `if/else` chain in stable code. | Every new provider edits the same `match` in five places. |
| **L**iskov substitution | Any implementation of an interface can replace another without surprises. | An implementation that panics or ignores half the contract. |
| **I**nterface segregation | Small interfaces shaped by what the caller needs. | Callers implementing methods they never use. |
| **D**ependency inversion | High-level code depends on abstractions it owns; adapters implement them. | Core code constructing an HTTP client or a database driver. |

#### Clean Code
- **Names** say what something is or does; no abbreviations a newcomer cannot decode; no `data`, `info`, `manager`, `util` as whole names.
- **Small functions** that do one thing at one level of abstraction; early returns instead of deep nesting.
- **No magic values**: named constants with units in the name (`TIMEOUT_MS`).
- **Comments explain why**, never what; delete commented-out code and dead code.
- **Consistency over preference**: follow the conventions already in the codebase (naming, error types, layout) unless the change is an agreed refactor.
- **Duplication**: remove it when the same rule exists twice; tolerate it when two pieces only look alike today.

#### Explicit error handling
- Never swallow an error (`except: pass`, `let _ =` on a meaningful result, an empty `catch`, a blind `.unwrap()` on input that can fail).
- Errors carry context (what was being done, with which input) and use the project's canonical error types.
- Decide at each boundary: recover, translate into the caller's error type, or propagate. Report to the user once, at the edge.
- Fallbacks are allowed only when they are explicit, logged and visible in status output; a silent fallback that changes behavior is a defect.

#### Testability
- Pure logic is separated from I/O so it can be unit-tested without mocks.
- External services sit behind an interface the tests can replace.
- A structure that is hard to test is a design problem, not a testing problem.

### II. Simplicity First

*Source: software-design*

Principles applied mechanically produce over-engineering. The rule: **the simplest solution that keeps responsibilities separate.**

- Introduce an abstraction (trait, interface, base class, factory) only when at least one of these is true:
  1. there is a **second implementation** now (not "maybe later");
  2. it creates a **test seam** you need today;
  3. it isolates an **external dependency** (framework, service, database, OS API).
- No speculative configuration, plugin systems or generic frameworks for a single use case.
- Prefer composition over inheritance; prefer plain data and functions over class hierarchies.
- Three similar lines are better than a premature helper with five parameters.

#### Design patterns: only when they solve a real problem
| Problem actually present | Pattern that fits |
|---|---|
| Several interchangeable algorithms or providers chosen at runtime | Strategy |
| A third-party or legacy interface that does not match yours | Adapter |
| Construction is complex or depends on configuration | Factory / Builder |
| Behavior changes with an explicit lifecycle state | State machine |
| Actions must be queued, logged, undone or dispatched uniformly | Command |
| Persistence must be swappable or mocked | Repository |
| Several parts react to an event without knowing each other | Observer / event channel |

If you cannot point to the problem in the left column, do not use the pattern. Name the pattern in code or docs only when it helps the reader.

### III. Architecture Style: modular-monolith

*Source: software-design/styles/modular-monolith.md*

##### Structure

- **Modules by business capability**, each with its own folder or package containing its domain, application logic and persistence.
- **Public interface per module**: a small facade or API (functions, service interfaces, events) that other modules use. Everything else is internal.
- **Shared kernel**: only truly shared, stable concepts (IDs, money, time). Keep it small.
- **Integration between modules** through the public interface or domain events, never through another module's tables or internal types.

##### Where things go

| Piece | Location |
|---|---|
| A rule about invoices | `billing` module, internal |
| Another module needs an invoice total | `billing`'s public interface |
| "When an account is closed, cancel subscriptions" | Event published by `accounts`, handled by `billing` |
| Money, IDs, clock | Shared kernel |

##### Common mistakes

- A "common" or "shared" module that grows into a second monolith everything depends on.
- Joins across modules' tables in one query "for performance" without an agreed read model.
- Modules organized by technical layer (`controllers`, `services`, `repositories`) instead of by business capability.
- Public interfaces that expose internal entities, so every change ripples across modules.

### IV. Development Cycle

*Source: dev-cycle-protocol*

1. **Design**: modular code with clear responsibilities, SOLID, Clean Code, explicit errors, patterns only when needed, in the project's architecture style (`software-design`).
2. **Evidence**: every change is proven by automated tests; manual tests cover only what cannot be automated, in one curated suite (`quality-assurance`).
3. **Documentation describes today**: technical docs and README are edited in place; history lives in Git and release notes (`architecture-docs`, `user-docs`).
4. **Plans are shared and complete**: approved plans are versioned files in the project (`plan-memory`).
5. **Safe delivery**: short-lived branches on the project's branching model, CI on every pull request, release candidates, the user's release gate (`devops-release`).
6. **Security**: no secrets in Git, backward-compatible data migrations, a rollback path for every release.
7. **Bugs first**: open `critical`, `high` and `medium` bugs are planned and fixed before new features, improvements and adjustments; a `low` bug goes into the next release at the latest; no known bug stays untriaged (a severity, and a release for the ones that do not block). Only the user can explicitly accept the risk. Nothing found is lost, it is fixed now or captured in the backlog.
8. **Follow-through**: the agent follows CI and releases to the end and fixes what fails; the user's decisions (plan approval, candidate acceptance, the release gate) are never taken by the agent.
9. **No AI attribution, anywhere**: no artifact names an AI, a model or a coding agent as author, co-author, reviewer or source: commits and their trailers, tags, branches, pull and merge requests, reviews and review comments, issues, plans, documentation, release notes and code comments. Everything is authored by the repository's Git identity (`devops-release`). Configuration a project needs for its tools (an agent's settings folder, an integration name) is technical, not attribution. Text posted through any tool other than `pr_sync` (a platform tool, a connector, the web page) is checked first with `"<skills_root>/dev-cycle-protocol/bin/dev-cycle" dev-cycle-protocol _no_ai --file <text>`, and read back after posting: a footer, link or marker the tool appended ("Generated by ...", an agent's session or thread link) is edited out at once. Gate 8 also refuses commits whose author or committer is an AI identity.

## Product Requirements and Constraints

*Source: docs/product/TECH_SPEC.md*

### Non-Functional Requirements

#### Performance

- Lighthouse performance score of 90 or more on mobile for the home page and every product page.
- Largest Contentful Paint under 2.5 s and Cumulative Layout Shift under 0.1 on a mid-range phone over 4G (Lighthouse mobile profile).
- Initial JavaScript under 200 KB compressed per page, without Three.js; the 3D hero loads after the first paint, only when WebGL is available and the visitor does not prefer reduced motion.
- The 3D hero pauses when off screen and keeps 60 frames per second on a mid-range laptop.
- Switching to a language already in the browser cache takes under 100 ms; a first download of a new language finishes in under 10 s.

#### Security and Privacy

- No accounts or personal data beyond the contact form (name, email, company, message) and analytics after consent.
- The contact and translation functions validate their input, limit request rates per client, and are protected with Firebase App Check; the translation function accepts only strings that exist in the English source.
- No API key in the pages: the Translation API is called only from functions and build scripts with a service account.
- Firestore rules deny all client access; only functions read and write.
- HTTPS everywhere with HSTS, and a Content Security Policy that allows only the site's own origin, Google Analytics and the functions.
- Privacy policy, cookie notice and terms of use applicable to a company in Alberta, Canada (PIPEDA and Alberta PIPA); analytics follows the visitor's consent.

#### Availability and Recovery

- The sites are static files on Firebase Hosting's CDN: availability is Firebase Hosting's.
- Every deploy can be rolled back to the previous release from Firebase Hosting.
- If the translation function is unavailable, the page stays in English and says the language could not be downloaded; if the contact function is unavailable, the form shows contact@levix.digital.
- Contact messages are kept in Firestore even when the email notification fails.

#### Accessibility and Localization

- WCAG 2.2 level AA on every page in both themes: keyboard navigation, visible focus, contrast, text alternatives, reduced motion honored.
- English is the source language. French and Spanish are bundled at build time. Any language supported by the Translation API can be downloaded on demand and is kept in the browser's local storage. Right-to-left languages switch the page direction.
- One URL per page whatever the language; English is what search engines index.

### Constraints

- Every fact on the site comes from the product's repository, its release channel or a reproducible measurement; unavailable products and unpublished research are labeled as such.
- Hosting on Google Firebase, in one Firebase project, `levix-digital`, on the Blaze plan with Levi's billing account; the services that have a region (Firestore, functions) run in Montreal (`northamerica-northeast1`), which keeps the data of the contact form in Canada.
- DNS of `levix.digital` at Cloudflare (ADR-0009).
- No per-language URLs.
- The design follows the Ceramic and Aurora language of the original specification, with light as the default theme and a complete dark theme.
- All repository content in English, with no reference to the tools used to write it.

## Architecture Decisions

Accepted decisions; a plan that contradicts one needs a new ADR that supersedes it.

- ADR-0001: Modular monolith in one repository (`docs/adr/0001-modular-monolith-in-one-repository.md`)
- ADR-0002: Vue 3 with Vite static prerendering (`docs/adr/0002-vue-3-with-vite-static-prerendering.md`)
- ADR-0003: Firebase Hosting with one site per domain (`docs/adr/0003-firebase-hosting-with-one-site-per-domain.md`)
- ADR-0004: Build-time and on-demand translation without per-language URLs (`docs/adr/0004-build-time-and-on-demand-translation-without-per-language-ur.md`)
- ADR-0005: Product facts as typed data files (`docs/adr/0005-product-facts-as-typed-data-files.md`)
- ADR-0006: Tailwind CSS 4 with a shared stylesheet theme (`docs/adr/0006-tailwind-css-4-with-a-shared-stylesheet-theme.md`)
- ADR-0007: Keyless deploys with Workload Identity Federation (`docs/adr/0007-keyless-deploys-with-workload-identity-federation.md`)
- ADR-0008: Continuous deploy of changed sites on merge (`docs/adr/0008-continuous-deploy-of-changed-sites-on-merge.md`)
- ADR-0009: DNS at Cloudflare with Firebase-hosted names not proxied (`docs/adr/0009-dns-at-cloudflare-with-firebase-hosted-names-not-proxied.md`)

## Governance

- This constitution supersedes other practices for specifications, plans and tasks. A plan passes the Constitution Check or records each justified violation in its Complexity Tracking table; a lasting exception becomes an ADR.
- Amendments change the source, not this file: an ADR for decisions, the technical specification for requirements and constraints, `.dev-cycle.json` for the architecture style, the skills for principles. Then run `constitution.py generate` and commit the result with the change.
- Gate 3 of the development cycle blocks a plan while this file is stale or edited by hand.

**Version**: 1.5.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
