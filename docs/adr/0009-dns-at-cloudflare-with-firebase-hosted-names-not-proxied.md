---
id: 9
title: DNS at Cloudflare with Firebase-hosted names not proxied
status: accepted
date: '2026-10-30'
version: v0.1.0
subsystems: [hosting]
supersedes: []
superseded_by: []
amends: [3]
amended_by: []
---

# ADR-0009: DNS at Cloudflare with Firebase-hosted names not proxied

## Context

ADR-0003 kept the DNS of `levix.digital` at Hostinger. On 2026-10-30 Levi moved the zone to Cloudflare (name servers `ernest.ns.cloudflare.com` and `ines.ns.cloudflare.com`), which also routes the domain's mail, and connected the five domains to their hosting sites in the Firebase console. With the product subdomains proxied by Cloudflare, Firebase saw Cloudflare's addresses instead of its own records: ownership stayed missing, no certificate was issued and the subdomains answered "Site Not Found".

## Decision

The DNS zone of `levix.digital` is at Cloudflare and is edited in the Cloudflare dashboard. Every name served by Firebase Hosting has the records Firebase asks for with the Cloudflare proxy off ("DNS only"): the product subdomains are `CNAME <site-id>.web.app`. The apex keeps the setup Levi made (proxied, with a Cloudflare rule that redirects `www.levix.digital` to `https://levix.digital`) while Firebase reports it active; if its certificate stops renewing, it moves to Firebase's records without the proxy and `www` becomes a redirecting custom domain in Firebase. The domains are connected in the Firebase console; the repository lists them in `domains.json` and checks them with `npm run domains:status` and after every deploy, and never changes DNS or the domains.

## Alternatives Considered

- **Keep Hostinger DNS**: Levi moved the zone; Cloudflare also gives mail routing and redirect rules.
- **Proxy every name through Cloudflare**: two CDNs in front of the sites, Firebase's ownership and host checks see Cloudflare instead of Firebase, and certificates need DNS challenge records kept by hand.
- **Manage the records from the repository (Cloudflare API or Terraform)**: a new long-lived token for a zone that changes rarely and also holds the mail records.

## Consequences

Firebase verifies the subdomains and issues their certificates by itself; Cloudflare's caching and protection do not apply to them (Firebase's CDN serves them). A record changed in the dashboard shows up in `domains:status` and fails the next deploy's address check. A new product site needs its record added in Cloudflare and its domain connected in the console and listed in `domains.json`.
