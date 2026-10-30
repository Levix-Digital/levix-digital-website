# Quickstart: Firebase Hosting Sites and Preview Channels

## One-time setup (project owner)

1. In the [Firebase console](https://console.firebase.google.com/), create the project `levix-digital` (Google Analytics off; GA4 comes with FEAT-034) and switch it to the Blaze plan, linking the billing account.
2. Open [Cloud Shell](https://shell.cloud.google.com/) (already logged in to `gcloud` and `firebase`), or log in locally with `gcloud auth login` and `npx firebase login`.
3. Clone the repository, `npm ci`, then `npm run hosting:setup`. Every line ends in `created` or `exists`; running it again only prints `exists`.
4. In GitHub, Settings, Secrets and variables, Actions, Variables: add `FIREBASE_WIF_PROVIDER` and `FIREBASE_DEPLOY_SERVICE_ACCOUNT` with the values printed at the end.

## Publish

```sh
npm run build
npm run verify:hosting
npm run deploy            # every site
npm run deploy -- home    # one site
```

Each site answers at `https://<hosting site>.web.app` until its custom domain is added (FEAT-004).

## Preview a pull request

Open a pull request from a branch of the repository. The `Preview` workflow builds, checks and publishes every site to the channel `pr-<number>`, and keeps one comment with the five addresses. Channels expire 7 days after the last push.

## Roll back a site

Firebase console, Hosting, the site's release history, "Rollback" on the previous release; or `npx firebase hosting:clone <site>:<version> <site>:live`. Only that site changes.

## Hand checks for the reviewer

- `npm run verify:hosting` passes after `npm run build`.
- After the setup: the console lists five hosting sites; IAM shows `hosting-deployer` with only Firebase Hosting Admin and no keys.
- On this pull request (after the variables are set): one comment with five preview addresses, each showing the site's placeholder home page.
