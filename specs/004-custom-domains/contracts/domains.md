# Contract: Domains

## `domains.json`

```json
{
  "home": "levix.digital",
  "anycontext": "anycontext.levix.digital",
  "devcycle": "devcycle.levix.digital",
  "gedo": "gedo.levix.digital",
  "aurora": "aurora.levix.digital"
}
```

Keys are the hosting targets of `firebase.json`; every target has one domain and a domain appears once.

## `npm run domains:status [-- <site>...]`

Read-only. Gets the caller's token with `gcloud auth print-access-token`, then per domain `GET https://firebasehosting.googleapis.com/v1beta1/projects/<project>/sites/<site>/customDomains/<domain>`. Prints:

```text
ok    levix.digital (home)  ownership OWNERSHIP_ACTIVE  host HOST_ACTIVE  certificate CERT_ACTIVE
error gedo.levix.digital (gedo)  ownership OWNERSHIP_MISSING  host HOST_ACTIVE  certificate CERT_VALIDATING
  add     CNAME  gedo  levix-gedo.web.app.
  remove  A      gedo  104.21.96.10
```

Rows come from `requiredDnsUpdates.desired` (`ADD`) and `requiredDnsUpdates.discovered` (`REMOVE`); hosts are relative to `levix.digital`. A 404 prints `error <domain> (<site>) not connected to <site-id>`. Exit 0 only when every selected domain is `ok`.

## `npm run verify:live -- <site>...`

Unchanged interface; per site it requests `https://<site-id>.web.app/` and `https://<domain>/`, and fails naming every address that does not answer 200 HTML.
