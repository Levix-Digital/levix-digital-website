# Implementation Plan: Release Information at Build Time

**Branch**: `feat/011-release-info-build-time` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

## Summary

Each product's data names its public releases repository and, when it ships installers, the asset name per operating system. When a product site is built, a Vite plugin reads the product's latest release from the GitHub REST API, passes the version and direct installer links to the availability panel of FEAT-037 and writes `/release.json`. An hourly workflow compares each site's `/release.json` with the latest release and dispatches the production deploy for the sites that differ. Any failure falls back to today's install link. Decisions in [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3, Node.js 22

**Primary Dependencies**: none new (global `fetch`)

**Storage**: none; `/release.json` in each product site's output

**Testing**: Vitest (reader with a fake fetch, plugin, panel render, refresh script with fake fetch and dispatcher); `verify:dist`

**Target Platform**: static product sites on Firebase Hosting; GitHub Actions

**Constraints**: CSP unchanged (ADR-0010); a build never fails because of the releases service; no secret beyond the workflow token

**Scale/Scope**: five product sites, one API call per product site build, five per refresh run

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | Facts and the reader in `@levix/content` (exported from its entry point; pages never call it), rendering in `@levix/ui` (`BUILD_RELEASE`), build glue in `tooling/`, the refresh in `scripts/` |
| One responsibility per unit | Reader (fetch and pick), plugin (expose and emit), panel (render), refresh (compare and dispatch) |
| Simplicity first | No stored state: the deployed `release.json` is the state; the existing deploy workflow does the publishing |
| Explicit errors | Every failure is logged with the product and cause; fallback is explicit (`version: null`) |
| Testability | Reader and refresh take `fetch` and the dispatcher as parameters |
| Facts only (ADR-0005) | Asset names taken from AnyContext's release workflow |
| Security | Read-only public API; the refresh needs only `actions: write` on this repository |

## Project Structure

```text
specs/011-release-info-build-time/{spec,plan,research,tasks}.md
packages/content/src/types.ts                    # ReleaseSource, Platform (changed)
packages/content/src/products/*.ts               # releases repository; AnyContext installers (changed)
packages/content/src/portfolio.ts                # validation of releases and downloads (changed)
packages/content/src/releases.ts + test          # readRelease, releaseMarker (new)
functions/src/products.test.ts                   # repositories checked against @levix/content (changed)
packages/ui/src/release/build-release.ts         # BUILD_RELEASE (new)
tooling/release-info.ts + test                   # the plugin: build constant, release.json (new)
packages/ui/src/components/AvailabilityPanel.vue # version and per-system links (changed)
packages/i18n/src/availability.en.json           # "Download {version}", system names, "All releases" (changed)
tooling/vite-site.ts                             # uses the plugin (changed)
sites/{anycontext,devcycle,gedo,aurora,docmapper}/src/pages/HomePage.vue  # pass the release (changed)
scripts/release-refresh.mjs + test                 # compare and dispatch (new)
.github/workflows/release-refresh.yml              # hourly and on demand (new)
.github/workflows/ci.yml                         # GITHUB_TOKEN for the build (changed)
scripts/verify-prerender.mjs                     # release.json on product sites (changed)
docs/adr/0016-release-information-read-at-build-time.md (new)
docs/architecture/{content,ui,sites,ci}.md, TECDOC.md, README.md, tests/MANUAL_TESTS.md (changed)
```

## Dev Cycle Protocol

### Backlog items and release

FEAT-016. Built on FEAT-037 (`feat/010-product-availability-signup`), so it goes in the same release as that feature (v0.1.0 "Company home"), moved from v0.2.0 at the owner's request.

### Tests

- `content`: `releases` required for every product and equal to the announcement's repository; `downloads` only with valid systems and non-empty names; `readRelease`: available picks `releases/latest`, preview picks the first non-draft, in development reads nothing, missing asset skipped with a warning, HTTP error, network error and rate limit give `null` with the cause, token sent when given.
- `ui`: panel shows "Download vX.Y.Z" and one link per system when a release is given, the install link alone when not; the disabled state is unchanged.
- `tooling`: plugin resolves the virtual module and emits `release.json` with `version: null` on failure.
- `scripts`: the refresh dispatches only differing sites in one run, nothing when equal or on a dry run, fails on a dispatch failure, skips a site without `release.json` (the merge deploy publishes it) and a product in development, reports an unreadable marker or release.
- `verify:dist`: each product site has a valid `release.json`.
- Manual test MT-PROD-003 "Download button follows a new release".

### Documentation

ADR-0016; `content.md` (release source and reader), `ui.md` (panel props), `sites.md` (`release.json`), `ci.md` (refresh, token); README (how the site follows releases, how to run the refresh by hand); TECDOC index.

### CI, release and observability

- `ci.yml` build step gets `GITHUB_TOKEN` so the reader is authenticated.
- `release-refresh.yml`: `schedule: '41 * * * *'` and `workflow_dispatch`, `permissions: actions: write, contents: read`, runs `node scripts/release-refresh.mjs`; summary of compared sites in the job summary.
- No version files.

### Security, migration and rollback

No new secret, no personal data. Rollback: revert the pull request; the panel goes back to the install link, the refresh stops.

## Execution steps and milestones

1. Content: release source, validation, reader, single source with the announcements.
2. Panel and text.
3. Plugin, product pages, `release.json`, `verify:dist`.
4. Refresh script and workflow; token in CI.
5. Docs, ADR, manual test, checks.
