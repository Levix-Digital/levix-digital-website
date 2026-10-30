---
title: Hosting
summary: One Firebase project with a hosting site per domain (DNS at Cloudflare), keyless deploys from the repository and a preview channel per pull request.
code: [firebase.json, .firebaserc, domains.json, scripts, .github/workflows/preview.yml]
---

# Hosting

One Firebase project with a hosting site per domain (DNS at Cloudflare), keyless deploys from the repository and a preview channel per pull request.

## Responsibilities

Owns where and how the built sites are served: the Firebase project, its hosting sites, the serving rules of each site (URLs, cache headers), the custom domains and their DNS records, the deploy identity, and the commands that set up, publish, preview and check. Does not own the pages (sites), the checks and production deploys on merge ([Continuous integration and deploy](ci.md)) or the security headers (FEAT-005).

## Structure

- `.firebaserc`: the project (`levix-digital`) and the hosting site of each target.
- `domains.json`: the custom domain of each target, read by `scripts/lib/domains-config.mjs`.
- `firebase.json`: one `hosting` entry per target, serving `sites/<target>/dist`.
- `scripts/hosting-setup.mjs`: one-time setup (`npm run hosting:setup`).
- `scripts/hosting-deploy.mjs`: live and preview deploys (`npm run deploy`, `npm run deploy:preview`).
- `scripts/verify-hosting.mjs`: checks the serving rules in the hosting emulator (`npm run verify:hosting`).
- `scripts/domains-status.mjs`: read-only state of the custom domains (`npm run domains:status`).
- `scripts/verify-live.mjs`: checks the default address and the domain of published sites (`npm run verify:live`).
- `scripts/lib/`: reading the configuration and running commands (the runner the tests replace).
- `.github/workflows/preview.yml`: the preview of every pull request.

| Target | Hosting site | Default address | Domain |
|---|---|---|---|
| `home` | `levix-digital` | https://levix-digital.web.app | levix.digital |
| `anycontext` | `levix-anycontext` | https://levix-anycontext.web.app | anycontext.levix.digital |
| `devcycle` | `levix-devcycle` | https://levix-devcycle.web.app | devcycle.levix.digital |
| `gedo` | `levix-gedo` | https://levix-gedo.web.app | gedo.levix.digital |
| `aurora` | `levix-aurora` | https://levix-aurora.web.app | aurora.levix.digital |

The project's other services (Firestore, functions) run in Montreal (`northamerica-northeast1`); hosting itself is served from Firebase's global CDN.

## Behavior

**Serving.** Clean URLs: `/about` serves `about.html` and `/about.html` redirects to `/about`; no trailing slash; an unknown path answers 404. Pages and other unfingerprinted files are sent with `Cache-Control: no-cache`, so a new release is seen at once; files under `/assets/` carry a content hash in their name and are sent with `public, max-age=31536000, immutable`. When two header rules match, the later one wins, so the `/assets/**` rule comes after the `**` rule.

**Setup.** `npm run hosting:setup` uses the caller's own `gcloud` and Firebase CLI logins. It stops before changing anything when the project does not exist, billing is not enabled or the caller is not an owner. Then, for each resource, it reads before it creates: the APIs (Hosting, IAM, IAM Credentials, Security Token Service), the five hosting sites, the pool `github`, the provider `github-actions`, the service account `hosting-deployer`, its two roles and the binding that lets this repository impersonate it ([ADR-0007](../adr/0007-keyless-deploys-with-workload-identity-federation.md)). It prints every resource as `created` or `exists` and, at the end, the two repository variables to set.

**Publishing.** `npm run deploy [-- <site>...]` refuses unknown sites and sites whose `dist/index.html` is missing before calling the Firebase CLI, then runs `firebase deploy --only hosting:<target>,...`. With `deploy:preview -- <channel>` it runs `firebase hosting:channel:deploy` with a 7-day expiry and prints a Markdown table of the addresses, starting with a hidden marker.

**Previews.** For every pull request from a branch of the repository (never from a fork), the `Preview` workflow builds the sites, runs `verify:dist` and `verify:hosting`, gets a token for `hosting-deployer`, publishes all sites to the channel `pr-<number>` and creates or edits the one comment that starts with the marker. A newer push cancels an older run. Until the repository variables are set, the workflow stops after the checks with a notice.

**Domains.** The zone of `levix.digital` is at Cloudflare ([ADR-0009](../adr/0009-dns-at-cloudflare-with-firebase-hosted-names-not-proxied.md)). Each domain is connected to its site in the Firebase console; the repository does not create domains or change DNS. The product subdomains are `CNAME <site-id>.web.app` with the Cloudflare proxy off, so Firebase verifies them and issues their certificates. The apex is proxied by Cloudflare, which also redirects `www.levix.digital` to `https://levix.digital` and routes the domain's mail. `npm run domains:status` gets the caller's `gcloud` token and asks the Firebase Hosting API (`v1beta1`, `projects.sites.customDomains.get`) for each domain of `domains.json`: a domain is `ok` when ownership, host and certificate are `OWNERSHIP_ACTIVE`, `HOST_ACTIVE` and `CERT_ACTIVE`; otherwise it prints the states, Firebase's last check time and the records Firebase asks to add (`requiredDnsUpdates.desired`, action `ADD`) or remove (`discovered`, action `REMOVE`), with hosts relative to the zone. A domain that is not connected is reported as such. The command exits with an error until every domain is active.

**Production.** Every merge into `main` publishes the changed sites with `npm run deploy` through the `Deploy` workflow ([Continuous integration and deploy](ci.md)), which then requests the default address and the domain of each published site (`verify:live`).

**Rollback.** Per site, in the Firebase console (Hosting, the site's release history, "Rollback"), or with `npx firebase hosting:clone <site>:<version> <site>:live`. The other sites are not affected.

**Removing a domain.** Delete its record in Cloudflare, remove the domain from the site in the Firebase console and from `domains.json`; the `*.web.app` address keeps working.

**Removing the deploy identity.** `gcloud iam service-accounts delete hosting-deployer@levix-digital.iam.gserviceaccount.com` and `gcloud iam workload-identity-pools delete github --location=global --project=levix-digital`.

## Interfaces

Serves the output folders of [Sites](sites.md). The commands are listed in the README ("Hosting"). The workflow reads the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT`. The DNS records are edited in the Cloudflare dashboard.

## Decisions

- [ADR-0003](../adr/0003-firebase-hosting-with-one-site-per-domain.md): one Firebase Hosting site per domain.
- [ADR-0009](../adr/0009-dns-at-cloudflare-with-firebase-hosted-names-not-proxied.md): DNS at Cloudflare with Firebase-hosted names not proxied.
- [ADR-0007](../adr/0007-keyless-deploys-with-workload-identity-federation.md): keyless deploys with Workload Identity Federation.
