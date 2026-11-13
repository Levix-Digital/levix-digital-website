---
title: Continuous integration and deploy
summary: Checks on every pull request into main and production deploys of the changed sites on every merge.
code: [.github/workflows/ci.yml, .github/workflows/deploy.yml, lighthouserc.json, scripts/lighthouse.mjs, scripts/lib/emulator.mjs, scripts/changed-sites.mjs, scripts/verify-live.mjs]
---

# Continuous integration and deploy

Checks on every pull request into `main` and production deploys of the changed sites on every merge.

## Responsibilities

Owns the checks a commit must pass before it reaches production, the Lighthouse budgets, which sites a merge publishes and the production deploy itself. Does not own the hosting configuration, the deploy command or the deploy identity ([Hosting](hosting.md)), nor the previews of pull requests (`preview.yml`, also in [Hosting](hosting.md)).

## Structure

- `.github/workflows/ci.yml` (`CI`): runs on pull requests into `main` and is called by `Deploy`.
- `.github/workflows/deploy.yml` (`Deploy`): runs on every push to `main` and by hand.
- `lighthouserc.json`: the Lighthouse CI settings and budgets.
- `scripts/lighthouse.mjs`: audits every built site (`npm run lighthouse`).
- `scripts/changed-sites.mjs`: the sites to publish (`npm run sites:changed`).
- `scripts/verify-live.mjs`: checks the published addresses (`npm run verify:live`).
- `.github/workflows/release-refresh.yml` (`Release refresh`) and `scripts/release-refresh.mjs`: republish a product site when its product has a new release.

## Behavior

**Checks (`CI`).** The `check` job runs `npm ci`, `typecheck`, `lint` and `test` on Ubuntu with Node.js 22 and 24 and on Windows with Node.js 22. The `build` job, on Ubuntu with `.nvmrc`, runs `build`, `verify:dist`, `verify:hosting` and `lighthouse`, The build gets the workflow's `GITHUB_TOKEN`, so the product sites read their releases authenticated. The job then uploads the `dist` folder of every site as the artifact `sites-dist` and the reports as `lighthouse` (also when the audit fails), both kept 14 days. A newer push to a pull request cancels its older run; the run called by `Deploy` is never cancelled.

**Budgets.** `npm run lighthouse` runs inside the hosting emulator (as `verify:hosting` does) and gives Lighthouse CI every prerendered page of each site at its clean URL (`index.html` is `/`, `about.html` is `/about`; the not-found page is left out), so pages are audited with the hosting rules, as visitors get them. Lighthouse's own static server is not used: it serves `/index.html`, where the client router matches no route and the page renders empty. Lighthouse CI audits every page three times with the mobile profile and fails when the median performance or accessibility score of a page is below 0.9. `@lhci/cli` 0.15.1 runs Lighthouse 13.5.0 through `overrides` in `package.json`, since its own Lighthouse is older than the Chrome on the runners. Locally, set `CHROME_PATH` when Chrome is not found. A failure names the site; the HTML reports in the `lighthouse` artifact (or `.lighthouseci/<site>/` locally) show each audit.

**Selecting the sites (`Deploy`, job `plan`).** For a push, the job reads the deployments of the `production` environment and takes the commit of the newest one whose latest status is `success`, then runs `changed-sites --base <it> --head <pushed commit>`: a file under `sites/<site>/` selects that site; `docs/`, `specs/`, `.specify/`, `.claude/`, `tests/MANUAL_TESTS.md`, Markdown at the root, `LICENSE`, `preview.yml`, `announce-release-candidates.yml`, `release-refresh.yml`, `scripts/release-refresh.mjs`, `functions/` and the Firestore rules and indexes select none; any other file selects every site. No deployment yet, an empty base or a base that is not in the history selects every site. For a manual run, the `sites` input is checked against the hosting targets (empty means every site). The log lists every changed file with its result ([ADR-0008](../adr/0008-continuous-deploy-of-changed-sites-on-merge.md)).

