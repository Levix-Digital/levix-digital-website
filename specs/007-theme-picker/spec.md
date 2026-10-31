# Feature Specification: Theme Picker

**Feature Branch**: `feat/007-theme-picker`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Backlog item FEAT-007: "Light by default, dark following the system preference until the visitor chooses; the choice kept in local storage." The vision says the dark theme "follows the visitor's system preference or choice"; FEAT-006 made the stylesheet follow the system and let the root element force either theme with `data-theme`.

## User Scenarios & Testing *(mandatory)*

The users of this feature are the visitors of the five sites who want a theme other than the one their system gives them.

### User Story 1 - Choose light or dark (Priority: P1)

A visitor uses the theme picker to choose light or dark; the page changes at once, whatever the system preference.

**Why this priority**: it is the goal of the item.

**Independent Test**: open a home page, choose dark with the system in light, then light with the system in dark; the page follows each choice.

**Acceptance Scenarios**:

1. **Given** a page in the light theme, **When** the visitor chooses dark, **Then** the whole page switches to the dark theme without a reload.
2. **Given** a visitor whose system prefers dark, **When** they choose light, **Then** the page switches to the light theme.
3. **Given** a chosen theme, **When** the visitor chooses "System", **Then** the page follows the system preference again.

---

### User Story 2 - The choice is remembered (Priority: P1)

A visitor who chose a theme sees it again on every later visit to the same site, from the first paint, with no flash of the other theme.

**Why this priority**: a choice that is lost on every page load is not a choice; a flash of the wrong theme on each visit is the usual defect of theme pickers.

**Independent Test**: choose dark, reload the page and open it in a new tab; it is dark from the first paint.

**Acceptance Scenarios**:

1. **Given** a visitor who chose dark, **When** they reload or come back later, **Then** the page is dark from the first paint and the picker shows "Dark".
2. **Given** a visitor who never chose, **When** a page opens, **Then** it follows the system preference (light when there is none) and the picker shows "System".
3. **Given** two tabs of the same site, **When** the visitor changes the theme in one, **Then** the other follows.

---

### User Story 3 - Usable by everyone (Priority: P1)

A visitor using a keyboard or a screen reader can find the picker, knows which option is selected and changes it.

**Why this priority**: WCAG 2.2 AA is a requirement of the technical specification.

**Independent Test**: reach the picker with Tab, change the option with the arrow keys; a screen reader announces a group named "Theme" with three options and the selected one.

**Acceptance Scenarios**:

1. **Given** the picker, **When** it is reached with the keyboard, **Then** the focus is visible and the arrow keys change the option.
2. **Given** a screen reader, **When** it reads the picker, **Then** it announces the group name, the three options and which one is selected.

### Edge Cases

- Storage unavailable (private mode, storage blocked, a full quota): the picker still changes the theme for the page; nothing is remembered and nothing fails.
- An unknown value in storage (an old or edited value) is ignored: the page follows the system and the picker shows "System".
- JavaScript disabled: the page follows the system preference (FEAT-006); the picker is shown but cannot change the theme.
- The choice is kept per site: each of the five sites is its own origin, so its storage is separate (see Assumptions).
- The Content Security Policy allows no inline code: the small script that applies the stored choice before the first paint is allowed by its hash only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every site MUST show a theme picker with three options: System, Light and Dark.
- **FR-002**: Choosing Light or Dark MUST force that theme on the whole page at once; choosing System MUST return to the system preference.
- **FR-003**: The choice MUST be kept in the browser's local storage of the site; "System" MUST remove it.
- **FR-004**: A stored choice MUST be applied before the first paint of every page, so the other theme never flashes.
- **FR-005**: The picker MUST show the current choice, including a stored one, and follow a change made in another tab of the same site.
- **FR-006**: Storage errors and unknown stored values MUST NOT break the page; the page then follows the system.
- **FR-007**: The picker MUST be operable by keyboard with a visible focus, and expose its name, options and state to assistive technology (WCAG 2.2 AA).
- **FR-008**: The Content Security Policy MUST stay without `'unsafe-inline'`: the only inline script is allowed by its hash, and the build check MUST fail on any other inline script.
- **FR-009**: The technical documentation MUST describe the picker, the stored value and how the stored choice is applied before paint.

### Key Entities

- **Theme preference**: the visitor's choice, `system`, `light` or `dark`; stored only when it is not `system`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On each of the five sites, a chosen theme survives a reload with no flash of the other theme.
- **SC-002**: Lighthouse keeps performance and accessibility at 0.9 or more and no console error on the audited pages.
- **SC-003**: The built pages carry exactly one inline script, whose hash is in the served policy.

## Assumptions

- The picker is placed on each site's current page for now; the shared header (FEAT-008) will take it over.
- The labels are English, in each site's strings, until the translation core (FEAT-029).
- The choice is kept per site, as the backlog item says (local storage). Sharing it across the five sites would need a cookie on `levix.digital`, which does not work on the `web.app` addresses and previews; it can be a later item.
- The stored value is a functional preference, not tracking: it is never sent anywhere, so it needs no consent (the consent banner, FEAT-034, is for analytics).
