---
title: Backend Functions
summary: Cloud Functions for the release candidate signup, the contact form and the shared translation cache.
code: [functions, firestore.rules, firestore.indexes.json]
---

# Backend Functions

Cloud Functions for the release candidate signup, the contact form and the shared translation cache.

## Responsibilities

Owns the server side: the `releaseSignup` function (built), the `contact` and `translate` functions (planned), their Firestore collections, rules and TTL policies, and the commands that announce release candidates. Does not own pages.

## Structure

`functions/` is an npm workspace (`@levix/functions`, TypeScript built to `functions/lib` with `tsconfig.build.json`) with no dependency on the other workspaces, so Cloud Build installs it alone; its tests may read the other packages to check that the copies agree. `functions/src/`: `products.ts` (subscribable products: name, site, hosting site, releases repository; a test compares them with `@levix/content` and `.firebaserc`), `consent.ts` (every consent wording by version; a test compares the current one with `@levix/i18n`), `validation.ts`, `tokens.ts`, `limits.ts`, `email.ts` (confirmation and announcement emails), `store.ts` (`SubscriptionStore` and `AnnouncementStore`, with `MemoryStore` for tests), `firestore-store.ts`, `subscriptions.ts` (subscribe, confirm, unsubscribe), `announcements.ts`, `release-watch.ts`, `http.ts` (routes, CORS, logging), `index.ts` (the deployed `releaseSignup`), and the commands `announce-cli.ts` and `watch-cli.ts`. `functions/.env.levix-digital` holds the public parameter `SENDER_MAILING_ADDRESS`. `firestore.rules`, `firestore.indexes.json` and the `functions` and `firestore` sections of `firebase.json`. `contact.ts` and `translate.ts` come with their features.

## Behavior

**Release candidate signup.** `releaseSignup` (2nd generation, `northamerica-northeast1`, 256 MiB, at most 5 instances) answers `POST /subscribe`, `/confirm` and `/unsubscribe` at `https://northamerica-northeast1-levix-digital.cloudfunctions.net/releaseSignup` (contract: `specs/010-product-availability-signup/contracts/release-signup-api.md`). Only the product sites' origins (production domain, `web.app` address, preview channels) get CORS headers; other origins get 403. `subscribe` counts the client (SHA-256 of the first `X-Forwarded-For` address and the UTC hour in `releaseSignupLimits`, over 10 answers 429), validates the body (address, product, consent `true` with a known wording version; a filled `website` honeypot answers 202 and stores nothing), then, in one transaction, writes `releaseSubscriptions/{sha256(address|product)}` as `pending` with the consent (wording, version, page, time), the SHA-256 of a random confirmation secret, a random unsubscribe secret and `expiresAt` 7 days later, and queues the confirmation email in `mail`. A confirmed subscription, or a pending one emailed less than 24 hours ago, is left alone; the answer is always 202. Email links open `https://<product site>/subscription/confirm#<id>.<secret>` and `/subscription/unsubscribe#<id>.<secret>`; the page posts the token, so a link scanner that only fetches the page changes nothing. `confirm` checks the hash in constant time and the expiry, sets `confirmed`, `confirmedAt` and drops `expiresAt`; otherwise 410. `unsubscribe` deletes the subscription when the secret matches and always answers 200. Every email carries the sender block (Levix Digital Inc., the mailing address, contact@levix.digital), the unsubscribe link and a `List-Unsubscribe` header. Each request logs one line (route, status, result, product), never an address or a token; a storage error logs its stack and answers 500.

**Announcing a release candidate.** `npm run announce -- --product <id> --version vX.Y.Z-rc.N --url <https address> [--notes <file>] [--send]` (with the caller's Google credentials) prints the number of confirmed subscribers and the first email; with `--send` it records `releaseAnnouncements/<product>-<version>` (a second run refuses) and queues one email per subscriber with that subscriber's unsubscribe link. `npm run announce:watch`, run every hour by the `Announce release candidates` workflow, reads the 20 latest releases of each product's releases repository through the GitHub API and announces every pre-release tagged `vX.Y.Z-rc.N` published in the last 3 days that was not announced yet, linking its release page and quoting up to 2000 characters of its notes; a repository that does not exist yet is skipped.

**Storage.** Firestore `(default)` in `northamerica-northeast1`. TTL policies delete `releaseSubscriptions` at `expiresAt`, `releaseSignupLimits` at `expiresAt` and `mail` at `deleteAt` (30 days), usually within a day of the time. A composite index on `releaseSubscriptions` (`product`, `state`) serves the announcements.

`contact` validates the form, checks App Check and a rate limit, stores the message in `contactMessages`, and sends the notification to contact@levix.digital through the Trigger Email extension; the message is kept even if the email fails. `translate` accepts a language and a set of English strings that exist in the source, returns cached translations from `translations/{language}/strings/{hash}`, translates the missing ones with the Cloud Translation API and stores them. Firestore denies all client access.

## Interfaces

Called by the product sites over HTTPS (CORS). Writes the `mail` collection read by the Trigger Email extension, which sends through the Gmail SMTP account of contact@levix.digital as `releases@levix.digital`. The watcher reads the public GitHub Releases API. Will call the Cloud Translation API.

## Decisions

- [ADR-0003](../adr/0003-firebase-hosting-with-one-site-per-domain.md): Firebase Hosting, Functions and Firestore.
- [ADR-0004](../adr/0004-build-time-and-on-demand-translation-without-per-language-ur.md): the shared translation cache.
- [ADR-0015](../adr/0015-release-candidate-signup-with-double-opt-in-before-app-check.md): release candidate signup with double opt-in, before App Check.
