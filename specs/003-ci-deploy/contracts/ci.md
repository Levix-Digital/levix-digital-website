# Contract: Checks and Deploy

## Commands

Run from the repository root. Each exits with 0 on success and non-zero on any failure, naming the site that failed.

| Command | What it does |
|---|---|
| `npm run lighthouse` | Audits every built site (`sites/<site>/dist`) with Lighthouse CI and the budgets in `lighthouserc.json`; reports in `.lighthouseci/`. Fails before auditing when a site is not built. Needs Chrome (`CHROME_PATH` when it is not found) |
| `npm run --silent sites:changed -- --base <sha> --head <sha>` | Prints the sites to publish for the files changed between the two commits, one per line, and why on standard error; prints every site when `<base>` is empty, all zeros or not in the history |
| `npm run --silent sites:changed -- --sites "<site> <site>"` | Validates a manual list (empty means every site) against the hosting targets and prints it; unknown names fail |
| `npm run verify:live -- <site>...` | Checks that `https://<hosting site>.web.app/` of each site answers 200 with HTML |

## Workflows

| Workflow | Triggers | Jobs |
|---|---|---|
| `CI` (`ci.yml`) | `pull_request` into `main`; `workflow_call` | `check` (matrix: Ubuntu with Node.js 22 and 24, Windows with `.nvmrc`): `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`. `build` (Ubuntu, `.nvmrc`): `npm ci`, `npm run build`, `npm run verify:dist`, `npm run verify:hosting`, `npm run lighthouse`, upload `sites-dist` (the five `dist` folders) and `lighthouse` (reports, also on failure) |
| `Deploy` (`deploy.yml`) | `push` to `main`; `workflow_dispatch` with input `sites` (space separated, empty for all) | `ci` (calls `CI`); `plan` (computes the sites, output `sites`); `deploy` (environment `production`, only when `sites` is not empty): download `sites-dist`, keyless auth, `npm run deploy -- <sites>`, `npm run verify:live -- <sites>`, job summary with the addresses |

Check names required on `main`: `CI / check (ubuntu-latest, 22)`, `CI / check (ubuntu-latest, 24)`, `CI / check (windows-latest, .nvmrc)`, `CI / build`. The `Preview` check stays optional, since it is skipped for forks.

## Change rules

| Changed path | Sites |
|---|---|
| `sites/<site>/**` | `<site>` |
| `docs/**`, `specs/**`, `.specify/**`, `.claude/**`, `tests/MANUAL_TESTS.md`, `*.md` at the root, `LICENSE`, `.github/workflows/preview.yml` | none |
| anything else | every site |

## Repository settings (one time)

- Variables from FEAT-002: `FIREBASE_WIF_PROVIDER`, `FIREBASE_DEPLOY_SERVICE_ACCOUNT`.
- Environment `production`: deployment branches limited to `main`.
- Branch protection on `main`: pull request required, the four checks above required, conversation resolution required, no force pushes.
