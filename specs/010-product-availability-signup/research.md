# Research: Product Availability and Release Candidate Signup

## R1. How the pages reach the signup service

- **Decision**: the forms call one HTTPS function, `releaseSignup` (Cloud Functions 2nd generation, `northamerica-northeast1`), at its `cloudfunctions.net` address. Each product site adds that origin to `connect-src` of its Content Security Policy; the function answers CORS only for the product sites' origins and their preview channels.
- **Rationale**: a Firebase Hosting rewrite (`/api/**` to the function) refuses to deploy while the function does not exist, so every hosting deploy and every preview channel would depend on the function being deployed first, and a failed function deploy would block site deploys. Calling the function directly keeps hosting and functions independent: the sites deploy and preview as today, and when the function is missing or down the form shows its fallback. The Technical Specification already allows "the functions" in the policy (ADR-0010 extends the policy per feature).
- **Alternatives**: hosting rewrite on the site's own origin (rejected for the coupling above); the `run.app` address (rejected: it is only known after the first deploy).

## R2. Email delivery

- **Decision**: the function writes each message to the Firestore collection `mail`, which the Firebase Trigger Email extension sends through the Gmail SMTP account already chosen for contact notifications (Technical Specification, "External services"), from `Levix Digital <releases@levix.digital>`.
- **Rationale**: the delivery path of the Technical Specification; no SMTP credential in the function or the repository (the extension keeps its password in Secret Manager); delivery is retried by the extension and its state is visible on the `mail` document. Gmail's limits (about 500 messages a day) are far above the expected volume of confirmation emails.
- **Alternatives**: an email API provider (new vendor, contract and key); sending with an SMTP library from the function (the function would hold the password).

## R3. CASL compliance

- **Decision**: express consent collected with an unticked checkbox whose label states the purpose (emails about release candidates of the named product), the requester (Levix Digital Inc.), its contact information and that consent can be withdrawn; double opt-in (the subscription counts only after the confirmation link); every email identifies the sender (name, mailing address, contact email) and carries an unsubscribe link; unsubscribing takes effect at once and deletes the subscription; the record keeps the consent wording version, page, time and confirmation time as proof of consent.
- **Rationale**: CASL (S.C. 2010, c. 23, s. 10) and the CRTC's Electronic Commerce Protection Regulations require, for a request for express consent, the purpose, the identity of the requester and a statement that consent can be withdrawn; every commercial electronic message must identify the sender with a mailing address and contain an unsubscribe mechanism valid for 60 days and honored within 10 business days; the burden of proving consent is on the sender. Pre-checked boxes are not express consent (CRTC Compliance and Enforcement Information Bulletin 2012-549).
- **Mailing address**: given by the owner on 2026-11-13; a deploy parameter of the function (`SENDER_MAILING_ADDRESS` in `functions/.env.levix-digital`).

## R4. Links in emails and link scanners

- **Decision**: email links open pages of the product site (`/subscription/confirm#<token>` and `/subscription/unsubscribe#<token>`); the page sends the token to the function with a `POST`. The token travels in the URL fragment.
- **Rationale**: mail security scanners fetch links with `GET`; a `GET` that confirms or unsubscribes would act without the person. A fragment is never sent to the server, so the token stays out of hosting logs and referrers.
- **Alternatives**: a `GET` endpoint on the function (rejected for scanners); a query string (sent to the hosting logs).

## R5. Tokens, deduplication and storage

- **Decision**: one document per address and product in `releaseSubscriptions`, with id `sha256(lowercased address + "|" + product)`. Confirmation and unsubscribe tokens are `<document id>.<32 random bytes, base64url>`; the document stores only the SHA-256 of each secret part and compares in constant time.
- **Rationale**: the id makes signups idempotent and lets the function find the document from the token without a query or index; stored hashes mean a leak of the database does not leak working links.

## R6. Expiry and cleanup

