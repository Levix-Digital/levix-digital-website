# Research: Custom Domains

## R1. DNS at Cloudflare (supersedes the Hostinger assumption)

- **Decision**: the zone of `levix.digital` is at Cloudflare (moved by Levi on 2026-10-30); the registrar stays where it is. New ADR-0009 records it and amends ADR-0003 and the technical specification.
- **Rationale**: Levi's choice; Cloudflare also routes the mail of the domain (Email Routing).

## R2. Firebase-hosted names are not proxied

- **Decision**: the records of the four product subdomains are `CNAME <site>.web.app` with the proxy off ("DNS only"). The apex stays as Levi set it (proxied, with the `www` redirect rule) while its certificate is active; if renewal fails, it moves to Firebase's records with the proxy off and the redirect becomes a `www` custom domain in Firebase.
- **Rationale**: Firebase verifies ownership and issues the certificate by looking at the records; a proxied name shows Cloudflare's addresses instead, so the subdomains stayed "Site Not Found" with ownership missing (seen 2026-10-30). Firebase already serves from a global CDN, so the proxy adds no caching value.
- **Alternatives**: keep the proxy and add the DNS-01 TXT records (works for the certificate, but two CDNs in front of the site and Firebase's host check keeps flagging it).

## R3. Domains connected in the console, checked from the repository

- **Decision**: no setup command; a read-only `domains:status` calls the Firebase Hosting REST API (`v1beta1`, `projects.sites.customDomains.get`) with the caller's `gcloud` token.
- **Rationale**: the domains already exist and are created once; the status (ownership, host, certificate, `requiredDnsUpdates`) is what changes and what breaks. The pinned Firebase CLI has no command for custom domains.

## R4. What "active" means

- **Decision**: `ownershipState` `OWNERSHIP_ACTIVE`, `hostState` `HOST_ACTIVE` and `cert.state` `CERT_ACTIVE`.
- **Rationale**: ownership alone leaves the site unreachable or served from two places; the certificate is the last step and the one visitors see.

## R5. Deploy check of the domains

- **Decision**: `verify:live` requests the default address and the domain of each published site; the workflow is unchanged.
- **Rationale**: a record changed at the DNS provider shows up on the next deploy; the `www` redirect does not change with deploys and is a manual test.
