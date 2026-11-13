# Research: Release Information at Build Time

## R1. When to read the release: build time, refreshed by a watch

- **Decision**: read the release while building the product site and keep the site current with an hourly watch that redeploys a site when its published version differs from the latest release.
- **Rationale**: the version and the links are in the prerendered page (works without JavaScript, no layout shift, no request per visitor); the strict content security policy (ADR-0010) stays as is; the anonymous GitHub API limit (60 requests per hour per address) never affects visitors.
- **Alternatives considered**: a request from the browser on each visit (suggested by the owner as "the site fetches the latest link"): always current, but it needs `connect-src https://api.github.com`, hits the anonymous limit on shared networks and shows a placeholder until the answer comes; the `releases/latest` link alone (today): never stale, but shows no version and no per-system link. A notification sent by each product's release workflow: immediate, but needs a token with write access to this repository stored in every product.

## R2. What the watch compares

- **Decision**: each product site publishes `/release.json` (`{ product, version, builtAt }`); the watch fetches it from the production address and compares `version` with the latest tag.
- **Rationale**: stateless, compares with what visitors actually see, and a failed or skipped deploy is retried on the next run without extra state.
- **Alternatives considered**: a stored "last seen tag" (in a branch, a variable or a cache): drifts from what is deployed when a deploy fails.

## R3. How the watch deploys

- **Decision**: dispatch `deploy.yml` (`workflow_dispatch`, input `sites`) with the workflow's token and `actions: write`.
- **Rationale**: reuses the deploy that runs CI first, publishes only the chosen sites, and keeps one production deploy at a time (its concurrency group).

## R4. Which release

- **Decision**: available: `GET /repos/{repo}/releases/latest` (newest non-draft, non pre-release). Preview: the first non-draft entry of `GET /repos/{repo}/releases?per_page=10`. In development: nothing is read.
- **Rationale**: matches the statuses of ADR-0014 and the `make_latest` rule of AnyContext's release workflow (release candidates are pre-releases and never "latest").

## R5. Where the code lives

- **Decision**: facts (`releases` repository, `downloads` per system) in `@levix/content`; the reader (`readRelease(product, fetch)`, pure, testable with a fake fetch) in `@levix/content` too, exported from a separate entry point used only at build time; the Vite plugin in `tooling/vite-site.ts` calls it for the site's product, exposes the result to the page as a virtual module and emits `release.json`; the watch is a Node script in `scripts/` with its test.
- **Rationale**: one source of truth for the repository (also used by the release candidate announcements, which a test checks), no network in unit tests, the sites stay free of build logic.

## R6. Failure policy

- **Decision**: any error (network, status, limit, missing asset) is a warning in the build log; the panel falls back to the install link; `release.json` gets `version: null`, so the next watch redeploys.
- **Rationale**: a third-party outage must not block a deploy of unrelated changes (SC-003).
