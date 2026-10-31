# Feature Specification: Security Headers for Every Site

**Feature Branch**: `feat/005-security-headers`

**Created**: 2026-10-30

**Status**: Draft

**Input**: Backlog item FEAT-005: "HSTS, Content Security Policy and other security headers set in firebase.json for every site." The technical specification asks for "HTTPS everywhere with HSTS, and a Content Security Policy that allows only the site's own origin, Google Analytics and the functions".

## User Scenarios & Testing *(mandatory)*

The users of this feature are the visitors of the five sites, who should be protected from downgrade to plain HTTP, injected scripts, framing and leaked addresses, and the people who publish the website, who need to know when a change or the DNS provider breaks those protections.

### User Story 1 - Every page is served with the security headers (Priority: P1)

A visitor opens any page or file of any of the five sites. The response tells the browser to use HTTPS only for the domain and its subdomains, to run scripts, styles, images, fonts and connections only from the site's own origin, never to show the page inside a frame, not to guess file types, to send only the origin as referrer to other sites, to deny powerful browser features the site does not use, and to isolate the window from pages it opens.

**Why this priority**: it is the goal of the item; a site without these headers is exposed to cross-site scripting, clickjacking and HTTPS downgrade.

**Independent Test**: request the home page, a file under `/assets/` and an unknown path of each site in the local hosting emulator; every response carries the same set of security headers with the expected values.

**Acceptance Scenarios**:

1. **Given** the sites built and served by the hosting emulator, **When** the home page, an asset and an unknown path of each site are requested, **Then** each response carries the security headers with the values of the policy.
2. **Given** the same, **When** the home page of each site is opened in a browser, **Then** the page renders with no blocked resource and no console error.
3. **Given** a page with an inline script, an inline style or an event handler attribute in the built output, **When** the build is checked, **Then** the check fails naming the page, because the policy would block it.

---

### User Story 2 - One policy for all sites (Priority: P1)

A maintainer changes the policy in one place (for example, to allow Google Analytics when consent is added) and every site gets the same change; a site whose headers drift from the policy fails the checks.

**Why this priority**: five copies of the same headers in the hosting configuration drift apart unless something compares them.

**Independent Test**: change one header value of one site in the hosting configuration; the automated tests fail naming the site and the header.

**Acceptance Scenarios**:

1. **Given** the hosting configuration, **When** the tests run, **Then** they pass only if every site serves exactly the headers of the policy on every path.
2. **Given** a site missing a header or with a different value, **When** the tests run, **Then** they fail naming the site and the header.

---

### User Story 3 - Deploys check the headers live (Priority: P2)

After a production deploy, the address check also confirms that the default address and the custom domain of each published site return the security headers, so a header removed or changed on the way (by the DNS provider's proxy on the apex, for example) is seen at once.

**Why this priority**: the apex goes through Cloudflare's proxy, which could add, drop or rewrite headers; checking only the emulator would not see it.

**Independent Test**: a deploy of `gedo` reports the headers as present at `https://levix-gedo.web.app/` and `https://gedo.levix.digital/`.

**Acceptance Scenarios**:

1. **Given** a production deploy of a site, **When** the deploy checks the published addresses, **Then** it fails naming the address and the header when a security header is missing or different.
2. **Given** HSTS added by the hosting provider or the proxy with a different value, **When** the check runs, **Then** it fails naming the address.

### Edge Cases

- The Strict-Transport-Security header covers subdomains: every name under `levix.digital` must be served over HTTPS for a year once a browser has seen it. All current names are HTTPS-only; a future name without a certificate would be unreachable for those browsers.
- Preloading `levix.digital` into browsers' HSTS lists is not done: it is hard to undo and can be requested later.
- Features added later (the theme script that runs before paint, Google Analytics after consent, the contact and translation functions, App Check) need origins or script hashes the policy does not allow today; each of those items adds what it needs to the policy and its tests in its own change.
- Cloudflare features that inject scripts into proxied pages (email address obfuscation, Rocket Loader, Web Analytics) would be blocked or would change the page; obfuscation serves its script from the same origin and is allowed, the others stay off.
- Error pages (404) and redirects are served with the same headers.
- Firebase's own default headers (for example `X-Content-Type-Options`) must not be duplicated with a different value.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every response of every site MUST carry: `Strict-Transport-Security` (one year or more; configured with subdomains and no preload, but Firebase serves its own value, see research R8), `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying the powerful features the sites do not use, and `Cross-Origin-Opener-Policy: same-origin`.
- **FR-002**: The Content Security Policy MUST allow scripts, styles, fonts, connections and manifests only from the site's own origin, images from the own origin and `data:`, no plugins (`object-src 'none'`), no `<base>` change, forms posting only to the own origin, no framing by any page, and MUST upgrade insecure requests. No `'unsafe-inline'` and no `'unsafe-eval'`.
- **FR-003**: The policy MUST be defined once in the repository; the tests MUST fail when any site's configured headers differ from it.
- **FR-004**: The hosting check in the emulator MUST verify the headers on the home page, an asset and an unknown path of every site.
- **FR-005**: The build check MUST fail when a built page contains an inline script, an inline style element, a `style` attribute or an event handler attribute.
- **FR-006**: The Lighthouse check MUST fail when a page logs a console error (which is how a blocked resource shows up).
- **FR-007**: The address check after a production deploy MUST verify the security headers at the default address and the custom domain of each published site.
- **FR-008**: The technical documentation MUST describe the headers, why each one is set, and how a later feature extends the policy.

### Key Entities

- **Security policy**: the list of header names and values that every site serves.
- **Content Security Policy directive**: a resource type and the sources allowed for it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five sites answer every request with the seven security headers, at their default address and at their domain.
- **SC-002**: The five home pages render in a browser with no blocked resource and no console error.
- **SC-003**: A public header scanner (Mozilla HTTP Observatory) rates `levix.digital` A or better.
- **SC-004**: The first production deploy after the merge checks and passes the headers at every published address.

## Assumptions

- The sites are static pages built by Vite with no inline scripts or styles today (checked on 2026-10-30 build output).
- Cloudflare proxies only the apex and passes the origin's headers through; the product subdomains are served by Firebase directly.
- Headers are set in the hosting configuration; Cloudflare transform rules are not used.
