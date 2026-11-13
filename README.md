# Levix Digital Website

The source of the Levix Digital Inc. websites: the company home at levix.digital and one site per product (DocMapper, AnyContext, Dev Cycle Protocol, Gedo and Aurora Dev Suite). Each product site says whether the product can be downloaded today and, while it cannot, lets visitors sign up by email for its release candidates.

Every site is generated as static, prerendered pages that share one design system, one set of product facts and one translation mechanism, so a change to a shared part reaches every site in one place.

## Features

- Build the six sites into static folders ready for any static host
- Run one site locally with changes shown in the browser as you save
- Check types, lint the module boundaries and run the unit tests with one command
- Verify that every built site has a prerendered home page and serves the security headers
- Publish every site, or one, to Firebase Hosting, and preview every pull request at its own address
- Collect release candidate subscriptions with double opt-in, and email each new release candidate to its subscribers

## Requirements

- Node.js 22.22.2 or newer on the 22 line, or 24.15.0 or newer on the 24 line (`.nvmrc` selects 22); Node.js 26 is not supported yet because the Firebase CLI's hosting server does not support it <!-- readme-ok -->
- npm 10 or newer (included with Node.js)
- Linux, macOS or Windows

## Installation

```bash
git clone https://github.com/Levix-Digital/levix-digital-website.git
cd levix-digital-website
npm ci
```

`npm ci` installs every site and package from the lock file and stops if your Node.js version is not supported.

## Quick Start

1. Install the dependencies with `npm ci`.
2. Start the company home in development mode:

   ```bash
   npm run dev -w @levix/site-home
   ```