**Deploy (`Deploy`, job `deploy`).** Runs only when `CI` passed and at least one site was selected, in the environment `production`, with `concurrency: deploy-production` and no cancellation: one deploy publishes at a time, and GitHub keeps one waiting run, replacing an older waiting one, which is safe because the newer one counts changes from the last successful deploy. It downloads `sites-dist` (the build that passed the checks), stops when the repository variables are missing, gets a one-hour token for `hosting-deployer` ([ADR-0007](../adr/0007-keyless-deploys-with-workload-identity-federation.md)), runs `npm run deploy -- <sites>`, then `verify:live`, which requests `https://<hosting site>.web.app/` of each site up to five times and fails unless it answers 200 with HTML. The job summary lists the sites and addresses.

**Backend (`Deploy`, job `functions`).** The `plan` job also reports whether `functions/`, `firestore.rules` or `firestore.indexes.json` changed since the last successful deploy of the `backend` environment (always, on a manual run or without a known base). When they did and the repository variable `FUNCTIONS_DEPLOY` is `true`, the `functions` job, after `CI`, gets the same keyless token and runs `firebase deploy --only functions,firestore`, which builds the function (`predeploy`), deploys it and applies the rules, the index and the TTL policies. It runs in its own environment, `backend`, so its deploys are counted apart from the sites' `production` ones and a failed backend deploy is retried by the next push, and it runs one at a time (`deploy-functions`). Until the owner's one-time backend setup is done, `FUNCTIONS_DEPLOY` is unset and the job is skipped.

**Release candidate announcements (`Announce release candidates`).** Every hour (minute 17) and by hand, when `FUNCTIONS_DEPLOY` is `true`, the workflow gets the same keyless token and runs `npm run announce:watch` with the workflow's `GITHUB_TOKEN` for the GitHub API ([Backend Functions](functions.md)). Its log lists each candidate as queued (with the number of emails) or already announced.

**Release refresh (`Release refresh`).** Every hour (minute 41) and by hand (with an optional dry run that only reports), the workflow runs `scripts/release-refresh.mjs` with the workflow's token and `actions: write`. For each product site of `domains.json` it reads `https://<domain>/release.json`, skips a site without it or whose product is in development, reads the latest release as the build does, and collects the sites whose version differs (a site built without a version counts as different). It then starts `Deploy` once by hand with those sites (`workflow_dispatch`, input `sites`), which runs `CI` and publishes only them. The job summary has a table of the sites and results. A site that could not be checked fails the run, after the others were handled; nothing is deployed for it until a later run reads it ([ADR-0016](../adr/0016-release-information-read-at-build-time.md)).

**Repository settings.** The `production` and `backend` environments are limited to `main` (Settings, Environments), and `main` is protected: pull request required, the checks `check (ubuntu-latest, 22)`, `check (ubuntu-latest, 24)`, `check (windows-latest, 22)` and `build` required, conversation resolution required, no force pushes. The federation of the deploy identity trusts every workflow of the repository; the environment's branch rule is what keeps production deploys to `main`.

**Failure and recovery.** A failed check publishes nothing. A deploy that fails part way leaves the sites already published at their new release; re-running the failed jobs or a manual deploy of every site publishes the rest. Roll a site back as described in [Hosting](hosting.md); the next deploy that selects the site publishes `main` again.

## Interfaces

Uses the commands of [Hosting](hosting.md) (`deploy`, `verify:hosting`) and of [Sites](sites.md) (`build`, `verify:dist`). Reads the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT`.

## Decisions

- [ADR-0007](../adr/0007-keyless-deploys-with-workload-identity-federation.md): keyless deploys with Workload Identity Federation.
- [ADR-0008](../adr/0008-continuous-deploy-of-changed-sites-on-merge.md): continuous deploy of changed sites on merge.
- [ADR-0016](../adr/0016-release-information-read-at-build-time.md): release information read at build time.
