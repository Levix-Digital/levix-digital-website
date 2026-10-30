# Feature Specification: Custom Domains for the Company Site and the Product Sites

**Feature Branch**: `feat/004-custom-domains`

**Created**: 2026-10-30

**Status**: Draft

**Input**: Backlog item FEAT-004: "DNS records pointing the apex and each product subdomain to Firebase Hosting, verified by Firebase." The zone of `levix.digital` moved from Hostinger to Cloudflare, and the five domains were connected to their hosting sites in the Firebase console by Levi on 2026-10-30.

## User Scenarios & Testing *(mandatory)*

The users of this feature are the visitors of the website, who reach each site at its own address under `levix.digital`, and the people who publish the website, who need to know that the domains are healthy and to notice when one breaks.

### User Story 1 - Each site answers at its own domain (Priority: P1)

A visitor opens `https://levix.digital` and sees the company home; `https://anycontext.levix.digital`, `https://devcycle.levix.digital`, `https://gedo.levix.digital` and `https://aurora.levix.digital` show each product site. Every address is served over HTTPS with a valid certificate; `http://` and `https://www.levix.digital` lead to the `https://` address of the apex.

**Why this priority**: it is the goal of the item; the domains are the public addresses of the company and its products.

**Independent Test**: open each of the five addresses and `www.levix.digital` in a browser; each shows its site with a valid certificate and no warning.

**Acceptance Scenarios**:

1. **Given** the DNS records in place, **When** a visitor opens `https://levix.digital`, **Then** the company home is shown over HTTPS with a valid certificate.
2. **Given** the same, **When** a visitor opens `https://<product>.levix.digital` for each of the four products, **Then** that product's site is shown over HTTPS with a valid certificate.
3. **Given** a visitor opens `http://` instead of `https://`, **When** the page loads, **Then** the visitor is moved to the `https://` address.
4. **Given** a visitor opens `https://www.levix.digital/<path>`, **When** the request is answered, **Then** it is permanently redirected to `https://levix.digital/<path>`.

---

### User Story 2 - Check the state of the domains (Priority: P1)

A maintainer runs one read-only command with their own Google login. It shows, per domain, whether Firebase has verified the ownership, whether the domain points only to Firebase and whether the certificate is active, lists the DNS records Firebase still asks to add or remove, and ends with success only when every domain is fully active.

**Why this priority**: DNS changes and certificates take from minutes to a day, and a record changed later in the DNS provider silently breaks a site; the state is otherwise only visible one site at a time in the console.

**Independent Test**: with a product subdomain still proxied by the DNS provider, the command fails and names the domain, its states and the records to change; after the fix propagates, it succeeds.

**Acceptance Scenarios**:

1. **Given** a domain whose records are missing or wrong, **When** the command runs, **Then** it fails and lists that domain with its states and the records to add or remove.
2. **Given** every domain verified, pointing only to Firebase and with an active certificate, **When** the command runs, **Then** it succeeds.
3. **Given** a domain listed in the repository that is not connected to its site in Firebase, **When** the command runs, **Then** it fails and names it.
4. **Given** the caller cannot read the project, **When** the command runs, **Then** it fails and says why.

---

### User Story 3 - Deploys check the domains (Priority: P2)

After a production deploy, the address check requests each published site's domain as well as its default address, and fails naming the domain when it does not answer the home page.

**Why this priority**: a broken record shows up on the next deploy at no extra cost.

**Independent Test**: a deploy of `gedo` reports both `https://levix-gedo.web.app/` and `https://gedo.levix.digital/`.

**Acceptance Scenarios**:

1. **Given** a production deploy of a site, **When** the deploy checks the published addresses, **Then** it requests the default address and the domain, and lists both.
2. **Given** a domain that answers "Site Not Found" or any status other than 200 HTML, **When** the check runs, **Then** it fails naming the domain.

### Edge Cases

- A Firebase-hosted name proxied by the DNS provider: Firebase does not see its records, keeps the ownership missing and cannot issue the certificate; the subdomain answers "Site Not Found". The status command shows it with the records Firebase asks for.
- The apex is proxied with a redirect rule for `www` at the DNS provider: it serves, but the certificate renewal of Firebase depends on the HTTP challenge passing through the proxy; the status command shows the certificate state so a failed renewal is seen.
- Mail records (MX, SPF) and verification TXT records (Brevo, Google) on the apex must stay; the Firebase TXT record sits next to them.
- A CAA record that does not allow the certificate authorities Firebase uses blocks the certificate; the status shows the certificate stuck.
- A new product site added later: adding its domain to the domain list makes the status command and the deploy check include it, without changing the scripts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST keep one list of the custom domain of each hosting site: `levix.digital` for the home site and `<product>.levix.digital` for each product site.
- **FR-002**: A read-only status command MUST show per listed domain the ownership state, the host state and the certificate state reported by Firebase, and the DNS records Firebase asks to add or remove, with the host written relative to the zone (`@` for the apex).
- **FR-003**: The status command MUST exit with success only when every listed domain is connected to its site and has active ownership, host and certificate.
- **FR-004**: `www.levix.digital` MUST answer with a permanent redirect to the same path on `https://levix.digital` (today a rule at the DNS provider); a manual test covers it.
- **FR-005**: The address check after a production deploy MUST request each published site's custom domain in addition to its default address.
- **FR-006**: No command may change DNS records or the domains in Firebase; the status command uses the caller's own login and no stored credential, and nothing is added to the deploy identity.
- **FR-007**: The behavior of the status command and of the address check MUST be covered by automated tests that replace the calls to Google Cloud and the network.
- **FR-008**: The technical documentation MUST record that the DNS of `levix.digital` is at Cloudflare and how the records of Firebase-hosted names are set (not proxied).

### Key Entities

- **Custom domain**: a domain name and the hosting site it belongs to.
- **DNS record**: type, host, value and the action Firebase asks for (add or remove).
- **Domain state**: ownership, host and certificate states of one domain.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five domains answer their site's home page over HTTPS with a valid certificate, and `www.levix.digital` redirects to `levix.digital`.
- **SC-002**: The status command reports every domain as active.
- **SC-003**: The mail of `levix.digital` keeps working (a message to contact@levix.digital is delivered).
- **SC-004**: The first production deploy after the merge checks and passes every published domain.

## Assumptions

- The zone of `levix.digital` is at Cloudflare and is edited by Levi in the Cloudflare dashboard; the Cloudflare API is not used.
- The domains were connected to their sites in the Firebase console; the repository does not create or delete them.
- `www.levix.digital` is redirected by Cloudflare, not served by Firebase.
