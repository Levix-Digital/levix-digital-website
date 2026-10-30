# Implementation Plan: Custom Domains for the Company Site and the Product Sites

**Branch**: `feat/004-custom-domains` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-custom-domains/spec.md`

## Summary

The zone of `levix.digital` is now at Cloudflare and Levi connected the five domains to their hosting sites in the Firebase console. The repository records the domain of each site in `domains.json`, adds a read-only `npm run domains:status` that asks the Firebase Hosting REST API (`projects.sites.customDomains`, v1beta1) for each domain's ownership, host and certificate state and the DNS records still needed, and makes `verify:live` request each published site's domain after a deploy. ADR-0009 records the move to Cloudflare and the rule that Firebase-hosted names are not proxied. Nothing in the repository changes DNS or the domains. Decisions in [research.md](research.md); commands in [contracts/domains.md](contracts/domains.md).

## Technical Context

**Language/Version**: JavaScript (ES modules) typed with JSDoc and checked by `tsc --checkJs`, as the other scripts; Node.js 22 and 24

**Primary Dependencies**: none new; `gcloud` for the caller's access token (as `hosting:setup`), global `fetch` for the REST API

**Storage**: `domains.json` (versioned)

**Testing**: Vitest with an injected runner and an injected JSON client (as `hosting-setup.test.mjs`); `verify-live.test.mjs` with a fake fetch

**Target Platform**: the maintainer's machine (Windows or Linux) for the commands; GitHub Actions for the deploy check

**Project Type**: hosting operations for the static sites

**Performance Goals**: N/A (DNS propagation and certificate issue take up to 24 hours, outside the code)

**Constraints**: read-only towards DNS and Firebase domains; no stored credentials; the deploy identity is not changed

**Scale/Scope**: 5 hosting targets, 5 domains (`www` is redirected by Cloudflare)

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | No module changes; the script lives in `scripts/` and reuses `scripts/lib/hosting-config.mjs` and `scripts/lib/run.mjs` |
| Simplicity first | One read-only command; records come from Firebase instead of being hard-coded; no Cloudflare API client |
| No speculative code | No setup command (the domains already exist), no security headers (FEAT-005), no automation of the Cloudflare zone |
| Testability | Calls to Google Cloud go through the injected runner and JSON client; the record formatting is a pure function |
| Security | The caller's own login; no new role or credential for the deploy identity; nothing writes DNS or domains |
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
domains.json                       # custom domain per hosting target (new)
scripts/
├── lib/domains-config.mjs         # reads and validates domains.json against the targets (new)
├── lib/domains-config.test.mjs    # (new)
├── domains-status.mjs             # domains:status (new)
├── domains-status.test.mjs        # (new)
├── verify-live.mjs                # also checks the custom domains (changed)
└── verify-live.test.mjs           # (changed)
docs/adr/0009-dns-at-cloudflare-with-firebase-hosted-names-not-proxied.md  # (new)
package.json                       # domains:status script
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-004 (DNS for levix.digital and product subdomains, EPIC-001), release v0.1.0 "Company home".

### Tests (quality-assurance)

- `domains-config`: every target has one domain, a domain appears once, unknown targets fail, the file matches FR-001.
- `domains-status`: all active succeeds; any of ownership, host or certificate not active fails naming the domain and states; a 404 says the domain is not connected; `ADD` desired and `REMOVE` discovered records become rows with hosts relative to the zone (`@`, `gedo`), records with no action are hidden; a failed token stops with the reason. The runner and the JSON client are injected, as in `hosting-setup.test.mjs`.
- `verify-live`: the default address and the domain are both requested and reported; a domain answering 404 fails naming it.
- Manual tests: "Each domain shows its site over HTTPS", "www redirects to the apex", "Mail still delivered" (need the real DNS).
- Acceptance: the spec's scenarios and SC-001 to SC-004.

### Documentation (architecture-docs, user-docs)

- New ADR-0009 "DNS at Cloudflare with Firebase-hosted names not proxied", amending ADR-0003 (which said Hostinger); `docs/product/TECH_SPEC.md` integration row and constraint changed to Cloudflare; the constitution regenerated.
- `docs/architecture/hosting.md`: the domains, the Cloudflare records, the status command, rollback; the table's domain column no longer says "FEAT-004".
- `README.md`: "Domains" in the "Hosting" section.
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change: the deploy already runs `verify:live` for the published sites, which now also requests their domains. Because of that, this pull request is merged only after `domains:status` succeeds (otherwise the first deploy after the merge fails on the domains).
- Version impact: none; part of release v0.1.0.
- Observability: `domains:status` prints each state and what is missing; the deploy run lists each address checked.

### Security, migration and rollback

- No secrets; the status command uses the caller's `gcloud` login (Levi's `levix.digital.admin@gmail.com`, owner of the project).
- Rollback: the repository change is reverted with the pull request; the DNS records are changed back in the Cloudflare dashboard. The `*.web.app` addresses keep working throughout.
- No data or migrations.
