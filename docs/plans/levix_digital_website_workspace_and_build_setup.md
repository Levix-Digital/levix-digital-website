---
plan_id: levix_digital_website_workspace_and_build_setup
project: levix-digital-website
title: Workspace and build setup
kind: feature
version: v0.1.0
status: in_progress
author: LeviGuilherme
created_at: '2026-10-30T15:46:11'
updated_at: '2026-10-30T15:51:40'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-001
spec_dir: specs/001-workspace-build-setup
milestones:
- name: Setup
  done: false
- name: Foundational
  done: false
- name: US1 build every site
  done: false
- name: US2 dev server
  done: false
- name: US3 checks
  done: false
- name: Polish and documentation
  done: false
status_log:
- at: '2026-10-30T15:46:11'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-30T15:50:20'
  by: LeviGuilherme
  status: planned
  note: Plan updated
- at: '2026-10-30T15:51:40'
  by: LeviGuilherme
  status: in_progress
  note: Approved by Levi on 2026-10-30
---

# Workspace and build setup

Envelope of the Spec Kit feature `specs/001-workspace-build-setup` (spec, plan, research, tasks). The detail is in the spec folder and is not copied here.

## Backlog items

### FEAT-001: Workspace and build setup
- **Priority**: high
- **Found**: 2026-10-30
- **Description**: npm workspaces with Vite, Vue 3, TypeScript strict, Tailwind and vite-ssg, one folder per site and per package.

## 1. Goal and decisions

One npm workspace with five prerendered Vue 3 sites (`sites/home`, `anycontext`, `devcycle`, `gedo`, `aurora`) and three shared packages (`packages/ui`, `content`, `i18n`), with root commands to install, build, type check, lint with module boundaries, test and verify the prerendered output.

Decisions (detail in `specs/001-workspace-build-setup/research.md`):
- Packages consumed from source through their `exports` map; nothing is built or published.
- TypeScript 6.0, because vue-tsc does not run on TypeScript 7.
- Tailwind CSS 4 with a shared stylesheet in `@levix/ui` instead of a Tailwind 3 preset (new ADR-0006).
- Module boundaries enforced with eslint-plugin-boundaries.
- `functions/`, design tokens, header, footer, hero and CI are left to their own items.

## Spec Kit

- Spec folder: `specs/001-workspace-build-setup`
- Milestones follow the phases of `tasks.md`.
