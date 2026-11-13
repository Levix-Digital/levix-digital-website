---
id: 15
title: Release candidate signup with double opt-in, before App Check
status: accepted
date: '2026-11-13'
version: v0.1.0
subsystems: [functions, sites, content]
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0015: Release candidate signup with double opt-in, before App Check

## Context

Availability left the home cards and moved to each product's site; a product that cannot be downloaded yet offers a form to receive its release candidates by email (FEAT-037). The company is in Canada, so the list follows Canada's Anti-Spam Legislation (CASL): express consent, sender identification with a mailing address and an unsubscribe link in every message. The Technical Specification ties every function to Firebase App Check, which needs a reCAPTCHA Enterprise key, its script on every site and new policy sources; none of that exists yet. The owner also wants the subscribers told when a release candidate is published, without handling each email.

## Decision

- One HTTPS function, `releaseSignup`, in `northamerica-northeast1`, with the routes `subscribe`, `confirm` and `unsubscribe`, called by the product sites at its `cloudfunctions.net` address (the product sites' `connect-src` allows that origin). Hosting rewrites are not used, so site deploys and previews never depend on the function.
- Double opt-in: a subscription counts only after the link of the confirmation email is opened; pending ones are deleted after 7 days by a Firestore TTL policy. Unsubscribing deletes the subscription at once. Each record keeps the consent wording (by version), the page and the times, as proof of consent.
- Abuse is limited without App Check: an origin allow-list, a honeypot field, one confirmation email per address and product every 24 hours, ten signups per client per hour, and the same answer whether or not an address is subscribed.
- Release candidates are announced by an hourly workflow of this repository that reads the public releases repository of each product (`Levix-Digital/<product>-releases`) and emails each new pre-release tagged `vX.Y.Z-rc.N`, published in the last 3 days, once, to the confirmed subscribers; `npm run announce` does the same by hand.
- Emails go through the Firebase Trigger Email extension (collection `mail`), from `releases@levix.digital`.

## Alternatives Considered

- **App Check now**: a reCAPTCHA key, a third-party script on every product page and a wider policy for a form that double opt-in already keeps clean; it comes with the contact function (FEAT-033) and then covers this function too.
- **Hosting rewrite to the function**: same-origin calls, but every hosting deploy and preview fails while the function does not exist.
- **Products notify the website (repository dispatch)**: every product repository would need a token to this one; reading their public releases needs nothing from them.
- **An email provider's list feature**: a new vendor holding the addresses outside Canada.

## Consequences

The product sites' policy allows one more origin. The backend deploys in its own job once the owner's one-time setup is done (`FUNCTIONS_DEPLOY`). Products publish their release candidates as pre-releases in their public releases repository. Adding App Check later changes the sites and the function together.
