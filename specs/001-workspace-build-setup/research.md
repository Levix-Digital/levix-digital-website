# Research: Workspace and Build Setup

Decisions taken while planning FEAT-001, with the alternatives considered. Versions are the latest stable releases on 2026-10-30, pinned by the lock file.

## Package manager and workspace

- **Decision**: npm workspaces (`sites/*`, `packages/*`), one committed `package-lock.json`, `engines.node >= 22` enforced with `engine-strict=true` in `.npmrc`, and `.nvmrc` set to 22.
- **Rationale**: chosen in ADR-0001 and the technical specification; npm ships with Node.js, so there is nothing else to install. Node.js 22 is the runtime of the Cloud Functions in the technical specification.
- **Alternatives**: pnpm (stricter dependency isolation, but one more tool for contributors and CI); Turborepo or Nx (task caching that five small sites do not need yet).

## Consuming packages from source

- **Decision**: each package's `package.json` has an `exports` map that points at its TypeScript source (`"."` to `src/index.ts`, `"./styles.css"` for `ui`). Sites depend on packages with `"*"` workspace versions. Nothing is built or published.
- **Rationale**: Vite and TypeScript (`moduleResolution: "bundler"`) both resolve the `exports` map, so a change to a package is seen at once by every site in development and build, and an import of a path not in `exports` already fails to resolve.
- **Alternatives**: building each package to `dist/` (a watch step per package and stale builds); TypeScript path aliases (bypass the `exports` map, so deep imports would work).

## Prerendering

- **Decision**: vite-ssg 28 with vue-router 5 and `@unhead/vue`; each site lists its routes in `src/routes.ts` and exports `createApp = ViteSSG(App, { routes })` from `src/main.ts`.
- **Rationale**: chosen in ADR-0002. An explicit routes list is enough for sites with a handful of pages.
- **Alternatives**: file-based routing plugin (one more plugin and generated types for a few routes); a hand-written prerender script with `@vue/server-renderer` (vite-ssg already does it, with head management).

## TypeScript version

- **Decision**: TypeScript 6.0 with vue-tsc 3.
- **Rationale**: TypeScript 7 (the native compiler) no longer exposes the JavaScript API (`typescript/lib/tsc`) that vue-tsc loads; vue-tsc fails to start with it (checked on 2026-10-30). TypeScript 6.0 works and reports type errors inside `.vue` files.
- **Alternatives**: TypeScript 7 for `.ts` files and no type checking of `.vue` files (leaves components unchecked, against FR-007).

## Styling

- **Decision**: Tailwind CSS 4 with the `@tailwindcss/vite` plugin. `packages/ui/src/styles.css` holds `@import "tailwindcss"`, the shared theme (`@theme`, filled by FEAT-006) and an `@source` for the package's components; each site's `src/styles.css` imports `@levix/ui/styles.css`.
- **Rationale**: Tailwind 4 configures the theme in CSS; a shared stylesheet replaces the JavaScript preset of Tailwind 3 and keeps the tokens in one CSS file. This changes the `tailwind.preset.ts` named in the design system page, recorded in a new ADR.
- **Alternatives**: Tailwind 3 with a `tailwind.preset.ts` (an older major version, configured in JavaScript).

## Module boundaries in lint

- **Decision**: ESLint 10 flat config with typescript-eslint, eslint-plugin-vue and eslint-plugin-boundaries (element types `site` and `package` by folder; a site may import packages through their entry points only; a package may import other packages through their entry points only; nothing imports a site from outside it).
- **Rationale**: the boundary rules of ADR-0001 must be checked by lint; the plugin classifies files by path, so relative imports such as `../../anycontext/src/...` are caught as well as package names.
- **Alternatives**: `no-restricted-imports` patterns (match import strings, so relative paths across folders are hard to express and easy to miss); review only (not repeatable).
- **Fallback**: if the plugin does not run on ESLint 10, use ESLint 9 (the latest version the plugin supports) rather than weaker rules.

## Unit tests

- **Decision**: Vitest 5 with one root `vitest.config.ts` listing `sites/*` and `packages/*` as projects; jsdom for component tests; `@vue/test-utils` to mount components; `@vue/server-renderer` to render each site's home page to a string, which proves it renders without browser globals.
- **Rationale**: Vitest reuses the Vite configuration of each site; projects give one root command and per-workspace runs.

## Shared Vite configuration

- **Decision**: `tooling/vite-site.ts` exports `defineSiteConfig()` (Vue plugin, Tailwind plugin, vite-ssg options, `dist` output, test settings), used by the five `vite.config.ts` files.
- **Rationale**: the five sites build the same way; one place to change it. `tooling/` holds build configuration only and is not a module of the architecture, so sites importing it is allowed by the boundary rules.

## Prerender verification

- **Decision**: `scripts/verify-prerender.mjs` checks that every `sites/*/dist/index.html` exists and contains a non-empty `<h1>`; run by `npm run verify:dist` after the build, locally and in CI (FEAT-003).
- **Rationale**: SC-002 must be checked automatically; reading the built file is the most direct proof.
