---
title: Continuous integration and deploy
summary: Checks on every pull request into main and production deploys of the changed sites on every merge.
code: [.github/workflows/ci.yml, .github/workflows/deploy.yml, lighthouserc.json, scripts/lighthouse.mjs, scripts/changed-sites.mjs, scripts/verify-live.mjs]
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

## Behavior

**Checks (`CI`).** The `check` job runs `npm ci`, `typecheck`, `lint` and `test` on Ubuntu with Node.js 22 and 24 and on Windows with Node.js 22. The `build` job, on Ubuntu with `.nvmrc`, runs `build`, `verify:dist`, `verify:hosting` and `lighthouse`, then uploads the five `dist` folders as the artifact `sites-dist` and the reports as `lighthouse` (also when the audit fails), both kept 14 days. A newer push to a pull request cancels its older run; the run called by `Deploy` is never cancelled.

**Budgets.** Lighthouse CI serves each `sites/<site>/dist` with its own static server, audits every HTML page three times with the mobile profile and fails when the median performance or accessibility score of a page is below 0.9. `@lhci/cli` 0.15.1 runs Lighthouse 13.5.0 through `overrides` in `package.json`, since its own Lighthouse is older than the Chrome on the runners. Locally, set `CHROME_PATH` when Chrome is not found. A failure names the site; the HTML reports in the `lighthouse` artifact (or `.lighthouseci/<site>/` locally) show each audit.

**Selecting the sites (`Deploy`, job `plan`).** For a push, the job reads the deployments of the `production` environment and takes the commit of the newest one whose latest status is `success`, then runs `changed-sites --base <it> --head <pushed commit>`: a file under `sites/<site>/` selects that site; `docs/`, `specs/`, `.specify/`, `.claude/`, `tests/MANUAL_TESTS.md`, Markdown at the root, `LICENSE` and `preview.yml` select none; any other file selects every site. No deployment yet, an empty base or a base that is not in the history selects every site. For a manual run, the `sites` input is checked against the hosting targets (empty means every site). The log lists every changed file with its result ([ADR-0008](../adr/0008-continuous-deploy-of-changed-sites-on-merge.md)).

**Deploy (`Deploy`, job `deploy`).** Runs only when `CI` passed and at least one site was selected, in the environment `production`, with `concurrency: deploy-production` and no cancellation: one deploy publishes at a time, and GitHub keeps one waiting run, replacing an older waiting one, which is safe because the newer one counts changes from the last successful deploy. It downloads `sites-dist` (the build that passed the checks), stops when the repository variables are missing, gets a one-hour token for `hosting-deployer` ([ADR-0007](../adr/0007-keyless-deploys-with-workload-identity-federation.md)), runs `npm run deploy -- <sites>`, then `verify:live`, which requests `https://<hosting site>.web.app/` of each site up to five times and fails unless it answers 200 with HTML. The job summary lists the sites and addresses.

**Repository settings.** The `production` environment is limited to `main` (Settings, Environments), and `main` is protected: pull request required, the checks `check (ubuntu-latest, 22)`, `check (ubuntu-latest, 24)`, `check (windows-latest, 22)` and `build` required, conversation resolution required, no force pushes. The federation of the deploy identity trusts every workflow of the repository; the environment's branch rule is what keeps production deploys to `main`.

**Failure and recovery.** A failed check publishes nothing. A deploy that fails part way leaves the sites already published at their new release; re-running the failed jobs or a manual deploy of every site publishes the rest. Roll a site back as described in [Hosting](hosting.md); the next deploy that selects the site publishes `main` again.

## Interfaces

Uses the commands of [Hosting](hosting.md) (`deploy`, `verify:hosting`) and of [Sites](sites.md) (`build`, `verify:dist`). Reads the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT`.

## Decisions

- [ADR-0007](../adr/0007-keyless-deploys-with-workload-identity-federation.md): keyless deploys with Workload Identity Federation.
- [ADR-0008](../adr/0008-continuous-deploy-of-changed-sites-on-merge.md): continuous deploy of changed sites on merge.
