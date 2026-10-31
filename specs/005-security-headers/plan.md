# Implementation Plan: Security Headers for Every Site

**Branch**: `feat/005-security-headers` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-security-headers/spec.md`

## Summary

Every response of the five sites gets seven security headers (HSTS, a strict Content Security Policy, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`), set in `firebase.json` on the `**` rule of each target. The policy is defined once in `scripts/lib/security-headers.mjs`; a unit test keeps the five copies in `firebase.json` equal to it, `verify:hosting` checks the served headers in the emulator, `verify:dist` refuses inline code the policy would block, Lighthouse fails on console errors, and `verify:live` checks the headers at both addresses after each deploy. The policy allows only the site's own origin today; later features extend it. Decisions in [research.md](research.md); values in [contracts/headers.md](contracts/headers.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) typed with JSDoc and checked by `tsc --checkJs`, as the other scripts; Node.js 22 and 24

**Primary Dependencies**: none new

**Storage**: `firebase.json` (versioned)

**Testing**: Vitest (`scripts/lib/security-headers.test.mjs`, `scripts/verify-live.test.mjs` with a fake fetch, a test for the inline-code scan); the hosting emulator (`verify:hosting`); Lighthouse CI in the emulator

**Target Platform**: Firebase Hosting (five sites), Cloudflare proxy on the apex; GitHub Actions for the checks

**Project Type**: hosting configuration for the static sites

**Performance Goals**: N/A (headers add a few hundred bytes per response)

**Constraints**: static hosting (no per-request nonce); no `'unsafe-inline'` or `'unsafe-eval'`; no HSTS preload

**Scale/Scope**: 5 hosting targets, 7 headers

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | No package changes; the policy module lives in `scripts/lib/` next to the hosting configuration reader |
| Simplicity first | Literal headers in `firebase.json`, compared by a test; no generator |
| No speculative code | The policy allows only what the sites load today; Google Analytics, functions and App Check origins come with their features |
| Testability | Header comparison and inline-code scan are pure functions; live checks use an injected fetch |
| Security | This is the security change; no secrets, no new credentials |
| Repository content in English, no references to the tools used to write it | Code, docs and messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/005-security-headers/
├── spec.md
├── plan.md
├── research.md
├── contracts/headers.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
firebase.json                          # security headers on the ** rule of each target (changed)
scripts/
├── lib/security-headers.mjs           # the policy and the comparison (new)
├── lib/security-headers.test.mjs      # firebase.json matches the policy (new)
├── lib/inline-code.mjs                # finds inline code in built HTML (new)
├── lib/inline-code.test.mjs           # (new)
├── verify-prerender.mjs               # also refuses inline code (changed)
├── verify-hosting.mjs                 # also checks the headers (changed)
├── verify-live.mjs                    # also checks the headers (changed)
└── verify-live.test.mjs               # (changed)
lighthouserc.json                      # errors-in-console asserted (changed)
docs/adr/0010-strict-content-security-policy-extended-per-feature.md  # (new)
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-005 (Security headers, EPIC-001), release v0.1.0 "Company home".

### Tests (quality-assurance)

- `security-headers`: every target of `firebase.json` has exactly the policy on its `**` rule; a missing header, a different value or an extra security header fails naming the target and the header; `Cache-Control` rules are untouched.
- `inline-code`: a module script with `src` passes; inline `<script>`, `<style>`, `style=""` and `onclick=""` are each reported; JSON-LD (`type="application/ld+json"`) is reported too, since a later feature that needs it adds a hash.
- `verify-live`: matching headers pass; a missing or different header fails naming the address and header; the existing status and content-type checks are kept.
- `verify:hosting` (emulator, CI): headers on `/`, an asset and an unknown path of every site.
- Lighthouse (emulator, CI): `errors-in-console` asserted on the audited pages.
- Manual test: "Security headers rated A or better" (Mozilla HTTP Observatory on `levix.digital`) and "No blocked resource in the browser console" on the five domains.
- Acceptance: the spec's scenarios and SC-001 to SC-004.

### Documentation (architecture-docs, user-docs)

- New ADR-0010 "Strict Content Security Policy extended per feature".
- `docs/architecture/hosting.md`: serving rules gain the security headers; responsibilities no longer exclude them; how a feature extends the policy.
- `docs/product/TECH_SPEC.md`: unchanged requirement, link to the ADR.
- `README.md`: the checks section mentions the header checks, if it lists them.
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change: `verify:dist`, `verify:hosting` and Lighthouse already run in CI and the preview; `verify:live` already runs after each production deploy.
- Before the merge, the headers of the pull request's preview channel are read from a machine that can reach it (R8).
- Version impact: none; part of release v0.1.0.
- Observability: each check prints the header that differs and its value.

### Security, migration and rollback

- No secrets.
- HSTS cannot be withdrawn from browsers that saw it before it expires (one year); every name under `levix.digital` must stay on HTTPS. No preload.
- Rollback: revert the pull request and deploy, or roll back each site in the Firebase console; the other headers disappear at once, HSTS stays in browsers until it expires.
- No data or migrations.
