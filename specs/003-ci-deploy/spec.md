# Feature Specification: Continuous Integration and Production Deploy

**Feature Branch**: `feat/003-ci-deploy`

**Created**: 2026-10-30

**Status**: Draft

**Input**: Backlog item FEAT-003: "Type check, lint, unit tests, build and Lighthouse CI on every pull request; deploy each changed site on merge to main."

## User Scenarios & Testing *(mandatory)*

The users of this feature are the people who develop and publish the website and the reviewers of its pull requests. It makes every pull request prove that it type checks, lints, passes its tests, builds and meets the performance and accessibility budgets, and it puts each changed site live as soon as a pull request is merged, without anyone running a command by hand.

### User Story 1 - Every pull request is checked (Priority: P1)

When a pull request into `main` is opened or updated, the repository runs the type check, the linter, the unit tests, the build, the prerender and hosting checks and a Lighthouse audit of every site. The pull request shows one status per check, and `main` accepts the merge only when all of them pass.

**Why this priority**: production deploys on merge (User Story 2) are only safe when what reaches `main` has passed every check.

**Independent Test**: open a pull request with a type error; its checks fail and the merge is blocked. Fix it; the checks pass and the merge is allowed.

**Acceptance Scenarios**:

1. **Given** a pull request into `main`, **When** it is opened or a commit is pushed, **Then** the type check, lint, unit tests, build, prerender check, hosting check and Lighthouse audit run and report their result on the pull request.
2. **Given** a pull request with a type error, a lint warning or a failing test, **When** the checks run, **Then** the failing check is red and names the problem in its log.
3. **Given** a pull request whose page scores below the performance or accessibility budget, **When** the Lighthouse audit runs, **Then** it fails and its report names the page and the score.
4. **Given** two pushes to the same pull request close together, **When** the checks run, **Then** the older run is cancelled and only the newer one reports.
5. **Given** the checks required on `main`, **When** any of them fails or has not finished, **Then** the pull request cannot be merged.

---

### User Story 2 - A merge puts the changed sites live (Priority: P1)

When a pull request is merged into `main`, the repository builds the sites, checks them again, and publishes to production only the sites the merge changed. A change to a shared package or to the build publishes every site; a change to one site's folder publishes only that site; a documentation-only change publishes nothing. The run lists what it published and each site's address.

**Why this priority**: it is the goal of the item; until it exists, the sites reach production only by a manual publish.

**Independent Test**: merge a pull request that changes only the Gedo site; the deploy run publishes only `gedo`, the release history of the other sites is unchanged, and `https://levix-gedo.web.app` shows the change.

**Acceptance Scenarios**:

1. **Given** a merge that changes only files of one site, **When** the deploy runs, **Then** only that site gets a new production release.
2. **Given** a merge that changes a shared package, the lock file, the hosting configuration or the build tooling, **When** the deploy runs, **Then** every site gets a new production release.
3. **Given** a merge that changes only documentation, specifications or the manual tests, **When** the deploy runs, **Then** nothing is published and the run says so.
4. **Given** a merge whose checks fail on `main`, **When** the deploy runs, **Then** nothing is published and the run fails.
5. **Given** a published site, **When** the deploy finishes, **Then** the run lists each published site with its address, and each address answers with the site's home page.
6. **Given** two merges close together, **When** both deploys run, **Then** they run one after the other in merge order, and neither is cancelled.

---

### User Story 3 - Publish on demand (Priority: P2)

A maintainer can start the production deploy by hand from the repository's Actions page, for all sites or for chosen sites, to publish the first release, to republish after a failed run, or to put a site back after a rollback in the console.

**Why this priority**: the first production release and recovery need it; day-to-day work does not.

**Independent Test**: start the deploy by hand for `aurora` only; only `levix-aurora` gets a new release.

**Acceptance Scenarios**:

1. **Given** the deploy started by hand with no site named, **When** it runs, **Then** every site is checked and published.
2. **Given** the deploy started by hand with `aurora`, **When** it runs, **Then** only `aurora` is published.
3. **Given** the deploy started by hand with a name that is not a site, **When** it runs, **Then** it fails before publishing and names the unknown site.

### Edge Cases

