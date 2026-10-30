# Research: Continuous Integration and Production Deploy

## Decision 1: Deploy on merge, no release candidates

- **Decision**: every push to `main` publishes the sites it changed, after the checks pass on that commit.
- **Rationale**: the backlog item asks for it; the sites are static and every release can be rolled back per site in one step; the pull request preview is where a change is seen before it is live.
- **Alternatives**: release candidates with a promote workflow (the protocol's trunk default) add a tag and an approval per release for a website whose changes are small and reversible; a manual approval on the `production` environment adds a click per merge and can be turned on later without changing the workflows.

## Decision 2: One reusable check workflow

- **Decision**: `ci.yml` runs on pull requests and is called by `deploy.yml` (`workflow_call`) on the pushed commit; it uploads the built sites as an artifact that the deploy job downloads.
- **Rationale**: the same checks gate the merge and the deploy; the deploy publishes the bytes that passed (FR-009); a push to `main` runs the checks once.
- **Alternatives**: `workflow_run` after CI (the deploy then runs from the default branch's workflow file and needs the run's artifact by id, harder to follow); building again in the deploy job (not the build that was checked).

## Decision 3: Change rules by path

- **Decision**: `sites/<site>/**` selects that site; a short list of paths selects none (docs, specs, Spec Kit and tool settings, root Markdown, `LICENSE`, manual tests, the preview workflow); everything else selects every site. The base is the commit of the last successful deployment of the `production` environment (GitHub's deployments API), not the push's previous commit, so a failed deploy or a waiting deploy replaced by a newer one loses nothing; no deployment yet, or a base no longer in the history, selects every site.
- **Rationale**: the sites depend on every shared package and on the build tooling, so a precise graph would select all of them for almost every shared change anyway. Unknown paths default to every site, so a new kind of file can only cause an extra publish, never a missed one.
- **Alternatives**: a dependency graph of the workspace (more code, same answer today); publishing every site on every merge (simple, but spends releases and makes the release history noisy).

## Decision 4: Lighthouse CI on the static output

- **Decision**: `@lhci/cli` 0.15.1, pinned, with its Lighthouse overridden to 13.5.0 (0.15.1 bundles Lighthouse 12.6.1 from June 2025, older than the Chrome versions the runners ship), with one `staticDistDir` per site, three runs per page, mobile profile (the default), and assertions `categories:performance` and `categories:accessibility` at a minimum of 0.9 on the median; reports uploaded as an artifact (`upload.target: filesystem`).
- **Rationale**: the technical specification sets 90 on mobile for performance; the static server of Lighthouse CI needs no hosting; median of three runs absorbs runner noise.
- **Alternatives**: auditing the preview channel (depends on the deploy credentials and does not run for forks); temporary public storage for reports (sends the reports to a third party).
- **Note**: the Lighthouse static server does not apply clean URLs; it audits the prerendered `.html` files directly, which is what hosting serves.

## Decision 5: Platforms

- **Decision**: type check, lint and unit tests on `ubuntu-latest` with Node.js 22 and 24 and on `windows-latest` with `.nvmrc`; build, hosting check and Lighthouse once on `ubuntu-latest` with `.nvmrc`.
- **Rationale**: both Node.js versions are supported (`engines`), the project is developed on Windows (FEAT-002 needed Windows fixes), and the build output does not depend on the runner.

## Decision 6: Deployment environment and queueing

- **Decision**: the deploy job runs in the `production` environment with the home site's address as its URL; `concurrency: { group: deploy-production, cancel-in-progress: false }` on the deploy job.
- **Rationale**: the environment records every deploy and can be limited to `main` or given a reviewer; a deploy is never cancelled while publishing; GitHub keeps one waiting run per group and replaces an older waiting one, which is safe because the newer one counts changes from the last successful deploy (Decision 3).

## Decision 7: Address check after publishing

- **Decision**: `scripts/verify-live.mjs` requests `https://<hosting site>.web.app/` for each published site and fails unless it answers 200 with HTML, retrying briefly.
- **Rationale**: the CLI's exit code says the release was created; the check says the site answers. Until FEAT-004 the default addresses are the only ones.
