---
plan_id: levix_digital_website_custom_domains
project: levix-digital-website
title: Custom domains
kind: feature
version: v0.1.0
status: completed
author: LeviGuilherme
created_at: '2026-10-30T21:33:39'
updated_at: '2026-10-30T22:54:56'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-004
spec_dir: specs/004-custom-domains
milestones:
- name: Setup
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US2 status command
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US3 deploy check
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US1 domains live
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: Polish and documentation
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
status_log:
- at: '2026-10-30T21:33:39'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-30T21:33:47'
  by: LeviGuilherme
  status: active
  note: Plan updated
- at: '2026-10-30T22:26:15'
  by: LeviGuilherme
  note: Milestone 'Setup' completed
- at: '2026-10-30T22:26:15'
  by: LeviGuilherme
  note: Milestone 'US2 status command' completed
- at: '2026-10-30T22:26:15'
  by: LeviGuilherme
  note: Milestone 'US3 deploy check' completed
- at: '2026-10-30T22:27:29'
  by: LeviGuilherme
  note: Milestone 'Polish and documentation' completed
- at: '2026-10-30T22:54:56'
  by: LeviGuilherme
  note: Milestone 'US1 domains live' completed
- at: '2026-10-30T22:54:56'
  by: LeviGuilherme
  status: completed
  note: All milestones completed
---

# Custom domains

## Goal and decisions

Serve each site at its own domain: `levix.digital` (home) and `anycontext`, `devcycle`, `gedo`, `aurora` `.levix.digital`, over HTTPS. The zone moved to Cloudflare and Levi connected the five domains in the Firebase console; `www` is redirected to the apex by Cloudflare.

- `domains.json` lists the domain of each hosting target.
- `npm run domains:status` (read-only, caller's `gcloud` login, Firebase Hosting REST API) shows ownership, host and certificate per domain and the records Firebase still asks for; it succeeds only when every domain is active.
- `verify:live` also requests each published site's domain after a deploy; the pull request is merged only after the domains are active.
- ADR-0009: DNS at Cloudflare, Firebase-hosted names not proxied (amends ADR-0003); the technical specification is updated.

## Backlog items

FEAT-004.

## Specification

The detail (spec, research, plan, contract, quickstart, tasks) is in `specs/004-custom-domains`.

## Milestones

Taken from the phases of `tasks.md`: Setup, US2 status command, US3 deploy check, US1 domains live, Polish and documentation.
