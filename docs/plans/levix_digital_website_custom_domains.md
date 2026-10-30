---
plan_id: levix_digital_website_custom_domains
project: levix-digital-website
title: Custom domains
kind: feature
version: v0.1.0
status: active
author: LeviGuilherme
created_at: '2026-10-30T21:33:39'
updated_at: '2026-10-30T21:33:47'
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
  done: false
- name: US2 setup command
  done: false
- name: US3 status and deploy check
  done: false
- name: US1 domains live
  done: false
- name: Polish and documentation
  done: false
status_log:
- at: '2026-10-30T21:33:39'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-30T21:33:47'
  by: LeviGuilherme
  status: active
  note: Plan updated
---

# Custom domains

## Goal and decisions

Serve each site at its own domain: `levix.digital` (home, with `www.levix.digital` redirecting to it) and `anycontext`, `devcycle`, `gedo`, `aurora` `.levix.digital`, over HTTPS, with DNS kept at Hostinger.

- `domains.json` lists the domains of each hosting target.
- `npm run domains:setup` connects every domain to its site through the Firebase Hosting REST API with the caller's `gcloud` login (idempotent) and prints the DNS records to add and to remove, with hosts as entered at Hostinger.
- `npm run domains:status` shows ownership, host and certificate states and succeeds only when every domain is active.
- The scripts never write DNS; Levi enters the records in the Hostinger panel (ADR-0003). Mail records stay untouched.
- `verify:live` also requests each published site's domain after a deploy; the pull request is merged only after the domains are active.

## Backlog items

FEAT-004.

## Specification

The detail (spec, research, plan, contract, quickstart, tasks) is in `specs/004-custom-domains`.

## Milestones

Taken from the phases of `tasks.md`: Setup, US2 setup command, US3 status and deploy check, US1 domains live, Polish and documentation.