3. Open the local address it prints (by default http://localhost:5173) and edit a page: the browser shows the change when you save.

## Usage

### Build every site

```bash
npm run build
```

Each site is written to `sites/<site>/dist`, where `<site>` is `home`, `anycontext`, `devcycle`, `gedo` or `aurora`.

### Build, run or preview one site

```bash
npm run build -w @levix/site-anycontext
npm run dev -w @levix/site-anycontext
npm run preview -w @levix/site-anycontext
```

`preview` serves the built `dist` folder of that site.

### Check the code

```bash
npm run check
```

Runs the strict type check, the lint (including the rules that keep sites and shared packages apart) and the unit tests. Each one can also run alone: `npm run typecheck`, `npm run lint`, `npm test`.

### Verify the built sites

```bash
npm run verify:dist
```

Run it after `npm run build`: it fails if a site has no prerendered home page with a heading, or if a page has inline code (a `<script>` without `src`, a `<style>` element, a `style` or `on...` attribute, a `javascript:` link) that the Content Security Policy would block. Load scripts and styles from files instead.

## Hosting

Each site is served by its own Firebase Hosting site in the project `levix-digital`, at its domain and at `https://<hosting site>.web.app`:

| Site | Hosting site | Domain |
|---|---|---|
| `home` | `levix-digital` | https://levix.digital (`www.levix.digital` redirects to it) |
| `docmapper` | `docmapper` | https://docmapper.levix.digital |
| `anycontext` | `levix-anycontext` | https://anycontext.levix.digital |
| `devcycle` | `levix-devcycle` | https://devcycle.levix.digital |
| `gedo` | `levix-gedo` | https://gedo.levix.digital |
| `aurora` | `levix-aurora` | https://aurora.levix.digital |

### One-time setup (project owner)

1. In the [Firebase console](https://console.firebase.google.com/), create the project `levix-digital` and switch it to the Blaze plan.
2. Log in with `gcloud auth login` and `npx firebase login`, or open [Cloud Shell](https://shell.cloud.google.com/), where both are already logged in.
3. Run `npm run hosting:setup`. Every line ends in `created` or `exists`, and running it again creates nothing.
4. In GitHub (Settings, Secrets and variables, Actions, Variables), add `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT` with the values the setup prints. They are names, not secrets: workflows get one-hour credentials and no key exists.

### Publish

```bash
npm run build
npm run verify:hosting
npm run deploy             # every site
npm run deploy -- gedo     # one site
```

`verify:hosting` serves the built sites with the Firebase hosting emulator and checks clean URLs, not-found answers, cache headers and the security headers (HSTS, Content Security Policy and others, defined in `scripts/lib/security-headers.mjs`). `deploy` refuses a site that is not built.

### Domains

The DNS of `levix.digital` is at Cloudflare. Each domain is connected to its hosting site in the Firebase console (Hosting, the site, "Add custom domain") and listed in `domains.json`. In Cloudflare, every name served by Firebase has the records Firebase shows with the proxy off ("DNS only"): a product subdomain is `CNAME <product> levix-<product>.web.app`. Leave the mail records (MX, SPF) and the verification TXT records as they are.

Check the domains with your own `gcloud` login (an owner of the project):

```bash
npm run domains:status             # every site
npm run domains:status -- gedo     # one site
```

Each domain is `ok` when Firebase reports its ownership, its host and its certificate as active; otherwise the line shows the states, when Firebase last checked, and the records Firebase asks to add or remove. The command only reads, and ends with an error until every domain is active. After DNS changes, Firebase can take a few hours to check again and issue the certificate.

To add a site's domain: add the record in Cloudflare, connect the domain in the Firebase console, add it to `domains.json`, and run `npm run domains:status`.

### Preview a pull request

Every pull request from a branch of this repository is built and published to the preview channel `pr-<number>`, and gets one comment with the address of each site, updated on every push. Previews expire seven days after the last push. Pull requests from forks are not previewed.

### Roll back a site

In the Firebase console, open Hosting, the site's release history, and choose "Rollback" on the previous release. Only that site changes. The next production deploy that includes the site publishes `main` again.

## Continuous integration and deploy

Every pull request into `main` runs the `CI` checks: type check, lint and unit tests (Ubuntu with Node.js 22 and 24, Windows with Node.js 22), then the build, `verify:dist`, `verify:hosting` and a Lighthouse audit of every page of every site. A page fails the audit when its median mobile score for performance or accessibility is below 90, or when it logs a console error (a resource blocked by the Content Security Policy is one). Run the same audit locally after a build:

```bash
npm run build
npm run lighthouse     # set CHROME_PATH if Chrome is not found
```

The reports are in `.lighthouseci/<site>/`, and in the `lighthouse` artifact of a CI run.

Every merge into `main` runs the `Deploy` workflow: the same checks on the merged commit, then a production deploy of the sites changed since the last successful one, from the build that passed. A change under `sites/<site>/` publishes that site, a change to documentation or specifications publishes nothing, and any other change publishes every site. Deploys run one at a time in the `production` environment, and the run lists each published address.

To publish by hand, open Actions, Deploy, "Run workflow", and leave `sites` empty for every site or write the sites, for example `gedo aurora`.

### One-time repository settings (owner)

- Settings, Environments, `production`: limit deployment branches to `main` (the environment appears after the first deploy, or create it there).
- Settings, Branches: protect `main` with a required pull request, the required checks `check (ubuntu-latest, 22)`, `check (ubuntu-latest, 24)`, `check (windows-latest, 22)` and `build`, required conversation resolution, and no force pushes.

## Release candidate signup

Each product site that cannot be downloaded yet shows a form to receive its release candidates by email. The form calls the `releaseSignup` function (Cloud Functions, Montreal), which stores the subscription in Firestore and sends a confirmation email; only confirmed subscriptions receive announcements, and every email has an unsubscribe link.

### One-time backend setup (owner)

1. In the Firebase console, create the Firestore database `(default)` in `northamerica-northeast1` (production mode).
2. In Gmail, add `releases@levix.digital` as a "Send mail as" address of the account that holds `contact@levix.digital`, and create an app password for it.
3. Install the Trigger Email extension (`firebase/firestore-send-email`) in `northamerica-northeast1` with the collection `mail`, the SMTP address `smtps://<Gmail address>@smtp.gmail.com:465` and the app password, the default sender `Levix Digital <releases@levix.digital>`, and TTL on.
4. Check the mailing address printed in every email, `SENDER_MAILING_ADDRESS` in `functions/.env.levix-digital`.
5. Run `npm run hosting:setup` again: it enables the function APIs and grants the deploy identity the function roles.
6. In GitHub (Settings, Secrets and variables, Actions, Variables), set `FUNCTIONS_DEPLOY` to `true`, then run Actions, Deploy, "Run workflow" once to deploy the function, the Firestore rules and the TTL policies.

### Announce a release candidate

Every hour, the `Announce release candidates` workflow reads the public releases repository of each product (`Levix-Digital/<product>-releases`) and emails every new pre-release tagged `vX.Y.Z-rc.N`, published in the last 3 days, to the confirmed subscribers of that product, once. To announce by hand, with your own Google login (`gcloud auth application-default login`):

```bash
npm run announce -- --product gedo --version v0.2.0-rc.1 --url https://github.com/Levix-Digital/gedo-releases/releases/tag/v0.2.0-rc.1
npm run announce -- --product gedo --version v0.2.0-rc.1 --url <same address> --notes notes.md --send
```

Without `--send` it prints how many subscribers would receive it and the first email; with `--send` it queues the emails, and a second run for the same version refuses.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm ci` fails with `EBADENGINE` | Install a supported Node.js version (see Requirements), for example with `nvm install` in the repository folder |
| `npm ci` fails because the lock file does not match `package.json` | Run `npm install` to update `package-lock.json` and commit it with the change |
| `npm run verify:dist` says `index.html not found` | Run `npm run build` first |
| `npm run deploy` says `not built` | Run `npm run build` first |
| `npm run domains:status` shows `OWNERSHIP_MISSING` and asks to add a `CNAME` | The record is missing or proxied in Cloudflare: set it to the value shown with the proxy off ("DNS only"), then wait for Firebase to check again |
| The `Deploy` run fails at "Check the addresses" on a domain | Run `npm run domains:status` and fix the records it lists |
| The `Deploy` run fails at "Check the addresses" with a header "is missing" or a different value | Something between the visitor and Firebase changed the header: for the apex, look for a Cloudflare transform rule or feature that adds or removes headers |
| The Lighthouse audit fails on `errors-in-console` | Open the report: a "Refused to load" error names what the Content Security Policy blocked; load it from the site's own files or add its source to the policy (see the hosting documentation) |
| `npm run hosting:setup` says billing is not enabled | Switch the project to the Blaze plan in the Firebase console, then run it again |
| The preview workflow ends with "Preview skipped" | Set the two repository variables printed by `npm run hosting:setup` |
| `npm run lighthouse` fails with a score below budget | Open the site's HTML report in `.lighthouseci/<site>/` (or the `lighthouse` artifact of the run) and fix the audits it lists |
| The `Deploy` run fails at "Check deploy configuration" | Set the two repository variables printed by `npm run hosting:setup` |
| Lint reports `boundaries/dependencies` | Import the shared package by its name (for example `@levix/ui`) instead of a file inside it, and never import another site |

## Documentation

- [Technical documentation](TECDOC.md) for maintainers
- [Product vision](docs/product/VISION.md) and [technical specification](docs/product/TECH_SPEC.md)

## License

Proprietary software of Levix Digital Inc. - see [LICENSE](LICENSE). All rights reserved.