- **Decision**: Firestore TTL policies on `expiresAt` of `releaseSubscriptions` (set to signup time + 7 days while pending, removed on confirmation), of `releaseSignupLimits` and of `mail` (`deleteAt`, 30 days after queueing). The policies are declared in `firestore.indexes.json` (`fieldOverrides` with `ttl: true`).
- **Rationale**: no scheduled function to write or watch; Firestore deletes expired documents, usually within 24 hours, which meets SC-005 (8 days). The function also treats an expired pending record as absent, so a link never works after 7 days even before deletion.

## R7. Abuse protection

- **Decision**: a hidden honeypot field; the request must come from a product site origin; at most one confirmation email per address and product every 24 hours (`lastEmailAt` on the subscription); at most 10 signups per client address per hour (a counter document keyed by the SHA-256 of the client address and the hour, with TTL); the same answer whether or not the address was subscribed. Firebase App Check is not used by this function yet.
- **Rationale**: double opt-in already keeps unconfirmed addresses off the list; the limits stop the form being used to flood a third party's inbox. App Check needs a reCAPTCHA Enterprise key, its script and new policy sources on every site; it comes with the contact function (FEAT-033), which the Technical Specification ties to it, and then covers this function too. Recorded in ADR-0015.

## R8. Where the code lives

- **Decision**: `functions/` is a new npm workspace (TypeScript, built to `functions/lib`), with no dependency on the other workspaces so Cloud Build can install it alone; its list of product ids is checked against `@levix/content` by a test. Pure logic (validation, tokens, limits, the email text) is separate from Firestore and HTTP, behind a small `SubscriptionStore` interface with a Firestore implementation and an in-memory one for tests. The availability panel, the signup form and the two subscription pages are shared components in `@levix/ui`; their English text is in `@levix/i18n` (`availability.en.json`); the product's installation source and the endpoint address are facts in `@levix/content`.
- **Rationale**: the modular monolith's modules (ADR-0001, ADR-0013: facts and text passed into shared components); the function deploys from its folder.

## R9. Installation sources

- **Decision**: AnyContext: `https://github.com/Levix-Digital/any-context-releases/releases/latest` ("Download"), the page its README points to for the installer. Dev Cycle Protocol: `https://github.com/Levix-Digital/ai-code-agent-skills#installation` ("Install"), since it is installed from its repository with a script. Products in development have none, and the validation refuses an available or preview product without one.

## R10. Deploying the function

- **Decision**: the `Deploy` workflow gains a `functions` job that runs `firebase deploy --only functions,firestore` when `functions/`, `firestore.rules` or `firestore.indexes.json` changed since the last production deploy, with the same keyless identity. `npm run hosting:setup` grants that identity the roles it needs (Cloud Functions Developer, Service Account User on the runtime service account, Firebase Rules Admin, Cloud Datastore Index Admin) and enables the APIs. The job is skipped until the repository variable `FUNCTIONS_DEPLOY` is `true`, which the owner sets after the one-time setup (Firestore database in Montreal, Trigger Email extension, mailing address).
- **Rationale**: keeps continuous deploy (ADR-0008) without breaking site deploys before the backend exists.

## R12. Announcing release candidates

- **Decision**: an hourly workflow of this repository reads the latest releases of each product's public releases repository (`Levix-Digital/<product>-releases`) through the GitHub API and announces every pre-release tagged `vX.Y.Z-rc.N` published in the last 3 days that has no `releaseAnnouncements` record; `npm run announce` does the same for one version by hand, with a preview by default. The unsubscribe secret is stored as is, since every announcement needs the subscriber's unsubscribe link.
- **Rationale**: the owner decided that every product publishes its releases in a public releases repository, so the website needs nothing from the products but the pre-release convention, and no token or secret is shared. The 3-day window keeps the first run from announcing past candidates.
- **Alternatives**: products dispatching an event to this repository (a token in every product repository); a manual tool only (the owner would have to remember every release candidate).

## R11. DocMapper site

- **Decision**: `sites/docmapper` like the other product sites; hosting target `docmapper` mapped in `.firebaserc` to the hosting site `docmapper` the owner created on 2026-11-13; `domains.json` gets `docmapper.levix.digital`; the DocMapper data entry gets its `site`, so its home card and the header and footer links follow.
- **Dependency**: the owner creates the hosting site and connects the domain in the Firebase console and Cloudflare, as for the other product sites.
