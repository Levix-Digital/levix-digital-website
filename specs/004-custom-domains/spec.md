# Feature Specification: Custom Domains for the Company Site and the Product Sites

**Feature Branch**: `feat/004-custom-domains`

**Created**: 2026-10-30

**Status**: Draft

**Input**: Backlog item FEAT-004: "Hostinger DNS records pointing the apex and each product subdomain to Firebase Hosting, verified by Firebase."

## User Scenarios & Testing *(mandatory)*

The users of this feature are the visitors of the website, who reach each site at its own address under `levix.digital`, and the people who publish the website, who set the domains up once and check them afterwards. Today the five sites answer only at their default `*.web.app` addresses.

### User Story 1 - Each site answers at its own domain (Priority: P1)

A visitor opens `https://levix.digital` and sees the company home; `https://anycontext.levix.digital`, `https://devcycle.levix.digital`, `https://gedo.levix.digital` and `https://aurora.levix.digital` show each product site. Every address is served over HTTPS with a valid certificate.

**Why this priority**: it is the goal of the item; the domains are the public addresses of the company and its products.

**Independent Test**: open each of the five addresses in a browser; each shows its site with a valid certificate and no warning.

**Acceptance Scenarios**:

1. **Given** the domains are set up and the DNS records are in place, **When** a visitor opens `https://levix.digital`, **Then** the company home is shown over HTTPS with a valid certificate.
2. **Given** the same, **When** a visitor opens `https://<product>.levix.digital` for each of the four products, **Then** that product's site is shown over HTTPS with a valid certificate.
3. **Given** a visitor opens `http://` instead of `https://`, **When** the page loads, **Then** the visitor is moved to the `https://` address.
4. **Given** a visitor opens `https://www.levix.digital/<path>`, **When** the request is answered, **Then** it is permanently redirected to `https://levix.digital/<path>`.

---

### User Story 2 - Set up the domains with one command and a list of records (Priority: P1)

A maintainer runs one command with their own Google login. It connects each domain to its hosting site in the Firebase project and prints, per domain, the DNS records to add at Hostinger and the records Firebase found that must be removed. The maintainer copies them into the Hostinger DNS zone and runs the command again later to see what is still missing.

**Why this priority**: the DNS zone is at Hostinger and the records Firebase needs are only known once each domain is connected; without this step the domains cannot be verified.

**Independent Test**: run the command twice in a row; the first run connects the domains and prints the records, the second changes nothing and prints the same records with their state.

**Acceptance Scenarios**:

1. **Given** a domain that is not connected yet, **When** the command runs, **Then** it connects the domain to its site and reports it as `created`.
2. **Given** a domain already connected, **When** the command runs, **Then** it reports it as `exists` and changes nothing.
3. **Given** connected domains, **When** the command runs, **Then** it prints for each domain the records to add (type, host as entered at Hostinger, value) and the records to remove, and never lists records of other names (mail, other subdomains).
4. **Given** the project does not exist or the caller cannot manage it, **When** the command runs, **Then** it stops before changing anything and says why.

---

### User Story 3 - Check the state of the domains (Priority: P2)

A maintainer runs a status command that shows, per domain, whether Firebase has verified the ownership, whether the domain points only to Firebase, and whether the certificate is active, and ends with success only when every domain is fully active. After a deploy, the address check also requests every domain.

**Why this priority**: DNS changes and certificates take from minutes to a day; the maintainer needs to know when it is done and to notice later if a record is changed at Hostinger.

**Independent Test**: before the records are added, the status command fails and names the missing records; after they propagate, it succeeds.

**Acceptance Scenarios**:

1. **Given** a domain whose records are missing, **When** the status command runs, **Then** it fails and lists that domain with its state and the records still to add or remove.
2. **Given** every domain verified, pointing only to Firebase and with an active certificate, **When** the status command runs, **Then** it succeeds.
3. **Given** a production deploy of a site, **When** the deploy checks the published addresses, **Then** it requests the site's domain as well as its default address, and fails naming the domain when it does not answer the home page.

### Edge Cases

- The Hostinger zone has parking or website records on the apex or on `www` (A, AAAA or CNAME pointing elsewhere): they appear among the records to remove; leaving them makes the domain answer from two places and the status reports a conflict.
- Mail records (MX, SPF and other TXT records on the apex used by mail) must stay: the new TXT record for Firebase is added next to them, never replacing them.
- A CAA record on the zone that does not allow the certificate authorities Firebase uses blocks the certificate; the status shows the certificate stuck and the record Firebase found.
- A subdomain created at Hostinger as a website (with its own folder or records) instead of only DNS records: its records appear among the records to remove.
- A domain connected to another Firebase project: the command reports the ownership conflict and stops for that domain.
- DNS propagation: records added may take up to 24 hours to be seen, and the certificate is issued after that; the status command can be run again at any time.
- A new product site added later: adding its domain to the domain list and running the setup command again connects it, without changing the scripts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST keep one list of the custom domains of each hosting site: `levix.digital` and `www.levix.digital` (redirect to `levix.digital`) for the home site, and `<product>.levix.digital` for each product site.
- **FR-002**: A setup command MUST connect every listed domain to its hosting site in the Firebase project, creating only what is missing, and report each domain as `created` or `exists`.
- **FR-003**: The setup command MUST check, before changing anything, that the project exists and that the caller's login can manage its hosting.
- **FR-004**: The setup and status commands MUST print, per domain, the DNS records Firebase needs that are missing (to add) and the records Firebase found that must be removed, with the host written as it is entered in the Hostinger DNS zone (`@` for the apex, the subdomain label otherwise).
- **FR-005**: The status command MUST show per domain the ownership state, the host state and the certificate state, and MUST exit with success only when every domain is fully active.
- **FR-006**: `www.levix.digital` MUST answer with a permanent redirect to the same path on `https://levix.digital`.
- **FR-007**: The address check after a production deploy MUST request each published site's custom domain in addition to its default address.
- **FR-008**: Neither command may change DNS records: the zone at Hostinger is changed by the maintainer.
- **FR-009**: The commands MUST use the caller's own login and no stored credential; nothing new is added to the deploy identity.
- **FR-010**: The behavior of the commands (what they create, what they print, when they fail) MUST be covered by automated tests that replace the calls to Google Cloud.

### Key Entities

- **Custom domain**: a domain name, the hosting site it belongs to and, for `www`, the domain it redirects to.
- **DNS record**: type, host, value and the action needed (add or remove), as reported by Firebase for one domain.
- **Domain state**: ownership, host and certificate states of one domain.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five domains answer their site's home page over HTTPS with a valid certificate, and `www.levix.digital` redirects to `levix.digital`.
- **SC-002**: The status command reports every domain as active.
- **SC-003**: Running the setup command a second time changes nothing.
- **SC-004**: The mail of `levix.digital` keeps working after the records are changed (a message to contact@levix.digital is delivered).
- **SC-005**: The first production deploy after the domains are active checks and passes every published domain.

## Assumptions

- The DNS zone of `levix.digital` stays at Hostinger (technical specification) and the maintainer edits it in the Hostinger panel; the Hostinger API is not used.
- The records needed (A, TXT and, while the certificate is issued, ACME challenge records) are whatever Firebase reports for each domain; the commands print them rather than hard-coding them.
- `www.levix.digital` redirects to the apex; no other alias is served.
- The firebase hosting API is already enabled in the project by FEAT-002.
