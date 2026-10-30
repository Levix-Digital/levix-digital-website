# Contract: Domain Commands

## `domains.json`

```json
{
  "home": [{ "domain": "levix.digital" }, { "domain": "www.levix.digital", "redirectTo": "levix.digital" }],
  "anycontext": [{ "domain": "anycontext.levix.digital" }],
  "devcycle": [{ "domain": "devcycle.levix.digital" }],
  "gedo": [{ "domain": "gedo.levix.digital" }],
  "aurora": [{ "domain": "aurora.levix.digital" }]
}
```

Keys are hosting targets of `firebase.json`. A domain appears once. `redirectTo` names a domain of the same target. The first domain without `redirectTo` is the site's address checked after a deploy.

## `npm run domains:setup [-- <site>...]`

Preflight: `gcloud projects describe` and `firebasehosting` access for the caller; stops before any change when either fails. Then, per domain: `GET .../sites/<site>/customDomains/<domain>`; on 404, `POST .../sites/<site>/customDomains?customDomainId=<domain>` with `{ "redirectTarget": ... }` when set. Prints `created` or `exists` per domain, then the records table (below). Exit 0 unless a call fails.

## `npm run domains:status [-- <site>...]`

Per domain: the three states and the records table. Exit 0 only when every selected domain is active (ownership, host and certificate).

## Records table

```text
levix.digital (home)  ownership OWNERSHIP_MISSING  host HOST_MISMATCH  certificate CERT_PREPARING
  add     A    @                199.36.158.100
  add     TXT  @                hosting-site=levix-digital
  remove  A    @                2.57.91.91
```

Rows come from `requiredDnsUpdates.desired` (action `ADD`) and `requiredDnsUpdates.discovered` (action `REMOVE`), plus the certificate's DNS verification records while the certificate is being issued; the values shown above are examples. Hosts are relative to `levix.digital`.

## `npm run verify:live -- <site>...`

Unchanged interface; for each site it now requests `https://<site-id>.web.app/` and `https://<domain>/`, and fails naming every address that does not answer 200 HTML.
