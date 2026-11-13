# Quickstart: Product Availability and Release Candidate Signup

## Local checks

1. `npm ci`, then `npm run check` (typecheck, lint, tests of the sites, packages and `functions`).
2. `npm run build`, `npm run verify:dist`, `npm run verify:hosting`: six sites build and serve, DocMapper included.
3. `npm run dev -w @levix/site-gedo`: the page shows the disabled download button and the form; submitting without the consent box shows the error next to it; with the function not running, a valid submit shows the fallback with contact@levix.digital.
4. `npm run dev -w @levix/site-anycontext`: the download action is enabled and opens the releases page; no form.

## One-time setup by the owner (before `FUNCTIONS_DEPLOY=true`)

1. Firestore: create the `(default)` database in `northamerica-northeast1` (Firebase console, Firestore, Create database, production mode).
2. Gmail: add `releases@levix.digital` as a "Send mail as" address of the account that holds `contact@levix.digital`.
3. Install the Trigger Email extension (`firebase/firestore-send-email`) in `northamerica-northeast1`, collection `mail`, SMTP `smtps://<account>@gmail.com@smtp.gmail.com:465` with the app password, default FROM `Levix Digital <releases@levix.digital>`, TTL on.
4. Check the mailing address in `functions/.env.levix-digital` (`SENDER_MAILING_ADDRESS`, given by the owner on 2026-11-13).
5. Run `npm run hosting:setup` once to grant the deploy identity the function roles and enable the APIs.
6. Set the repository variable `FUNCTIONS_DEPLOY` to `true`; the next merge (or a manual `Deploy` run) deploys the function, the rules and the TTL policies.

## End-to-end check in production

1. On `https://gedo.levix.digital`, sign up with a real address and the consent box ticked: "Check your inbox".
2. The email arrives within 5 minutes with the confirmation link, the sender block and the unsubscribe link.
3. Open the confirmation link: "Subscription confirmed". In the console, the record is `confirmed` with `confirmedAt` and no `expiresAt`.
4. Open the unsubscribe link: "You are unsubscribed". The record is gone.
