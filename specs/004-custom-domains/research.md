# Research: Custom Domains

## R1. Connecting the domains: REST API instead of the console

- **Decision**: a script calls the Firebase Hosting REST API (`v1beta1`, `projects.sites.customDomains`: `get`, `create` with `customDomainId`) with the caller's `gcloud` access token.
- **Rationale**: repeatable and idempotent like `hosting:setup`, testable, and the API returns the exact DNS records needed (`requiredDnsUpdates.desired` and `.discovered`, each record with `requiredAction` `ADD`, `REMOVE` or `NONE`) and the states (`ownershipState`, `hostState`, `cert.state`). The pinned Firebase CLI has no command for custom domains.
- **Alternatives**: the Firebase console by hand for six domains (not repeatable, no status check in the repository); Terraform `google_firebase_hosting_custom_domain` (a new tool and state for six resources).

## R2. DNS records: printed for the maintainer, not written

- **Decision**: the commands print the records; Levi enters them in the Hostinger panel.
- **Rationale**: ADR-0003 keeps DNS at Hostinger with a manual step; the zone also holds the mail records, which a script should not risk; a Hostinger API token would be a new long-lived credential for a change made once.
- **Alternatives**: the Hostinger DNS API (token, new client, writes to the zone with mail records); moving the zone to Cloud DNS (contradicts the technical specification).

## R3. Host names in the form Hostinger expects

- **Decision**: print the host relative to the zone: `@` for `levix.digital`, `www`, `anycontext`, `_acme-challenge.gedo`, and so on; the full name stays in a second column.
- **Rationale**: the Hostinger zone editor takes names relative to the zone; full names entered there become `name.levix.digital.levix.digital`.

## R4. `www`

- **Decision**: `www.levix.digital` is a custom domain of the home site with `redirectTarget: levix.digital` (permanent redirect, path kept).
- **Rationale**: visitors type it; a redirect keeps one canonical address for search engines.
- **Alternatives**: serving the site at both (duplicate content); no `www` (typed visits fail).

## R5. What "active" means

- **Decision**: a domain is active when `ownershipState` is `OWNERSHIP_ACTIVE`, `hostState` is `HOST_ACTIVE` and `cert.state` is `CERT_ACTIVE`.
- **Rationale**: ownership alone leaves the site unreachable or served from two places; the certificate is the last step and the one visitors see.

## R6. Deploy check of the domains

- **Decision**: `verify:live` requests both the default address and the domain of each published site; the workflow is unchanged.
- **Rationale**: a record changed at Hostinger shows up on the next deploy, at no extra cost; the redirect of `www` is checked manually, since it does not change with deploys.
