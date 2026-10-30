# Feature Specification: Workspace and Build Setup

**Feature Branch**: `feat/001-workspace-build-setup`

**Created**: 2026-10-30

**Status**: Draft

**Input**: Backlog item FEAT-001: "npm workspaces with Vite, Vue 3, TypeScript strict, Tailwind and vite-ssg, one folder per site and per package."

## User Scenarios & Testing *(mandatory)*

The users of this feature are the people who develop the website. It gives them one repository where every site and shared package can be installed, run, checked and built with a few commands, so the later items (hosting, CI, design system, pages) have a place to live.

### User Story 1 - Build every site from a fresh clone (Priority: P1)

A developer clones the repository, installs the dependencies once and builds every site with one command. Each site produces its own folder of static, prerendered pages ready to be served by a static host.

**Why this priority**: every later item (hosting, deployment, pages) needs sites that build into static files. Without it nothing can be deployed.

**Independent Test**: on a clean clone, run the install and build commands; each site has an output folder whose home page is a complete HTML document containing the page's text before any script runs.

**Acceptance Scenarios**:

1. **Given** a fresh clone with the supported runtime, **When** the developer installs the dependencies and runs the build command, **Then** each of the five sites (home, anycontext, devcycle, gedo, aurora) has its own output folder with a prerendered home page.
2. **Given** a built site, **When** its home page is opened with scripts disabled, **Then** the page's heading and text are visible.
3. **Given** the repository, **When** the developer builds only one site, **Then** only that site's output folder is produced or changed.

---

### User Story 2 - Develop a site with instant feedback (Priority: P2)

A developer starts one site in development mode and sees changes to its pages, and to the shared packages it uses, in the browser without a manual rebuild.

**Why this priority**: it is the daily loop for every page and component item that follows, but the sites can be built and deployed without it.

**Independent Test**: start the development server of one site, edit a page and a shared component, and see both changes in the browser within a few seconds.

**Acceptance Scenarios**:

1. **Given** the dependencies are installed, **When** the developer starts the development server of a site, **Then** the site opens in the browser on a local address.
2. **Given** a running development server, **When** the developer changes a page or a shared package used by the site, **Then** the browser shows the change without a manual restart.

---

### User Story 3 - Catch mistakes before review (Priority: P3)

A developer runs one command that checks types in strict mode, lints the code (including the module boundaries of the architecture) and runs the unit tests of every site and package, and gets a non-zero result when any of them fails.

**Why this priority**: the continuous integration item (FEAT-003) runs these checks on every pull request; this story provides them so they can also be run locally.

**Independent Test**: run the check command on the clean repository (passes), then introduce a type error, a forbidden import between modules and a failing test, and see each one reported with a failing result.

**Acceptance Scenarios**:

1. **Given** the clean repository, **When** the developer runs the check command, **Then** type checking, linting and unit tests all pass.
2. **Given** a value used with the wrong type in a site or package, **When** the type check runs, **Then** it fails and names the file and line.
3. **Given** a site that imports another site, or a package that imports a site, or a site that imports a file inside a package other than its public entry point, **When** the lint runs, **Then** it fails and names the forbidden import.
4. **Given** a failing unit test, **When** the tests run, **Then** the command fails and shows the test.

### Edge Cases

- A developer uses a runtime older than the supported one: the install stops with a message that names the required version.
- A site with no pages besides its home page still builds and prerenders.
- A page that uses browser-only features during prerendering: the build fails with the page and the reason instead of producing a broken page.
- Two sites depend on the same shared package: a change to the package is picked up by both without publishing anything.
- The dependency lock file is out of date with the manifests: the clean install fails instead of silently resolving other versions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST be one workspace containing one folder per site (`home`, `anycontext`, `devcycle`, `gedo`, `aurora`) and one folder per shared package (`ui`, `content`, `i18n`), each with its own manifest.
- **FR-002**: A single install command at the repository root MUST install the dependencies of every site and package, from a committed lock file, so two clean installs resolve the same versions.
- **FR-003**: The repository MUST declare the supported runtime version, and the install MUST refuse an unsupported one.
- **FR-004**: Each site MUST build into its own output folder of static files, with every route prerendered to HTML at build time and hydrated in the browser.
- **FR-005**: A root command MUST build every site; a developer MUST be able to build, preview or run in development mode one site on its own.
- **FR-006**: Sites MUST use the shared packages through their public entry points only, directly from the source in the repository, without publishing them.
- **FR-007**: All code MUST be type checked in strict mode by one root command, including the single-file components.
- **FR-008**: A root lint command MUST enforce the module boundaries of the architecture: a site never imports another site, a package never imports a site, and a site imports a package only through the package's public entry point.
- **FR-009**: A root test command MUST run the unit tests of every site and package; each site and package MUST have at least one test proving its setup works.
- **FR-010**: Every site MUST be styled with the utility styling framework of the stack, with the shared styles coming from the design system package, so the design tokens (FEAT-006) are added in one place.
- **FR-011**: Each site MUST have a minimal home page (the site's name and one sentence) that proves routing, prerendering, shared styles and a shared component work; real content belongs to later items.
- **FR-012**: The README MUST tell a developer how to install, run, check and build the sites.
- **FR-013**: Build outputs, dependencies and local environment files MUST be kept out of version control.

### Key Entities

- **Site**: a deployable website for one domain; has pages, its English strings and an output folder.
- **Package**: a shared module (design system, product content, internationalization) with one public entry point.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer goes from a fresh clone to five built sites with two commands (install, build).
- **SC-002**: The home page of every built site contains its heading text in the HTML file itself (visible with scripts disabled).
- **SC-003**: The check command passes on the clean repository and fails for each of the three seeded mistakes in User Story 3 (wrong type, forbidden import, failing test).
- **SC-004**: A change to a page or a shared component appears in the running development site in under 3 seconds.
- **SC-005**: The full build of the five sites takes under 2 minutes on a typical developer laptop.

## Assumptions

- All five sites get a folder now, with a placeholder home page, so the hosting item (FEAT-002) can map one target per site; their real pages arrive in v0.2.0.
- The `functions/` folder (contact and translation backend) is created by its own items (FEAT-033 and the translation items), not here.
- Design tokens, themes, the header and footer, the 3D hero and Three.js itself come with FEAT-006, FEAT-008 and FEAT-011; this item only provides the shared stylesheet entry point and one trivial shared component.
- Continuous integration (FEAT-003) and hosting configuration (FEAT-002) are separate items; this item provides the commands they will run.
- The supported runtime is the current long-term-support Node.js line, the same one the backend functions will use (Node.js 22 or newer).
