# Contract: Hosting Commands

Commands run from the repository root. Each exits with 0 on success and non-zero on any failure, and names the site or resource that failed.

| Command | What it does |
|---|---|
| `npm run hosting:setup` | One-time, idempotent setup with the caller's own Google login: checks project, billing and access, then creates or finds the required APIs, the five hosting sites, the federated identity pool and provider for this repository, and the deploy service account with `roles/firebasehosting.admin` and `roles/serviceusage.serviceUsageConsumer`. Prints each resource as `created` or `exists`, then the values of the repository variables `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT` |
| `npm run deploy` | Publishes every built site to its live hosting site |
| `npm run deploy -- <site> [<site>...]` | Publishes only the named sites (`home`, `anycontext`, `devcycle`, `gedo`, `aurora`) |
| `npm run deploy:preview -- --channel <id> [<site>...]` | Publishes to the preview channel `<id>` (expires 7 days after the last deploy) and prints a Markdown table of the preview addresses |
| `npm run verify:hosting` | Serves the built sites with the hosting emulator (no project needed) and checks clean URLs, not-found status and cache headers of each site |

Both deploy commands refuse, before publishing anything, a requested site whose `sites/<site>/dist/index.html` is missing, and an unknown site name.

## Configuration files

- `.firebaserc`: `projects.default` is the one project identifier; `targets.<project>.hosting` maps each site name to its hosting site.
- `firebase.json`: one `hosting` entry per site name, `public: sites/<site>/dist`.

## Repository variables (GitHub, not secrets)

| Variable | Value |
|---|---|
| `FIREBASE_WIF_PROVIDER` | `projects/<project number>/locations/global/workloadIdentityPools/github/providers/github-actions` |
| `FIREBASE_DEPLOY_SERVICE_ACCOUNT` | `hosting-deployer@<project>.iam.gserviceaccount.com` |
