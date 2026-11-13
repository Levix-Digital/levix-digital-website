# Contract: `releaseSignup` HTTPS function

Base: `https://northamerica-northeast1-levix-digital.cloudfunctions.net/releaseSignup`

All requests are `POST` with `Content-Type: application/json`. CORS: the `Origin` must be a product site (`https://<product>.levix.digital`, `https://levix-<product>.web.app`, or a preview channel `https://levix-<product>--<channel>.web.app`); any other origin gets `403` with no CORS headers. `OPTIONS` answers the preflight for allowed origins.

## `POST /subscribe`

Request:

```json
{ "email": "ana@example.com", "product": "gedo", "consent": true, "consentVersion": "2026-11-13", "page": "https://gedo.levix.digital/", "website": "" }
```

`website` is the honeypot and must be empty.

| Status | Body | When |
|---|---|---|
| 202 | `{ "status": "check-inbox" }` | accepted (new, pending, or already confirmed: same answer) |
| 400 | `{ "error": "invalid", "fields": ["email" \| "consent" \| "product"] }` | validation failed |
| 429 | `{ "error": "rate-limited" }` | over the per-client limit |
| 500 | `{ "error": "unavailable" }` | storage failed |

A filled honeypot answers 202 and stores nothing.

## `POST /confirm`

Request: `{ "token": "<id>.<secret>" }`

| Status | Body |
|---|---|
| 200 | `{ "status": "confirmed", "product": "gedo" }` (also when already confirmed) |
| 410 | `{ "error": "expired" }` (unknown, wrong or expired token) |

## `POST /unsubscribe`

Request: `{ "token": "<id>.<secret>" }`

| Status | Body |
|---|---|
| 200 | `{ "status": "unsubscribed" }` (also when the subscription no longer exists) |

A token whose secret does not match an existing subscription answers 200 and deletes nothing.

## Confirmation email

- Subject: `Confirm: <Product> release candidates from Levix Digital`
- Body: what was asked and for which product; the confirmation link `https://<product site>/subscription/confirm#<token>` (valid 7 days); a line saying to ignore the email if they did not ask; the unsubscribe link `https://<product site>/subscription/unsubscribe#<token>`; the sender block: `Levix Digital Inc.`, the mailing address, `contact@levix.digital`.
- Header: `List-Unsubscribe: <https://<product site>/subscription/unsubscribe#<token>>`.
