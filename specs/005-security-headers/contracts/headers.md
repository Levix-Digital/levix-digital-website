# Contract: Security Headers

Every response of every hosting target (`home`, `anycontext`, `devcycle`, `gedo`, `aurora`) carries exactly these headers, at the default address and at the custom domain:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` configured; Firebase serves its own value, accepted when `max-age` is one year or more (research R8) |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

`Cache-Control` is unchanged (`no-cache` for pages, `public, max-age=31536000, immutable` for `/assets/**`).

## Checks

- `npm test`: each target's `**` rule in `firebase.json` holds exactly the policy; a difference names the target and the header.
- `npm run verify:dist`: `error <site>: <page> has inline <kind>` for inline scripts, style elements, style attributes or event handler attributes.
- `npm run verify:hosting`: `ok <site>: security headers on <path>` for `/`, an asset and an unknown path; otherwise `error <site>: security headers on <path> (<header>: <value>)`.
- `npm run verify:live -- <site>...`: `ok <site>: <url>` only when the home page answers and every header matches; otherwise `error <site>: <url> <header> is <value>`.
