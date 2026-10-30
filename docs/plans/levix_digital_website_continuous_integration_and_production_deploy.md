---
plan_id: levix_digital_website_continuous_integration_and_production_deploy
project: levix-digital-website
title: Continuous integration and production deploy
kind: feature
version: v0.1.0
status: completed
author: LeviGuilherme
created_at: '2026-10-30T17:40:00'
updated_at: '2026-10-30T17:56:09'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-003
spec_dir: specs/003-ci-deploy
milestones:
- name: Setup
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US1 pull request checks
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US2 deploy on merge
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: US3 manual deploy
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
- name: Polish and documentation
  done: true
  done_at: '2026-10-30'
  by: LeviGuilherme
status_log:
- at: '2026-10-30T17:40:00'
  by: LeviGuilherme
  status: draft
  note: Plan created
- at: '2026-10-30T17:40:22'
  by: LeviGuilherme
  status: active
  note: Plan updated
- at: '2026-10-30T17:56:03'
  by: LeviGuilherme
  note: Milestone 'Setup' completed
- at: '2026-10-30T17:56:05'
  by: LeviGuilherme
  note: Milestone 'US1 pull request checks' completed
- at: '2026-10-30T17:56:06'
  by: LeviGuilherme
  note: Milestone 'US2 deploy on merge' completed
- at: '2026-10-30T17:56:07'
  by: LeviGuilherme
  note: Milestone 'US3 manual deploy' completed
- at: '2026-10-30T17:56:09'
  by: LeviGuilherme
  note: Milestone 'Polish and documentation' completed
- at: '2026-10-30T17:56:09'
  by: LeviGuilherme
  status: completed
  note: All milestones completed
---

# Continuous integration and production deploy

## Goal and decisions

Check every pull request into `main` (type check, lint, unit tests, build, prerender and hosting checks, Lighthouse budgets) and publish to production, on every merge, only the sites the merge changed, from the build that passed the checks.

- One reusable `CI` workflow for pull requests, called by `Deploy` on each push to `main`; the built sites pass between them as an artifact.
- Checks on Ubuntu with Node.js 22 and 24 and on Windows; build, hosting check and Lighthouse once.
- Lighthouse budgets: performance and accessibility of at least 0.9, median of three mobile runs, every prerendered page of every site.
- Change rules by path: a site's folder publishes that site, documentation publishes nothing, anything else publishes every site; an unknown base publishes every site.
- Deploys run in the `production` environment (limited to `main`), queued, never cancelled; manual deploy of all or chosen sites; address check after publishing.
- Continuous deploy without release candidates (new ADR-0008); the keyless identity of FEAT-002 is reused.

## Backlog items

FEAT-003.

## Specification

The detail (spec, research, plan, contract, quickstart, tasks) is in `specs/003-ci-deploy`.

## Milestones

Taken from the phases of `tasks.md`: Setup, US1 pull request checks, US2 deploy on merge, US3 manual deploy, Polish and documentation.
