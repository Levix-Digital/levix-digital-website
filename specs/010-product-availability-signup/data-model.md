# Data Model: Product Availability and Release Candidate Signup

## Product (in `@levix/content`, changed)

| Field | Type | Rule |
|---|---|---|
| `status` | `available` \| `preview` \| `in-development` | unchanged |
| `install` | `{ url: string; label: string }`, optional | required when `status` is `available` or `preview`, absent when `in-development`; `url` is https |
| `site` | https address | now set for every product (DocMapper included) |

`validatePortfolio` enforces the `install` rule and names the faulty product.

## ReleaseSubscription (Firestore `releaseSubscriptions/{id}`)

`id` = SHA-256 hex of `lowercase(trim(email)) + "|" + product`.

| Field | Type | Notes |
|---|---|---|
| `email` | string | normalized (trimmed, lowercased domain and local part), at most 254 characters |
| `product` | string | one of `docmapper`, `anycontext`, `devcycle`, `gedo`, `aurora` |
| `state` | `pending` \| `confirmed` | |
| `consent` | `{ version: string; text: string; page: string; givenAt: Timestamp }` | the wording shown, the page address, the time |
| `confirmedAt` | Timestamp, optional | set on confirmation |
| `confirmHash` | string | SHA-256 of the confirmation secret |
| `unsubscribeSecret` | string | kept as is: every later email (announcements) needs it for the subscriber's unsubscribe link |
| `lastEmailAt` | Timestamp | time of the last confirmation email |
| `expiresAt` | Timestamp, optional | TTL field: signup + 7 days while pending; removed on confirmation |

State transitions:

- (none) → `pending`: valid signup; tokens created; confirmation email queued.
- `pending` → `pending`: new signup for the same address and product; if `lastEmailAt` is older than 24 hours, new tokens, new `expiresAt`, new email; otherwise nothing changes.
- `confirmed` → `confirmed`: new signup; nothing changes and no email is sent (same answer to the visitor).
- `pending` → `confirmed`: confirmation token matches and `expiresAt` is in the future.
- any → (deleted): unsubscribe token matches; or TTL after `expiresAt`.

## SignupLimit (Firestore `releaseSignupLimits/{id}`)

`id` = SHA-256 hex of the client address + `|` + the UTC hour (`YYYY-MM-DDTHH`). Fields: `count` (number), `expiresAt` (TTL, end of the hour + 1 hour). The eleventh signup of a client in the same hour is refused.

## Mail (Firestore `mail/{auto id}`, read by the Trigger Email extension)

`to`, `from` (`Levix Digital <releases@levix.digital>`), `message.subject`, `message.text`, `message.html`, `headers` (`List-Unsubscribe`), `deleteAt` (TTL, 30 days).

## Announcement (Firestore `releaseAnnouncements/{product}-{version}`)

`product`, `version`, `downloadUrl`, `notes` (optional), `createdAt`, `recipients` (number of emails), `state` (`queuing`, then `queued`). Created before the mail is queued, so a version is announced once.

## Firestore rules

Every client read and write is denied; only the function (Admin SDK) reads and writes.
