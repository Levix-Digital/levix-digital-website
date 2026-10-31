---
plan_id: levix_digital_website_security_headers
project: levix-digital-website
title: Security headers
kind: feature
version: v0.1.0
status: in_progress
author: LeviGuilherme
created_at: '2026-10-30T23:07:05'
updated_at: '2026-10-31T13:44:22'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-005
spec_dir: specs/005-security-headers
milestones:
- name: Setup
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: US2 one policy
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: US1 headers served
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
- name: US3 deploy check
  done: false
- name: Polish and documentation
  done: true
  done_at: '2026-10-31'
  by: LeviGuilherme
status_log:
- at: '2026-10-30T23:07:05'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-30T23:07:20'
  by: LeviGuilherme
  status: active
  note: Plan updated
- at: '2026-10-31T13:43:08'
  by: LeviGuilherme
  note: Milestone 'Setup' completed
- at: '2026-10-31T13:43:24'
  by: LeviGuilherme
  note: Milestone 'US2 one policy' completed
- at: '2026-10-31T13:43:26'
  by: LeviGuilherme
  note: Milestone 'US1 headers served' completed
- at: '2026-10-31T13:43:27'
  by: LeviGuilherme
  note: Milestone 'US3 deploy check' completed
- at: '2026-10-31T13:43:28'
  by: LeviGuilherme
  note: Milestone 'Polish and documentation' completed
- at: '2026-10-31T13:43:28'
  by: LeviGuilherme
  status: completed
  note: All milestones completed
- at: '2026-10-31T13:44:16'
  by: LeviGuilherme
  note: 'Milestone ''US3 deploy check'' reopened: Done when the first production deploy after the merge passes verify:live'
- at: '2026-10-31T13:44:22'
  by: LeviGuilherme
  status: in_progress
  note: Waiting for the merge and the production deploy check
---

# Security headers

## Goal and decisions

Every response of the five sites carries seven security headers: HSTS (one year, subdomains, no preload), a strict Content Security Policy (own origin only, no inline code), `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` and `Cross-Origin-Opener-Policy: same-origin`.

- Set in `firebase.json` on the `**` rule of each target; the policy is defined once in `scripts/lib/security-headers.mjs` and a test keeps the five copies equal to it.
- `verify:dist` refuses inline code, `verify:hosting` checks the served headers, Lighthouse fails on console errors, `verify:live` checks the headers at both addresses after each deploy.
- ADR-0010: the policy allows only what the sites use today; each later feature (theme script, Google Analytics, functions, App Check) extends it in its own change.

## Backlog items

FEAT-005.

## Specification

The detail (spec, research, plan, contract, tasks) is in `specs/005-security-headers`.

## Milestones

Taken from the phases of `tasks.md`: Setup, US2 one policy, US1 headers served, US3 deploy check, Polish and documentation.
