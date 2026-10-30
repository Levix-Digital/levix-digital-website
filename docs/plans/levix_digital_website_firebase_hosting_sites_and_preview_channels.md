---
plan_id: levix_digital_website_firebase_hosting_sites_and_preview_channels
project: levix-digital-website
title: Firebase hosting sites and preview channels
kind: feature
version: v0.1.0
status: completed
author: LeviGuilherme
created_at: '2026-10-30T16:25:16'
updated_at: '2026-10-30T16:44:10'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-002
spec_dir: specs/002-firebase-hosting
milestones:
- name: Setup
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: Foundational
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US1 setup command
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US2 deploy command
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US3 preview workflow
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: Polish and documentation
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
status_log:
- at: '2026-10-30T16:25:16'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-30T16:25:38'
  by: LeviGuilherme
  status: active
  note: Plan updated
- at: '2026-10-30T16:43:50'
  by: LeviGuilherme
  note: Milestone 'Setup' completed
- at: '2026-10-30T16:44:05'
  by: LeviGuilherme
  note: Milestone 'Foundational' completed
- at: '2026-10-30T16:44:06'
  by: LeviGuilherme
  note: Milestone 'US1 setup command' completed
- at: '2026-10-30T16:44:08'
  by: LeviGuilherme
  note: Milestone 'US2 deploy command' completed
- at: '2026-10-30T16:44:09'
  by: LeviGuilherme
  note: Milestone 'US3 preview workflow' completed
- at: '2026-10-30T16:44:10'
  by: LeviGuilherme
  note: Milestone 'Polish and documentation' completed
- at: '2026-10-30T16:44:10'
  by: LeviGuilherme
  status: completed
  note: All milestones completed
---

# Firebase hosting sites and preview channels

## Goal and decisions

Put the five sites on Firebase Hosting in one project, with one hosting site and target per domain, a keyless deploy identity for the repository, a deploy command for live and preview releases, and a preview channel with one comment for every pull request.

- Project `levix-digital`; hosting sites `levix-digital` (home), `levix-anycontext`, `levix-devcycle`, `levix-gedo`, `levix-aurora`.
- Clean URLs, no trailing slash, pages revalidated on every request, fingerprinted assets cached for a year.
- Deploys use Workload Identity Federation bound to the repository id and a service account with Firebase Hosting Admin only; no keys (new ADR-0007).
- An idempotent setup command, run once by the project owner, creates the sites and the identity.
- Previews of all five sites per pull request from the repository, expiring after 7 days; forks get none.

## Backlog items

FEAT-002.

## Specification

The detail (spec, research, plan, contracts, quickstart, tasks) is in `specs/002-firebase-hosting`.

## Milestones

Taken from the phases of `tasks.md`: Setup, Foundational, US1 setup command, US2 deploy command, US3 preview workflow, Polish and documentation.
