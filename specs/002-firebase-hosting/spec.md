# Feature Specification: Firebase Hosting Sites and Preview Channels

**Feature Branch**: `feat/002-firebase-hosting`

**Created**: 2026-10-30

**Status**: Draft

**Input**: Backlog item FEAT-002: "One Firebase project with a hosting site and target per domain, and preview channels for pull requests."

## User Scenarios & Testing *(mandatory)*

The users of this feature are the people who develop and publish the website, and the reviewers of its pull requests. It gives every site a place on Firebase Hosting, a repeatable way to publish it, and a temporary preview address for every pull request, so changes can be seen before they reach the public domains.

### User Story 1 - Set up the hosting project once (Priority: P1)

The owner of the Google account creates the Firebase project, links it to the billing account and runs one documented setup that creates the five hosting sites and the deploy identity used by the repository. Nothing in the setup needs a long-lived secret stored in the repository or in GitHub.

**Why this priority**: nothing can be published before the project, its sites and the deploy identity exist.

**Independent Test**: following only the written steps, a person with owner access creates the project and runs the setup; the project then lists five hosting sites and the repository's deploy identity, and running the setup a second time changes nothing.

**Acceptance Scenarios**:

1. **Given** a new Firebase project on the pay-as-you-go plan, **When** the owner runs the setup, **Then** the project has one hosting site for each of `home`, `anycontext`, `devcycle`, `gedo` and `aurora`.
2. **Given** a project where the setup already ran, **When** the owner runs it again, **Then** it reports what already exists and creates nothing twice.
3. **Given** the setup has run, **When** a workflow of the repository asks for credentials, **Then** it gets short-lived credentials for the deploy identity only, and a workflow of any other repository gets none.

---

### User Story 2 - Publish a site from the repository (Priority: P1)

A developer with access to the project builds the sites and publishes all of them, or a single one, to its hosting site with one command. Each site is served at its default Firebase address with clean URLs, its prerendered pages and caching suited to static files.

**Why this priority**: it is the deploy the continuous delivery item (FEAT-003) will run on every merge, and the only way to put the sites online until then.

**Independent Test**: build the sites, publish them, and open each default address: every route of the site answers with its prerendered page, and an unknown path answers with a not-found status.

**Acceptance Scenarios**:

1. **Given** the five built sites, **When** the developer runs the publish command, **Then** each site is served at its own default hosting address.
2. **Given** the built sites, **When** the developer publishes only one site, **Then** only that site gets a new release and the others are unchanged.
3. **Given** a published site, **When** a visitor opens a route without the `.html` suffix, **Then** the prerendered page of that route is served; **When** the visitor opens a path that does not exist, **Then** the response has a not-found status.
4. **Given** a published site, **When** its files are fetched, **Then** fingerprinted assets are cacheable for a long time and pages are revalidated on every visit, so a new release is visible right away.
5. **Given** a site whose output folder is missing, **When** the developer publishes, **Then** the command fails before anything is published and names the site to build.

---

### User Story 3 - Preview every pull request (Priority: P2)

When a pull request is opened or updated in the repository, the sites are built and published to a preview channel of that pull request, and the pull request gets one comment with the preview address of each site, updated on every push. Previews expire on their own.

**Why this priority**: reviewers see the change in the real hosting before it is merged; the sites can still be published without it.

**Independent Test**: open a pull request that changes the home page; after the workflow finishes, the pull request has one comment with five preview addresses, the home preview shows the change and the public sites do not.

**Acceptance Scenarios**:

1. **Given** a pull request from a branch of the repository, **When** it is opened or a commit is pushed, **Then** each site is published to a preview channel named after the pull request and a single comment lists the five preview addresses.
2. **Given** a pull request with a preview, **When** a new commit is pushed, **Then** the same channel is updated and the existing comment is edited, not duplicated.
3. **Given** a preview channel, **When** seven days pass without a new push, **Then** the channel expires and its address stops serving the sites.
4. **Given** a pull request from a fork, **When** the workflow runs, **Then** no preview is published, no credentials are requested, and the run says why.
5. **Given** a pull request whose build fails, **When** the workflow runs, **Then** nothing is published and the run fails.

### Edge Cases

