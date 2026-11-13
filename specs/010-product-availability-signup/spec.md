# Feature Specification: Product Availability and Release Candidate Signup

**Feature Branch**: `feat/010-product-availability-signup`

**Created**: 2026-11-13

**Status**: Draft

**Input**: Backlog items FEAT-013 (download panel), FEAT-036 (DocMapper site), FEAT-037 (availability and release candidate signup on product pages) and FEAT-038 (the signup function). Decisions taken with the product owner on 2026-11-13, after the availability badges left the home cards (PR #19): every product card on the home behaves the same and opens the product's own site, even when the product cannot be installed yet, because visitors should see what each product can do; availability is stated on the product's own page instead of the home; while a product cannot be downloaded, its page shows the download button disabled and, right below it, a form to receive the release candidates of that product by email. DocMapper gets a site so its card links like the others; the product owner creates its Firebase Hosting site and gives its name. FEAT-010 (a full-width availability banner) is superseded by this feature.

## User Scenarios & Testing *(mandatory)*

The users are visitors of a product site (`<product>.levix.digital`): developers and technical decision makers who arrive from the company home or from a link, and who want to know whether they can install the product today.

### User Story 1 - Know on the product page whether I can install it (Priority: P1)

A visitor opens a product's site and sees, near the top, the product's name, what it is for and whether it can be downloaded now. For a product that can be installed, the download action works; for one that cannot, the action is visibly disabled and says why.

**Why this priority**: availability left the home cards; without it on the product page, visitors cannot tell what they can use today, and the vision requires stating availability honestly.

**Independent Test**: open each product site at 1280 px and 375 px, in both themes; AnyContext and Dev Cycle Protocol show an enabled download action that leads to the product's real installation source; Gedo, Aurora Dev Suite and DocMapper show a disabled download button with a short note that the product is in development.

**Acceptance Scenarios**:

1. **Given** a product whose status is available, **When** its site loads, **Then** it shows an enabled download action that opens the product's published installation source (release page or installation instructions) and states that the product is available.
2. **Given** a product whose status is preview, **When** its site loads, **Then** the download action is enabled and the page says the builds are previews.
3. **Given** a product whose status is in development, **When** its site loads, **Then** the download button is shown disabled (not focusable as an action, announced as unavailable to assistive technology) with a note saying the product is in development and not available for download yet.
4. **Given** a product's status changes in the product data, **When** the sites are rebuilt, **Then** the product page follows with no other change.

---

### User Story 2 - Ask to be told when release candidates come out (Priority: P1)

On the page of a product that cannot be downloaded yet, right below the disabled download button, a visitor leaves an email address and gives consent to receive emails about that product's release candidates. They get an email asking them to confirm, and only after they confirm are they on the list.

**Why this priority**: it turns the interest of a visitor who cannot install the product yet into a way to reach them when it can be tried, which is the reason the owner asked for this feature.

**Independent Test**: on the Gedo site, submit an address with the consent box ticked; the page says to check the inbox; the email arrives with a confirmation link, the sender's identification and an unsubscribe link; opening the confirmation link shows that the subscription is confirmed; the stored record shows the product, the consent wording and both times.

**Acceptance Scenarios**:

1. **Given** the page of a product in development, **When** it loads, **Then** the signup form is shown right below the disabled download button with an email field, a consent checkbox that is not ticked, a statement of what will be sent (emails from Levix Digital Inc. about release candidates of this product), who sends it (Levix Digital Inc., with a contact address) and that consent can be withdrawn at any time, and a submit button.
2. **Given** the form, **When** the visitor submits without a valid address or without ticking the consent box, **Then** nothing is sent and the form says what is missing, next to the field.
3. **Given** a valid address and consent, **When** the visitor submits, **Then** the page says a confirmation email was sent and asks them to confirm from it, and the same message is shown whether or not the address was already subscribed.
4. **Given** the confirmation email, **When** it arrives, **Then** it names the product, contains a confirmation link, identifies the sender (company name, mailing address, contact email) and contains a working unsubscribe link.
5. **Given** the confirmation link, **When** the visitor opens it within 7 days, **Then** a page on the product's site says the subscription is confirmed; opening it again says the same; opening it after 7 days or with a wrong token says the link is no longer valid and invites them to sign up again.
6. **Given** a subscription that was never confirmed, **When** 7 days pass, **Then** its record is deleted.
7. **Given** a visitor subscribed to one product, **When** they sign up on another product's page, **Then** they get a separate subscription for that product, confirmed separately.

---

### User Story 3 - Stop the emails whenever I want (Priority: P1)

Anyone who received an email from the list can unsubscribe with one link, without signing in or typing anything.

**Why this priority**: Canada's Anti-Spam Legislation (CASL) requires an unsubscribe mechanism in every message, effective within 10 business days; the company should honor it immediately.

**Independent Test**: open the unsubscribe link of a confirmation email; a page says the address will receive no more emails about that product, and the subscription record no longer exists.

**Acceptance Scenarios**:

1. **Given** any email the list sends, **When** the visitor opens its unsubscribe link, **Then** a page on the product's site says the address is unsubscribed from that product, with no further step.
2. **Given** an unsubscribe, **When** it is done, **Then** the subscription and the address are removed from storage at once, and opening the link again shows the same page.

---

### User Story 4 - See DocMapper like the other products (Priority: P2)

A visitor activates the DocMapper card on the home and lands on DocMapper's own site, which shows what it is for, that it is in development, the disabled download button and the release candidate signup.

**Why this priority**: the owner wants every home card to behave alike; DocMapper was the only card without a site.

**Independent Test**: build all sites; the DocMapper site exists with the shared header, footer and availability panel; its home card links to `https://docmapper.levix.digital`; the site deploys to the Firebase Hosting site the owner created.

**Acceptance Scenarios**:

1. **Given** the home, **When** the DocMapper card is activated, **Then** the DocMapper site opens.
2. **Given** the DocMapper site, **When** it loads, **Then** it has the same header, footer, themes and availability panel as the other product sites.

### User Story 5 - Hear when a release candidate is out (Priority: P1)

Added with the owner on 2026-11-13. When a product publishes a release candidate, its confirmed subscribers get an email with the version, the download page and the notes, without the owner writing to each of them.

**Why this priority**: the list exists to bring testers to each release candidate; handling every email by hand would not scale.

**Independent Test**: publish a pre-release tagged `vX.Y.Z-rc.N` in the product's public releases repository; within the next hour every confirmed subscriber of that product receives one email with the release page, the notes, the sender block and their own unsubscribe link; pending and other products' subscribers receive nothing.

**Acceptance Scenarios**:

1. **Given** a new pre-release tagged `vX.Y.Z-rc.N` in a product's public releases repository, **When** the hourly check runs, **Then** each confirmed subscriber of that product is emailed once, with the version, the release page and up to 2000 characters of its notes.
2. **Given** a release candidate already announced, **When** the check runs again, **Then** nothing is sent.
3. **Given** a release candidate published more than 3 days before the check first sees it, **When** the check runs, **Then** it is not announced.
4. **Given** the owner, **When** they run the announce command for a product and version, **Then** they see how many subscribers would receive it and the email, and only with an explicit send option are the emails queued.

---

### Edge Cases

- The signup service is unavailable or answers with an error: the form says the signup could not be sent and offers contact@levix.digital; what the visitor typed stays in the form.
- The same address is submitted many times, or many addresses come from one client: at most one confirmation email per address and product every 24 hours, and a limit of signups per client per hour; over the limit the form says to try again later. The answer never reveals whether an address is subscribed.
- A bot fills hidden fields or posts directly to the service: the request is refused without sending email.
- A product changes from in development to available: the form disappears from its page at the next build; existing subscriptions stay so the owner can announce the release.
- JavaScript is disabled: the availability and the disabled button are still shown (the pages are prerendered); the form says that it needs JavaScript and offers contact@levix.digital.
- A visitor opens a confirmation or unsubscribe link on another device: it works, since the link carries everything needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every product site MUST show, near the top of its main page, the product's name, its one-sentence statement and an availability panel whose content comes from the product data (status and, when installable, the installation source).
- **FR-002**: For an available or preview product the panel MUST offer an enabled download action to the product's real installation source; for a preview it MUST say the builds are previews.
- **FR-003**: For a product in development the panel MUST show a disabled download button with a note that the product is not available for download yet.
- **FR-004**: Right below the disabled button, the panel MUST show the release candidate signup form described in User Story 2; the form MUST NOT appear for available or preview products.
- **FR-005**: The consent checkbox MUST be unticked by default, and the consent wording MUST state the purpose (emails about release candidates of the named product), the sender (Levix Digital Inc.), how to contact it, and that consent can be withdrawn at any time.
- **FR-006**: A signup MUST be stored only after the service validates the address, the product and the consent; the stored record MUST keep the address, the product, the exact consent wording shown (or its version), the page it was given on, and the times of signup and confirmation.
- **FR-007**: The service MUST send a confirmation email for each new or still unconfirmed signup, and a subscription MUST count as active only after its confirmation link is opened.
- **FR-008**: Every email MUST identify the sender with the company name, a mailing address and a contact email, and MUST contain an unsubscribe link that works for at least 60 days after it is sent.
- **FR-009**: Opening an unsubscribe link MUST remove the subscription and the address at once and show a confirmation page; opening it again MUST show the same page.
- **FR-010**: Unconfirmed signups MUST be deleted 7 days after they were made; confirmation links MUST stop working after 7 days.
- **FR-011**: The service MUST limit confirmation emails to one per address and product every 24 hours and limit signups per client, and MUST answer the same way whether or not an address is already subscribed.
- **FR-012**: The stored subscriptions MUST stay in Canada and MUST NOT be readable or writable from the browser; only the service reads and writes them.
- **FR-013**: The DocMapper site MUST exist with the shared layout and the availability panel, and the DocMapper home card MUST link to it like the other product cards.
- **FR-014**: The pages MUST keep the strict content security policy; the signup MUST be sent only to the site's own origin.
- **FR-015**: All text on the pages and in the emails MUST be in English, with no reference to how the site is built.
- **FR-016**: Each new release candidate of a product (a pre-release tagged `vX.Y.Z-rc.N` in the product's public releases repository, published in the last 3 days) MUST be emailed once to every confirmed subscriber of that product, each email with that subscriber's unsubscribe link and the sender identification.
- **FR-017**: The owner MUST be able to announce a release candidate by hand, with a preview before sending, and a version can be announced only once.

### Key Entities

- **Product availability**: the part of a product's data that says whether it can be installed (available, preview, in development) and, when it can, where (installation source address and label).
- **Release candidate subscription**: one address subscribed to one product; holds the consent given (wording version, page, time), its state (pending or confirmed), the confirmation time, and the secret tokens of its confirmation and unsubscribe links.
- **Outgoing email**: a confirmation message queued for delivery, naming the product and carrying the confirmation and unsubscribe links and the sender identification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On each of the five product sites, a visitor can tell within 5 seconds of the page loading whether the product can be downloaded today (the panel is visible without scrolling at 1280 px and 375 px).
- **SC-002**: A visitor can sign up for release candidates in under 1 minute, and the confirmation email arrives within 5 minutes.
- **SC-003**: 100% of emails sent by the list carry the sender identification and a working unsubscribe link.
- **SC-004**: An unsubscribe takes effect immediately: no email for that product reaches the address after the link is opened.
- **SC-005**: No unconfirmed signup is kept longer than 8 days.
- **SC-006**: Every home card opens its product's site; no card is without a link.

## Assumptions

- The emails carry the mailing address the owner gave on 2026-11-13 (31 Masters Square SE, Calgary, Alberta, Canada) and are sent from `releases@levix.digital`, an alias of the account that already sends the contact notifications. The live service is switched on after the owner's one-time setup (quickstart).
- Each product publishes its releases, release candidates included, in a dedicated public releases repository (`Levix-Digital/<product>-releases`), as decided by the owner on 2026-11-13; the products were asked to publish release candidates there as pre-releases.
- Only English is in scope; translations come with the internationalization features.
- The product sites stay minimal in this feature (name, statement, availability panel); features, plans and install instructions of each product come with their own backlog items.
- The installation sources are the ones the products publish today: the AnyContext releases page and the Dev Cycle Protocol installation instructions in its repository.
- Reaching DocMapper at `docmapper.levix.digital` needs its Firebase Hosting site (created by the owner) and the custom domain connected the same way as the other product sites.
- The existing privacy information of the sites is extended by the legal pages feature (FEAT-019); until then the consent wording itself states purpose, sender, contact and withdrawal.
