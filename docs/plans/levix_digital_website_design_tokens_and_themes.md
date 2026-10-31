---
plan_id: levix_digital_website_design_tokens_and_themes
project: levix-digital-website
title: Design tokens and themes
version: v0.1.0
status: in_progress
author: LeviGuilherme
created_at: '2026-10-31T14:35:14'
updated_at: '2026-10-31T14:41:37'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-006
spec_dir: specs/006-design-tokens-themes
milestones:
- name: Setup
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: US1 shared look
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: US2 dark theme
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: US3 contrast
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: Polish and documentation
  done: false
status_log:
- at: '2026-10-31T14:35:14'
  by: LeviGuilherme
  status: active
  note: Plan created
- at: '2026-10-31T14:35:26'
  by: LeviGuilherme
  note: 'Backlog items added: FEAT-006'
- at: '2026-10-31T14:41:31'
  by: LeviGuilherme
  note: Milestone 'Setup' completed
- at: '2026-10-31T14:41:33'
  by: LeviGuilherme
  note: Milestone 'US1 shared look' completed
- at: '2026-10-31T14:41:35'
  by: LeviGuilherme
  note: Milestone 'US2 dark theme' completed
- at: '2026-10-31T14:41:37'
  by: LeviGuilherme
  note: Milestone 'US3 contrast' completed
---

# Design tokens and themes

## Goal and decisions

The five sites share the Ceramic and Aurora design tokens from `@levix/ui/styles.css`, with a complete light theme (default) and dark theme, readable at WCAG 2.2 AA in both.

- Theme colors are written once as `light-dark(<light>, <dark>)` variables and exposed as Tailwind utilities (`bg-surface`, `text-body`, `text-ink-cyan`, `shadow-ceramic`...); the bright aurora hues stay decorative and each hue has a readable ink per theme.
- `color-scheme` on the root selects the theme: light by default, dark when the system prefers it, either one forced with `data-theme` on the root (used by the theme picker, FEAT-007); Tailwind's `dark:` follows the same rule. No script, so no flash.
- Light values from the original specification; dark values from Aurora Dev Suite's dark theme.
- Typefaces self-hosted from Fontsource: Inter Tight (display), Inter (body), JetBrains Mono (telemetry, code).
- A unit test checks the contrast of every declared pair in both themes. ADR-0011 records the theme mechanism.

## Backlog items

FEAT-006.

### FEAT-006: Design tokens and themes
- **Priority**: high
- **Found**: 2026-10-30
- **Description**: Ceramic and Aurora tokens as CSS variables with complete light and dark themes, in the shared Tailwind theme of `@levix/ui` (ADR-0006).

## Specification

The detail (spec, research, plan, contract, tasks) is in `specs/006-design-tokens-themes`.

## Milestones

Taken from the phases of `tasks.md`: Setup, US1 shared look, US2 dark theme, US3 contrast, Polish and documentation.