- The project identifier or a site identifier is taken by someone else: the setup stops with the identifier and the place to change it.
- The billing account is not linked: the setup stops and says so before creating anything.
- The setup is run by an account without owner access: it fails with the missing permission and creates nothing partial that a second run cannot complete.
- Two pushes to the same pull request close together: the later run wins; an earlier run is cancelled rather than overwriting it.
- A site is added to the workspace later without a hosting target: the automated check fails and names the site.
- The preview channel limit of a site is reached: the run fails with the hosting error instead of passing silently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST name one Firebase project, in one place, as the default project for every hosting command.
- **FR-002**: Each of the five sites MUST have its own hosting site in that project and a named hosting target in the repository mapping the target to the site's output folder.
- **FR-003**: The repository MUST include a setup command, idempotent, that creates the five hosting sites and the keyless deploy identity (federated credentials limited to this repository) with only the roles needed to publish hosting releases and preview channels.
- **FR-004**: The setup MUST stop before making changes when the billing account is not linked or the caller lacks the needed access, and MUST report each resource it created or found.
- **FR-005**: A root command MUST publish every site, and a developer MUST be able to publish a single site by its name.
- **FR-006**: Publishing MUST refuse a site whose output folder is missing or has no home page, before anything is published.
- **FR-007**: Every site MUST be served with clean URLs (no `.html` suffix, no trailing slash) and an unknown path MUST answer with a not-found status.
- **FR-008**: Fingerprinted assets MUST be served with a long, immutable cache lifetime; pages and other unfingerprinted files MUST be revalidated on every request.
- **FR-009**: Every pull request from a branch of the repository MUST publish all five sites to a preview channel named after the pull request, expiring seven days after its last update, and keep one comment on the pull request with the five preview addresses.
- **FR-010**: Pull requests from forks MUST NOT receive credentials or publish previews.
- **FR-011**: The deploy identity MUST NOT be able to change anything outside Firebase Hosting, and no long-lived key MUST be created for it.
- **FR-012**: The hosting command-line tool MUST be pinned in the lock file, so local and automated publishes use the same version.
- **FR-013**: An automated test MUST fail when the hosting targets and the sites of the workspace differ, or when a target's folder is not the site's output folder.
- **FR-014**: The README and the technical documentation MUST describe the one-time setup, how to publish, how previews work and how to roll a site back to its previous release.

### Key Entities

- **Hosting project**: the one Firebase project of the website; has a billing account and a region for its other services.
- **Hosting site**: the place one site is served from; has a default address and later a custom domain (FEAT-004).
- **Hosting target**: the repository's name for a site (`home`, `anycontext`, `devcycle`, `gedo`, `aurora`), mapped to a hosting site and an output folder.
- **Preview channel**: a temporary release of a site for one pull request, with its own address and an expiry.
- **Deploy identity**: the account the repository's workflows act as, reached only through short-lived federated credentials.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The owner goes from a new project to five hosting sites and a working deploy identity by following the written steps, with one setup command.
- **SC-002**: A developer publishes all five built sites with one command, and every default address serves the site's prerendered home page.
- **SC-003**: Every pull request from a branch of the repository gets five working preview addresses in one comment within 10 minutes of a push.
- **SC-004**: No credential file or key exists in the repository or its secrets; the only stored values are identifiers.
- **SC-005**: Rolling a site back to its previous release takes one documented step and does not touch the other sites.

## Assumptions

- The project identifier is `levix-digital` and the extra hosting sites are `levix-anycontext`, `levix-devcycle`, `levix-gedo` and `levix-aurora`, as proposed to Levi; if any is taken or Levi chooses others, only the identifiers change.
- The region of the project's other services (Firestore, functions) is Montreal (`northamerica-northeast1`), chosen by Levi and recorded in the technical specification; hosting itself is global and has no region.
- Levi creates the project and links the billing account (pay-as-you-go plan) in the Firebase console, and runs the setup with his own account; the agent has no access to the Google account.
- Custom domains and DNS at Hostinger are FEAT-004; security headers are FEAT-005; checks on pull requests and production deploys on merge are FEAT-003. This item provides the publish command those items use.
- The not-found page with the site's look is FEAT-021; until then the hosting's default not-found page is served.
- Previews publish all five sites on every push; publishing only changed sites is left to FEAT-003 if needed.