- The first push to `main` after this feature, or a push whose previous commit is unknown (force push, new branch history): every site is published.
- A new site is added to the workspace: its folder maps to its own target and shared changes include it, without editing the change detection.
- The repository variables of the deploy identity are missing: the deploy fails with the variables to set; the pull request checks still run.
- A run of the deploy is cancelled or the hosting service fails part way: the run fails, the sites already published stay at their new release, and a manual run republishes the rest.
- A pull request from a fork: the checks run without credentials; no preview and no deploy.
- Lighthouse is slower or noisier on shared runners: each page is audited more than once and the median score is compared with the budget.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every pull request into `main` and every push to `main` MUST run the type check, lint, unit tests, build, prerender check and hosting check.
- **FR-002**: The type check, lint and unit tests MUST run on Linux with both supported Node.js versions (22 and 24) and on Windows with the pinned version, since the project is developed on Windows.
- **FR-003**: Every pull request into `main` and every push to `main` MUST audit the prerendered pages of every site with Lighthouse, mobile profile, and fail when the median performance score or the median accessibility score of any page is below its budget.
- **FR-004**: The Lighthouse budgets MUST be kept in one versioned configuration file; the reports MUST be kept as run artifacts so a failure can be inspected.
- **FR-005**: A newer push to the same pull request MUST cancel the older check run.
- **FR-006**: A push to `main` MUST publish to production exactly the sites the push changed, using the change rules below, and MUST publish only after the checks of FR-001 and FR-003 pass on that commit.
- **FR-007**: Change rules: a file under `sites/<site>/` changes that site; a file under `docs/`, `specs/`, `.specify/`, `.claude/`, `tests/MANUAL_TESTS.md`, any Markdown file at the root, `LICENSE` or the preview workflow changes no site; any other file changes every site.
- **FR-008**: When the previous commit of the push cannot be compared, the deploy MUST publish every site.
- **FR-009**: The deploy MUST publish the same build that passed the checks, not a second build.
- **FR-010**: The deploy MUST be startable by hand for all sites or a chosen list of sites, and MUST refuse unknown site names before publishing.
- **FR-011**: Production deploys MUST run one at a time in the order they started and MUST NOT cancel each other.
- **FR-012**: Production deploys MUST run in a deployment environment named `production` that records each deploy with its address, and MUST use the keyless deploy identity of FEAT-002 (no new credential).
- **FR-013**: After publishing, the deploy MUST check that the default address of each published site answers its home page successfully, and fail otherwise.
- **FR-014**: The change rules MUST be covered by automated tests.
- **FR-015**: The README and the technical documentation MUST describe the checks, the budgets, the change rules, the manual deploy, the required checks on `main` and the rollback.

### Key Entities

- **Check run**: the set of checks of one commit (type check, lint, unit tests, build, prerender, hosting, Lighthouse), each with its own status on the pull request.
- **Budget**: the minimum Lighthouse score per category that every audited page must reach.
- **Changed sites**: the sites a push to `main` affects, computed from the changed files with the change rules.
- **Production deploy**: one publish of the changed sites to their live hosting sites, recorded in the `production` environment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every pull request into `main` shows all check results within 15 minutes of a push.
- **SC-002**: No pull request can be merged into `main` while a required check fails.
- **SC-003**: A merge that changes one site publishes only that site, and the change is live at its address within 15 minutes of the merge.
- **SC-004**: A documentation-only merge publishes nothing.
- **SC-005**: No credential is added to the repository or its secrets; production deploys use the existing keyless identity.

## Assumptions

- The budgets are the technical specification's performance target (a score of 90 or more on mobile) and the same 90 for accessibility; the WCAG 2.2 AA requirement itself is checked by later items (Playwright and manual checks), since a Lighthouse score does not prove it.
- Lighthouse audits each page three times on the shared runners and compares the median, to keep the result stable.
- The deploy runs without a manual approval step: the merge is the approval, as the backlog item states. Levi can add a required reviewer to the `production` environment later without changing the workflows.
- Requiring the checks on `main` (branch protection) is a repository setting Levi applies once after the checks first run, since the checks must exist before they can be required.
- The preview workflow of FEAT-002 stays as it is, publishing all sites for every pull request.
- The keyless identity trusts every workflow of this repository, as set up in FEAT-002; the `production` environment, limited to `main`, is what keeps production deploys to merges.
- Version numbers, release candidates and release notes are not part of this item; the website is published continuously, and the roadmap's releases mark groups of items.
- Custom domains are FEAT-004 and security headers FEAT-005; the deploy publishes to the default addresses until then.
