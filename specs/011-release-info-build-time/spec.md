# Feature Specification: Release Information at Build Time

**Feature Branch**: `feat/011-release-info-build-time`

**Created**: 2026-11-13

**Status**: Draft

**Input**: Backlog item FEAT-016 (latest version and download links of released products read from their GitHub Releases during the build). Request of the product owner on 2026-11-13: the download button of each product site should stay current on its own, showing the latest release and leading straight to it, without a manual change on the site. Builds on FEAT-037 (availability panel, `feat/010-product-availability-signup`), whose download action points to the product's install source (for AnyContext, the `releases/latest` page of `any-context-releases`). Every product publishes its releases in a public repository `Levix-Digital/<product>-releases`, so the release data can be read without credentials and stays public even if a product's code is closed.

## User Scenarios & Testing *(mandatory)*

The users are visitors of a product site who want to install the product, and the product owner, who publishes releases and expects the site to follow.

### User Story 1 - See which version I am downloading and get the right file (Priority: P1)

A visitor opens the site of a product that can be installed and sees, in the availability panel, the version of the latest release ("Download v0.45.2") and one direct link per operating system the release supports, so the installer starts downloading without going through the release page.

**Why this priority**: the visitor knows what they get, and the download takes one click instead of finding the right file among a dozen assets.

**Independent Test**: build the AnyContext site with network access; the panel shows the version of the latest non pre-release in `any-context-releases` and one link for Windows and one for Linux, each to the installer asset of that release; the general link to all releases stays available.

**Acceptance Scenarios**:

1. **Given** an available product whose releases repository has a published release, **When** its site is built, **Then** the panel shows the release's version and one direct link per declared operating system whose installer asset exists in that release.
2. **Given** a preview product, **When** its site is built, **Then** the panel shows the newest published release, pre-releases included, and says it is a preview build.
3. **Given** an operating system whose installer is missing from the latest release, **When** the site is built, **Then** no link is shown for it and the build says which asset was missing.
4. **Given** a product in development, **When** its site is built, **Then** no release is read and the panel is unchanged (disabled button and signup form).
5. **Given** a product without declared installers (installed from instructions, such as Dev Cycle Protocol), **When** its site is built, **Then** the panel keeps its install link and may show the version only.

---

### User Story 2 - The site follows a new release on its own (Priority: P1)

When a product publishes a new release in its releases repository, the product's site is rebuilt and published within about an hour, with the new version and links, without anyone touching the website repository.

**Why this priority**: it is what the owner asked for: no stale version on the site and no manual step per release.

**Independent Test**: run the release refresh with a releases repository whose latest tag differs from the `release.json` published by the site; the refresh starts the deploy for that site only; with equal tags it starts nothing.

**Acceptance Scenarios**:

1. **Given** each product site publishes `/release.json` with the version it was built with, **When** the hourly refresh runs, **Then** it compares it with the latest release of each available or preview product and starts the production deploy for exactly the sites that differ.
2. **Given** no site differs, **When** the refresh runs, **Then** nothing is deployed.
3. **Given** the refresh or the release service fails, **When** it runs, **Then** it reports the failure in the run and the sites stay as they are; the next run tries again.
4. **Given** the owner wants it at once, **When** they run the refresh by hand, **Then** it does the same check immediately.

---

### Edge Cases

- The releases service cannot be reached or limits the build: the build does not fail; the panel falls back to the install source link without a version, `release.json` records no version, and the next refresh run redeploys the site.
- A release is a draft: it is ignored.
- The latest release has a tag that is not `vX.Y.Z` (or `vX.Y.Z-rc.N` for previews): the version is shown as the tag without change.
- A visitor without JavaScript: the version and links are in the prerendered page.
- Two releases in the same hour: the refresh deploys the newest.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each product's data MUST name its public releases repository and MAY declare, per operating system (Windows, macOS, Linux), the name of its installer asset.
- **FR-002**: The build of a product site MUST read the latest release (available: latest non pre-release; preview: newest published, pre-releases included) from the releases repository, at build time only; pages MUST NOT call the releases service from the browser.
- **FR-003**: The availability panel MUST show "Download vX.Y.Z" (or the product's install label with the version) and one direct link per operating system whose asset exists, each labelled with the operating system; the link to all releases MUST stay.
- **FR-004**: When release data cannot be read, the build MUST succeed with the install source link alone and MUST say why in the build log.
- **FR-005**: Each product site MUST publish `/release.json` with the product id, the version it shows (or none) and the time of the build.
- **FR-006**: An hourly workflow MUST compare `/release.json` of each available or preview product site with the latest release and start the production deploy of the sites that differ, and only those; it MUST also run on demand.
- **FR-007**: The releases repository named in the product data MUST be the same one the release candidate announcements read (one source of truth, checked by a test).
- **FR-008**: The strict content security policy MUST stay unchanged; downloads are plain links.
- **FR-009**: All text MUST be in English, with no reference to how the site is built.

### Key Entities

- **Release source**: the releases repository of a product and its installer asset name per operating system.
- **Release information**: version, release page address, publish date and the direct links found, read once per build.
- **Published release marker**: `/release.json` of a product site, what the refresh compares.

## Success Criteria *(mandatory)*

- **SC-001**: After a product publishes a release, its site shows the new version within 90 minutes, with no change in the website repository.
- **SC-002**: A visitor reaches the installer of their operating system in one click from the product page.
- **SC-003**: A failure of the releases service never fails a build or a deploy.
- **SC-004**: The refresh deploys no site when nothing changed (zero deploys over a day without releases).

## Assumptions

- The releases repositories are public and the GitHub REST API is reachable from the build; the build uses the workflow's token when present to avoid the anonymous rate limit.
- AnyContext's installers are `actx-installer.exe` (Windows) and `actx-installer` (Linux), as published by its release workflow; the other products declare their installers when they start publishing them.
- Starting the deploy workflow from the refresh with the workflow's own token is allowed (manual dispatch events are the exception to the rule that a workflow's token does not start other workflows).
- The panel, its install link and the product sites come from FEAT-037; this feature only adds the version and the direct links.
