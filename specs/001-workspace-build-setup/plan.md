# Implementation Plan: Workspace and Build Setup

**Branch**: `feat/001-workspace-build-setup` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-workspace-build-setup/spec.md`

## Summary

Set up the repository as one npm workspace with five prerendered Vue 3 sites (`sites/home`, `anycontext`, `devcycle`, `gedo`, `aurora`) and three shared packages (`packages/ui`, `content`, `i18n`), all in strict TypeScript, styled with Tailwind CSS 4 through a shared stylesheet in `@levix/ui`, and built with Vite and vite-ssg into `sites/<site>/dist`. Root commands install, build, type check, lint (with the module boundary rules of ADR-0001), test and verify the prerendered output. Each site gets a placeholder home page that exercises routing, prerendering, the shared stylesheet, a shared component and the two other packages. Decisions and alternatives are in [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 (strict), Node.js 22 or newer

**Primary Dependencies**: Vue 3.5, vue-router 5, vite 8, vite-ssg 28, @unhead/vue, Tailwind CSS 4 with @tailwindcss/vite, vue-tsc 3

**Storage**: N/A

**Testing**: Vitest 5 (projects per workspace), @vue/test-utils, jsdom, @vue/server-renderer; ESLint 10 with typescript-eslint, eslint-plugin-vue and eslint-plugin-boundaries

**Target Platform**: static files for Firebase Hosting; current and previous Chrome, Edge, Firefox and Safari

**Project Type**: web, statically prerendered sites in a modular monolith

**Performance Goals**: full build of five sites under 2 minutes; hot reload under 3 seconds

**Constraints**: no browser globals during prerendering; packages consumed from source through `exports`; no per-language URLs (later items)

**Scale/Scope**: 5 sites, 3 packages, 1 page per site

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | Each package exposes only `exports` (`src/index.ts`, plus `styles.css` for `ui`); lint forbids deep imports and any import of a site from outside it |
| Dependencies point toward stable code | Sites depend on packages; packages never on sites (boundary rule) |
| Simplicity first | No task runner, no package builds, explicit routes list, one shared Vite config helper because five sites share it today |
| No speculative code | Packages export only what the placeholder pages use (`PageContainer`, company name, source language); tokens, header, footer, hero, translation come with their own items |
| Testability | Every workspace has a unit test; each home page is rendered on the server in a test |
| Evidence | `npm run check` and `npm run verify:dist` prove every requirement automatically |
| Repository content in English, no references to the tools used to write it | Code, docs and commits in English; attribution off in `.claude/settings.json` |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-workspace-build-setup/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
├── contracts/commands.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
package.json             # private root: workspaces, engines, root scripts
package-lock.json
.npmrc                   # engine-strict=true
.nvmrc                   # 22
.gitignore               # node_modules, dist, .env*, coverage, caches
tsconfig.base.json       # strict compiler options shared by every workspace
eslint.config.js         # flat config, boundary rules
vitest.config.ts         # projects: sites/*, packages/*
tooling/
└── vite-site.ts         # defineSiteConfig(): shared Vite, vite-ssg and test settings
scripts/
└── verify-prerender.mjs # every sites/*/dist/index.html has a non-empty <h1>
packages/
├── ui/
│   ├── package.json     # exports ".", "./styles.css"
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts
│       ├── styles.css   # @import "tailwindcss"; @theme (FEAT-006); @source components
│       └── components/PageContainer.vue (+ PageContainer.test.ts)
├── content/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts     # company facts (name), + index.test.ts
└── i18n/
    ├── package.json
    ├── tsconfig.json
    └── src/index.ts     # SOURCE_LANGUAGE, + index.test.ts
sites/
└── <site>/              # home, anycontext, devcycle, gedo, aurora
    ├── package.json     # @levix/site-<site>: dev, build, preview, typecheck
    ├── index.html
    ├── vite.config.ts   # defineSiteConfig()
    ├── tsconfig.json
    └── src/
        ├── main.ts      # ViteSSG entry
        ├── App.vue
        ├── routes.ts
        ├── styles.css   # @import "@levix/ui/styles.css"
        ├── env.d.ts
        ├── locales/en.json
        └── pages/HomePage.vue (+ HomePage.test.ts)
```

**Structure Decision**: the layout of ADR-0001 and the subsystem pages (`sites/<site>`, `packages/<package>`), plus two folders that are not modules: `tooling/` (build configuration) and `scripts/` (build-time scripts, as named in the technical specification). `functions/` is created by FEAT-033.

## Complexity Tracking

None: no constitution violations.

## Dev Cycle Protocol

### Backlog items and release

FEAT-001 (Workspace and build setup, EPIC-001), release v0.1.0 "Company home".

### Tests (quality-assurance)

- Unit: `PageContainer` renders its slot and its width class; `@levix/content` exports the company name; `@levix/i18n` exports `en` as the source language; each site's `HomePage` renders its heading through `@vue/server-renderer` (no browser globals) and through `@vue/test-utils`.
- Build check: `npm run verify:dist` after `npm run build`.
- Boundary rules: a lint fixture test runs ESLint on in-memory code samples (a site importing another site, a package importing a site, a deep import into a package) and expects each to be reported, so the rules cannot be weakened silently.
- Manual tests: none added; everything in this item is verified automatically. The quickstart lists the hand checks for the reviewer.
- Acceptance: the spec's acceptance scenarios and SC-001 to SC-005.

### Documentation (architecture-docs, user-docs)

- New ADR-0006 "Tailwind CSS 4 with a shared stylesheet theme" (replaces the Tailwind preset named in the design system page; alternatives: Tailwind 3 preset).
- `docs/architecture/ui.md`: `tailwind.preset.ts` becomes `src/styles.css` with the `@theme` block; link ADR-0006.
- `docs/architecture/sites.md`: add `vite.config.ts`, `routes.ts`, the shared `tooling/vite-site.ts`, the workspace names and the output folder.
- `docs/BACKLOG.md`: FEAT-006 description "a Tailwind preset" becomes "a shared Tailwind theme".
- `README.md`: a "Development" section (requirements, install, run one site, check, build) following `user-docs`.
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow in this item: FEAT-003 adds CI that runs `npm ci`, `npm run check`, `npm run build` and `npm run verify:dist`.
- Version impact: minor (first code of v0.1.0); the root `package.json` is private with version `0.0.0`, and the release item sets the version files.
- Observability: none at runtime; build and check commands fail with the file and reason.

### Security, migration and rollback

- No secrets; `.env*` files are ignored. The lock file pins every dependency; `npm ci` refuses a lock file out of date.
- No data or migrations.
- Rollback: nothing is deployed by this item; revert the merge commit.
