# Implementation Plan: Custom Domains for the Company Site and the Product Sites

**Branch**: `feat/004-custom-domains` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-custom-domains/spec.md`

## Summary

A new file, `domains.json`, lists the custom domains of each hosting target. A new script, `scripts/domains.mjs`, with two commands (`npm run domains:setup` and `npm run domains:status`), uses the caller's `gcloud` login and the Firebase Hosting REST API (`projects.sites.customDomains`, v1beta1) to connect each domain to its site (creating only what is missing, `www` as a redirect to the apex) and prints, per domain, the DNS records Firebase reports as needed (to add) and as found but conflicting (to remove), in the form they are entered in the Hostinger DNS zone. `status` ends with success only when every domain has active ownership, host and certificate. `verify:live` learns to check the custom domains too, so the production deploy checks both addresses of every published site. The maintainer adds the records at Hostinger by hand; the scripts never change DNS. Decisions in [research.md](research.md); commands in [contracts/domains.md](contracts/domains.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) typed with JSDoc and checked by `tsc --checkJs`, as the other scripts; Node.js 22 and 24

**Primary Dependencies**: none new; `gcloud` for the caller's access token (as `hosting:setup`), global `fetch` for the REST API

**Storage**: `domains.json` (versioned)

**Testing**: Vitest with an injected runner and an injected JSON client (as `hosting-setup.test.mjs`); `verify-live.test.mjs` with a fake fetch

**Target Platform**: the maintainer's machine (Windows or Linux) for the commands; GitHub Actions for the deploy check

**Project Type**: hosting operations for the static sites

**Performance Goals**: N/A (DNS propagation and certificate issue take up to 24 hours, outside the code)

**Constraints**: no DNS writes; no stored credentials; the deploy identity is not changed

**Scale/Scope**: 5 hosting targets, 6 domain names (apex, `www`, 4 product subdomains)

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | No module changes; the script lives in `scripts/` and reuses `scripts/lib/hosting-config.mjs` and `scripts/lib/run.mjs` |
| Simplicity first | One script with two commands; records come from Firebase instead of being hard-coded; no Hostinger API client |
| No speculative code | No security headers (FEAT-005), no automation of the Hostinger zone, no extra aliases beyond `www` |
| Testability | Calls to Google Cloud go through the injected runner and JSON client; the record formatting is a pure function |
| Security | The caller's own login; no new role or credential for the deploy identity; the scripts never touch DNS |
| Repository content in English, no references to the tools used to write it | Code, docs and messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/004-custom-domains/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
├── contracts/domains.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
domains.json                       # custom domains per hosting target (new)
scripts/
├── lib/domains-config.mjs         # reads and validates domains.json against the targets (new)
├── lib/domains-config.test.mjs    # (new)
├── domains.mjs                    # domains:setup and domains:status (new)
├── domains.test.mjs               # (new)
├── verify-live.mjs                # also checks the custom domains (changed)
└── verify-live.test.mjs           # (changed)
.github/workflows/deploy.yml       # unchanged: verify:live already runs per published site
package.json                       # domains:setup, domains:status scripts
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-004 (DNS for levix.digital and product subdomains, EPIC-001), release v0.1.0 "Company home".

### Tests (quality-assurance)

- `domains-config`: every domain belongs to a known target; a redirect points to a domain of the same target; duplicates and unknown targets fail; the default list matches FR-001.
- `domains setup`: preflight failure stops before any create; a missing domain is created (with `redirectTarget` for `www`) and reported `created`; an existing one is reported `exists` and not created again; an API error names the domain.
- Record formatting: `desired` records with action `ADD` and `discovered` records with action `REMOVE` become rows with the Hostinger host (`@`, `www`, `anycontext`, `_acme-challenge.gedo` ...); records with no action are not listed; records of other names never appear.
- `domains status`: exit success only when every domain has `OWNERSHIP_ACTIVE`, `HOST_ACTIVE` and `CERT_ACTIVE`; otherwise it fails naming the domains and their states.
- `verify-live`: with a domain configured, both the default address and the domain are requested; the `www` redirect is not requested by the deploy check (it is covered by the manual test).
- Manual tests: "Each domain shows its site over HTTPS", "www redirects to the apex", "Mail still delivered after the DNS change" (need the real DNS).
- Acceptance: the spec's scenarios and SC-001 to SC-005.

### Documentation (architecture-docs, user-docs)

- `docs/architecture/hosting.md`: the domains (structure, behavior of the commands, the Hostinger step, how to roll back); the table's domain column no longer says "FEAT-004".
- No new ADR: ADR-0003 already decides one site per domain with DNS at Hostinger and the manual step; `research.md` records the smaller choices.
- `README.md`: a "Domains" part in the "Hosting" section (the two commands and the Hostinger step).
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change: the deploy already runs `verify:live` for the published sites, which now also requests their domains. Because of that, this pull request is merged only after `domains:status` succeeds (otherwise the first deploy after the merge fails on the domains).
- Version impact: none; part of release v0.1.0.
- Observability: `domains:status` prints each state and what is missing; the deploy run lists each domain checked.

### Security, migration and rollback

- No secrets; the commands use the caller's `gcloud` login (Levi's `levix.digital.admin@gmail.com`, owner of the project).
- Rollback: put back the previous Hostinger records (the commands print the ones to remove before they are removed; a copy of the zone is taken before the change), and remove a domain from its site in the Firebase console (Hosting, the site, the domain, "Delete") or with the API. The `*.web.app` addresses keep working throughout.
- No data or migrations.
