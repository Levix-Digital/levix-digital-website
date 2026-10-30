# Quickstart: Custom Domains

1. In the Cloudflare dashboard (`levix.digital`, DNS, Records), each product subdomain is `CNAME <product> levix-<product>.web.app` with the proxy off (grey cloud, "DNS only"). Leave the MX, SPF and verification TXT records as they are.
2. On a machine with `gcloud` logged in as an owner of `levix-digital`, in the repository: `npm ci`, then `npm run domains:status`. It lists what Firebase still asks for; repeat until it succeeds (certificates can take up to 24 hours).
3. Open the five addresses and `https://www.levix.digital` in a browser; send a test message to contact@levix.digital.
