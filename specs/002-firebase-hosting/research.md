# Research: Firebase Hosting Sites and Preview Channels

Decisions taken while planning FEAT-002, with the alternatives considered. Versions are the latest stable releases older than two weeks on 2026-10-30, pinned by the lock file.

## Project and site identifiers

- **Decision**: project `levix-digital`; hosting sites `levix-digital` (the project's default site, target `home`), `levix-anycontext`, `levix-devcycle`, `levix-gedo` and `levix-aurora`. The project is named once, in `.firebaserc` (`projects.default`), with the target to site mapping next to it (`targets`).
- **Rationale**: project and site identifiers are global and permanent; a `levix-` prefix keeps them recognizable in the console and likely to be free. The default site of a project always has the project's identifier, so the home site uses it instead of a sixth site.
- **Alternatives**: one project per site (five billing links and five deploy identities for no gain); naming the sites after the full domains (dots are not allowed in site identifiers).

## Hosting configuration

- **Decision**: `firebase.json` has one `hosting` entry per target, each with `public: sites/<site>/dist`, `cleanUrls: true`, `trailingSlash: false`, the default ignore list (dotfiles such as `.vite/` and `node_modules`) and two header rules: `**` gets `Cache-Control: no-cache`, then `/assets/**` gets `public, max-age=31536000, immutable`.
- **Rationale**: vite-ssg writes one `.html` file per route and fingerprinted files under `assets/`. Clean URLs serve `/about` from `about.html` and redirect `/about.html`. When two header rules set the same header, the later rule wins (checked with the hosting emulator on 2026-10-30: pages answer `no-cache`, assets answer the immutable value, an unknown path answers 404). Security headers are added to the same entries by FEAT-005.
- **Alternatives**: one generated `firebase.json` per site (five files to keep in sync); relying on the default `max-age=3600` (a new release would not be seen for up to an hour).

## Deploy identity

- **Decision**: Workload Identity Federation. A pool `github` with an OIDC provider `github-actions` for `https://token.actions.githubusercontent.com`, whose attribute condition accepts only tokens of this repository (`assertion.repository_id`, which survives renames and cannot be reused by a new repository with the same name). The provider may impersonate one service account, `hosting-deployer@levix-digital.iam.gserviceaccount.com`, which holds `roles/firebasehosting.admin` and `roles/serviceusage.serviceUsageConsumer` (the Firebase CLI reads the state of the Hosting API before every deploy, found in firebase-tools 15.34.1). Workflows use `google-github-actions/auth` with the provider and the service account, both stored as repository variables (identifiers, not secrets).
- **Rationale**: no long-lived key exists anywhere (FR-011, SC-004); credentials last one hour and only this repository's workflows can get them. Hosting Admin is the smallest role that creates releases and preview channels. Preview deploys pass `--no-authorized-domains`, since the sites do not use Firebase Authentication, so no Auth role is needed.
- **Alternatives**: a service account key in a GitHub secret (what `firebase init hosting:github` creates: a long-lived key that must be rotated by hand, and the generated account also gets Auth admin and Cloud Run viewer roles this site does not need); `firebase login:ci` tokens (deprecated, tied to a person).

## Setup command

- **Decision**: `npm run hosting:setup` runs `scripts/hosting-setup.mjs`, which drives `gcloud` and the pinned Firebase CLI with the caller's own login. It checks first (project exists, billing enabled, caller can set IAM policy), then for each resource reads before it creates: required APIs, hosting sites, the pool, the provider, the service account, its role and the impersonation binding. It prints each resource as `created` or `exists`, and at the end the two values to store as repository variables. Commands are run through an injected runner, so tests replace `gcloud` and `firebase` with fakes.
- **Rationale**: idempotent by construction (FR-003, FR-004); runnable from Cloud Shell, where both tools are already logged in; testable without a Google account.
- **Alternatives**: Terraform (the right tool for a large estate, but a second tool and a state file for a dozen resources); a shell script (harder to test and to keep idempotent).

## Publish and preview command

- **Decision**: `npm run deploy -- [site...]` and `npm run deploy:preview -- --channel <id>` run `scripts/hosting-deploy.mjs`. It reads the targets from `firebase.json`, refuses any requested site whose `dist/index.html` is missing, then runs `firebase deploy --only hosting:<t>,...` or `firebase hosting:channel:deploy <channel> --only <t>,... --expires 7d --json`. In preview mode it prints a Markdown table of the preview addresses (from the CLI's JSON) for the pull request comment.
- **Rationale**: one place checks the build before anything is published (FR-006) and both the developer and the workflows use it (FR-005); FEAT-003 calls the same command on merge.
- **Alternatives**: `FirebaseExtended/action-hosting-deploy` (one action run per site, and it expects a service account key); calling the CLI directly from the workflow (no build check, duplicated between local and automated use).

## Preview workflow

- **Decision**: `.github/workflows/preview.yml` on `pull_request` (opened, synchronize, reopened). The job runs only when the head repository is this repository; permissions `contents: read`, `id-token: write`, `pull-requests: write`; a concurrency group per pull request cancels an older run. Steps: checkout, Node from `.nvmrc`, `npm ci`, `npm run build`, `npm run verify:dist`, auth, `npm run deploy:preview -- --channel pr-<number>`, then `actions/github-script` creates or edits the one comment that carries a hidden marker. Channels expire seven days after the last deploy.
- **Rationale**: matches FR-009 and FR-010: forks never reach the job's credentials. All five sites are previewed on every push; it takes seconds per site and keeps the comment complete.
- **Alternatives**: `pull_request_target` (would run with credentials on code from forks); previewing only changed sites (needs a dependency graph between packages and sites; FEAT-003 may add it).

## Checking the hosting behavior

- **Decision**: `npm run verify:hosting` starts the Firebase hosting emulator for all targets (`firebase emulators:exec --only hosting --project levix-digital`) and probes each site: the home page answers 200 with `no-cache`, an asset answers with the immutable value, `/index.html` redirects to `/`, an unknown path answers 404. The emulator serves the targets on the hub's hosting port and its reserved ports, in `firebase.json` order. The preview workflow runs it before publishing.
- **Rationale**: proves FR-007 and FR-008 with Firebase's own server, offline and without a login (the targets of `.firebaserc` are bound to the project id, so a `demo-` project cannot be used).
- **Alternatives**: probing the deployed preview (needs credentials and a network round trip; a broken rule would already be published).

## Rollback

- **Decision**: documented, per site: the console's release history "Rollback", or `firebase hosting:clone <site>:<version> <site>:live` from the CLI.
- **Rationale**: Firebase Hosting keeps previous releases; restoring one touches only that site (SC-005).
- **Alternatives**: redeploying an older commit (slower, and needs the old build).

## Region

- **Decision**: Montreal (`northamerica-northeast1`), chosen by Levi on 2026-10-30 and recorded in the technical specification. Hosting has no region; the region applies to Firestore and functions (FEAT-033 and the translation items), and Firestore's location cannot change once set.
