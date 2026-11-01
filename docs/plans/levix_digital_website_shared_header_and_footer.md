---
plan_id: levix_digital_website_shared_header_and_footer
project: levix-digital-website
title: Shared header and footer
kind: feature
version: v0.1.0
status: active
author: LeviGuilherme
created_at: '2026-11-01T17:53:53'
updated_at: '2026-11-01T17:54:18'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-008
spec_dir: specs/008-header-footer
milestones:
- name: Facts and text
  done: false
- name: US1 navigate
  done: false
- name: US2 contact
  done: false
- name: US3 theme in header
  done: false
- name: US4 phone and keyboard
  done: false
- name: Polish and documentation
  done: false
status_log:
- at: '2026-11-01T17:53:53'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-11-01T17:54:18'
  by: LeviGuilherme
  status: active
  note: Plan updated
---

# Shared header and footer

Envelope of the Spec Kit feature `specs/008-header-footer/` (spec, research, plan, tasks, contract). The detail lives there.

## Backlog items

### FEAT-008: Shared header and footer
- **Priority**: high
- **Found**: 2026-10-30
- **Description**: Header with navigation, theme and language pickers; footer with contact@levix.digital, Calgary, Alberta, Canada and legal links.

## 1. Goal and decisions

The company home gets its header (the company's "LD" monogram and name linked to the home, links to the four products, the theme picker); each product site gets its own header (the product's name in front, a small "by Levix Digital" link, the theme picker; same tokens, its own layout, the product's look added in v0.2); the five sites share the footer (copyright with the current year set in the browser, contact@levix.digital, Calgary, Alberta, Canada, product links). Decided with the product owner on 2026-11-01: only links to pages that exist (research, contact and legal links come with their pages); the language picker comes with FEAT-029 in a reserved slot; the monogram comes from the owner's logo file, without its background, and the company name is text that follows the theme; the navigation folds behind a menu button below 768 px; the dark theme stays; product sites keep the Levix concept without copying the company header; the year follows the visitor's clock. New ADR-0013: the layout lives in `@levix/ui` with facts from `@levix/content` and shared text from `@levix/i18n` passed in. See `specs/008-header-footer/research.md`.

## 2. Design (`software-design`)

`@levix/ui`: `SiteLayout`, `CompanyHeader`, `ProductHeader`, `MainNavigation`, `SiteFooter`, `LevixMonogram`; `@levix/content`: company location, `companySite`, `products`; `@levix/i18n`: `layoutStrings`; each site's `App.vue` wraps its pages in `SiteLayout`. See `specs/008-header-footer/plan.md` and `contracts/layout.md`.

## 3. Affected surfaces and files

Surface `sites` (every page gains its header and the footer; the picker leaves the home pages). Files: `specs/008-header-footer/plan.md`, "Source Code".

## 4. Tests (`quality-assurance`)

Unit tests for the content links (against `domains.json`), the layout strings and each component (server render and jsdom: links, `aria-current`, menu button, skip link, landmarks, no inline style); site tests of the prerendered app; `verify:dist`, `verify:hosting`, Lighthouse; manual test MT-UI-003, MT-UI-002 updated. See the spec plan, "Tests".

## 5. Documentation (`architecture-docs`, `user-docs`)

ADR-0013; `docs/architecture/ui.md`, `sites.md`, `content.md`, `i18n.md`; TECDOC index; README if affected.

## 6. CI, release and observability (`devops-release`)

No workflow change; part of v0.1.0; merge deploys the five sites.

## 7. Security, migration and rollback

No secrets, data or policy change; rollback by reverting the pull request.

## 8. Execution steps and milestones

The phases of `specs/008-header-footer/tasks.md`: Facts and text, US1 navigate, US2 contact, US3 theme in header, US4 phone and keyboard, Polish and documentation.
