# Implementation Plan: Theme Picker

**Branch**: `feat/007-theme-picker` | **Date**: 2026-10-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-theme-picker/spec.md`

## Summary

`@levix/ui` gets a `ThemePicker` (System, Light, Dark as native radios in a segmented control) and a `useThemePreference()` composable that keeps the choice in `localStorage["levix-theme"]` and sets `data-theme` on the root, which the FEAT-006 stylesheet already turns into the theme. A one-line head script, inlined into every page by the shared Vite configuration, applies the stored choice before the first paint; the Content Security Policy allows it by its SHA-256 hash, and `verify:dist` fails on any other inline script. Each site shows the picker on its current page until the shared header (FEAT-008). Decisions in [research.md](research.md); interface in [contracts/theme-preference.md](contracts/theme-preference.md).

## Technical Context

**Language/Version**: TypeScript, Vue 3, plain JavaScript for the head script; Node.js 22 and 24

**Primary Dependencies**: none new

**Storage**: the browser's `localStorage` of each site, one key

**Testing**: Vitest with jsdom (preference functions, the head script, the component); `scripts/lib` tests (policy hash, inline-script check); `verify:dist`, `verify:hosting` and Lighthouse in the emulator

**Target Platform**: the five static sites (evergreen browsers)

**Project Type**: shared design system package of the modular monolith, plus the shared build and hosting configuration

**Performance Goals**: no extra request; the head script is under 200 bytes; Lighthouse performance stays at 0.9 or more

**Constraints**: Content Security Policy without `'unsafe-inline'` (ADR-0010); WCAG 2.2 AA; no theme flash; no hydration mismatch

**Scale/Scope**: one component, one composable, one head script, five sites

## Constitution Check

| Rule | How the plan complies |
|---|---|
| Modular monolith: public interface per module | The picker, composable and head script are exports of `@levix/ui`; the sites and the tooling use only those exports |
| Simplicity first | Native radios, one storage key, one attribute; no state library |
| No speculative code | Three options only; no shared cross-site cookie, no header (FEAT-008) |
| Testability | Storage access through pure functions with the storage passed in; the head script tested in jsdom; the policy hash tested against the file |
| Accessibility | Native fieldset and radios, visible focus from the tokens |
| Security | One inline script allowed by its hash; the build check refuses any other inline code; nothing is sent anywhere |
| Repository content in English, no references to the tools used to write it | Code, docs and messages in English, authored by the repository identity |

Re-check after design: passes; no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-theme-picker/
├── spec.md
├── plan.md
├── research.md
├── contracts/theme-preference.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/ui/
├── package.json                          # export ./theme-init.js (changed)
├── src/index.ts                          # exports ThemePicker, useThemePreference (changed)
├── src/theme/theme-init.js               # head script (new)
├── src/theme/theme-init.test.ts          # (new)
├── src/theme/preference.ts               # read, save, apply (new)
├── src/theme/preference.test.ts          # (new)
├── src/theme/useThemePreference.ts       # composable (new)
├── src/components/ThemePicker.vue        # (new)
└── src/components/ThemePicker.test.ts    # (new)
tooling/vite-site.ts                      # inlines the head script (changed)
scripts/lib/security-headers.mjs          # script-src with the hash (changed)
scripts/lib/inline-code.mjs               # allows only hashed scripts (changed)
scripts/verify-prerender.mjs              # passes the allowed hashes, checks the script is there (changed)
firebase.json                             # policy of the five targets (changed)
eslint.config.js                          # the new entry point (changed)
sites/*/src/pages/HomePage.vue            # the picker (changed)
sites/*/src/locales/en.json               # the picker's labels (changed)
docs/adr/0012-stored-theme-applied-by-a-hashed-inline-script.md   # (new)
docs/architecture/ui.md, docs/architecture/hosting.md            # (changed)
tests/MANUAL_TESTS.md                     # theme picker test (changed)
```

## Complexity Tracking

None.

## Dev Cycle Protocol

### Backlog items and release

FEAT-007 (Theme picker, EPIC-002), release v0.1.0 "Company home".

### Tests (quality-assurance)

- `preference.test.ts`: read gives `system` with no key, an unknown value or a throwing storage; save writes `light` or `dark` and removes the key for `system`; a throwing storage does not throw; apply sets or removes `data-theme`.
- `theme-init.test.ts`: the script run in jsdom sets `data-theme` for a stored `light` or `dark`, leaves it absent otherwise and when storage throws; it has no `<`, `&` or `</script` (kept byte for byte in HTML).
- `ThemePicker.test.ts`: three radios with the given labels in a named group; "System" checked before mount, the stored option after; choosing one writes storage and the attribute; a `storage` event from another tab updates the checked option.
- `security-headers.test.mjs`: `script-src` carries the SHA-256 of `theme-init.js` and no `'unsafe-inline'`; the `firebase.json` copies stay equal (existing test).
- `inline-code.test.mjs`: an inline script is reported unless its hash is allowed.
- `verify:dist`: every built page carries the head script once and no other inline code; `verify:hosting` and Lighthouse (performance and accessibility at 0.9 or more, no console error, which is how a blocked script shows).
- Manual test MT-UI-002 "The theme choice is kept": choose dark with a light system, reload, new tab, other tab follows, back to System, keyboard and screen reader.
- Acceptance: the spec's scenarios and SC-001 to SC-003.

### Documentation (architecture-docs, user-docs)

- New ADR-0012 "Stored theme applied by a hashed inline script".
- `docs/architecture/ui.md`: the picker, the stored value, the head script; `docs/architecture/hosting.md`: the policy now carries one script hash.
- README: no change unless it lists the design system (checked).
- Rebuild the TECDOC index and run `check_docs` and `check_readme`.

### CI, release and observability (devops-release)

- No workflow change: tests, build, `verify:dist`, `verify:hosting` and Lighthouse already run in CI and the preview.
- Version impact: none; part of release v0.1.0. Merge to `main` deploys the five sites (ADR-0008); `verify:live` checks the served policy with the hash.
- Observability: a blocked head script shows as a console error, which Lighthouse fails on; `verify:dist` names the page with an unexpected inline script.

### Security, migration and rollback

- No secrets. The policy gains one hash, which allows only that exact script.
- No data migration: the key is new; absent means today's behavior.
- Rollback: revert the pull request; the sites follow the system again and a stored key is ignored.
