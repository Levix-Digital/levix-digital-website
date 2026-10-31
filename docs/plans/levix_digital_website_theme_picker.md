---
plan_id: levix_digital_website_theme_picker
project: levix-digital-website
title: Theme picker
kind: feature
version: v0.1.0
status: active
author: LeviGuilherme
created_at: '2026-10-31T15:13:01'
updated_at: '2026-10-31T15:17:14'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-007
spec_dir: specs/007-theme-picker
milestones:
- name: Preference core
  done: false
- name: US1 choose
  done: false
- name: US2 remembered
  done: false
- name: US3 accessible
  done: false
- name: Polish and documentation
  done: false
status_log:
- at: '2026-10-31T15:13:01'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-31T15:17:14'
  by: LeviGuilherme
  status: active
  note: Plan updated
---

# Theme picker

Envelope of the Spec Kit feature `specs/007-theme-picker/` (spec, research, plan, tasks, contract). The detail lives there.

## Backlog items

### FEAT-007: Theme picker
- **Priority**: high
- **Found**: 2026-10-30
- **Description**: Light by default, dark following the system preference until the visitor chooses; the choice kept in local storage.

## 1. Goal and decisions

Every site gets a theme picker (System, Light, Dark). The choice is kept in the site's local storage (`levix-theme`) and applied before the first paint by a one-line inline head script allowed by its SHA-256 hash in the Content Security Policy (new ADR-0012, within ADR-0010). The choice is per site. See `specs/007-theme-picker/research.md`.

## 2. Design (`software-design`)

`@levix/ui` owns the preference functions, the `useThemePreference()` composable, the `ThemePicker` component and the head script; `tooling/vite-site.ts` inlines the script; `scripts/lib/security-headers.mjs` derives the hash from the same file. See `specs/007-theme-picker/plan.md`.

## 3. Affected surfaces and files

Surface `sites` (the five home pages show the picker). Files: `specs/007-theme-picker/plan.md`, "Source Code".

## 4. Tests (`quality-assurance`)

Unit tests for the preference, head script, component, policy hash and inline-script check; `verify:dist`, `verify:hosting`, Lighthouse; manual test MT-UI-002. See the spec plan, "Tests".

## 5. Documentation (`architecture-docs`, `user-docs`)

ADR-0012; `docs/architecture/ui.md` and `hosting.md`; TECDOC index; README if affected.

## 6. CI, release and observability (`devops-release`)

No workflow change; part of v0.1.0; merge deploys the five sites and `verify:live` checks the served policy.

## 7. Security, migration and rollback

One script hash added to the policy; no data migration; rollback by reverting the pull request.

## 8. Execution steps and milestones

The phases of `specs/007-theme-picker/tasks.md`: Preference core, US1 choose, US2 remembered, US3 accessible, Polish and documentation.
