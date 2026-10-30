# Quickstart: Custom Domains

1. On a machine with `gcloud` logged in as an owner of `levix-digital`, in the repository: `npm ci` then `npm run domains:setup`.
2. In the Hostinger panel (Domains, `levix.digital`, DNS / Nameservers), export or copy the current zone first. Then, for every row printed: `add` creates the record with that type, name and value (TTL default); `remove` deletes that record. Do not touch MX records or the TXT records used by mail (SPF, DKIM, DMARC).
3. Wait a few minutes, then run `npm run domains:status`. Repeat until it succeeds (up to 24 hours); new rows may appear while the certificate is issued (ACME challenge records): add them too.
4. Open the five addresses and `https://www.levix.digital` in a browser; send a test message to contact@levix.digital.
