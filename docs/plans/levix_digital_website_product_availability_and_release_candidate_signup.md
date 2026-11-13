---
plan_id: levix_digital_website_product_availability_and_release_candidate_signup
project: levix-digital-website
title: Product availability and release candidate signup
version: v0.1.0
status: active
author: LeviGuilherme
created_at: '2026-11-13T15:15:03'
updated_at: '2026-11-13T15:15:09'
session_id: null
tags: []
supersedes: null
superseded_by: null
parent_plan_id: null
backlog_items:
- FEAT-037
- FEAT-038
- FEAT-013
- FEAT-036
spec_dir: specs/010-product-availability-signup
milestones:
- name: Content and text
  done: false
- name: Function
  done: false
- name: Availability on the product page
  done: false
- name: Release candidate signup
  done: false
- name: Unsubscribe
  done: false
- name: DocMapper site
  done: false
- name: CI deploy and setup
  done: false
- name: Polish and documentation
  done: false
status_log:
- at: '2026-11-13T15:15:03'
  by: LeviGuilherme
  status: active
  note: Plan created
- at: '2026-11-13T15:15:09'
  by: LeviGuilherme
  note: 'Backlog items added: FEAT-037, FEAT-038, FEAT-013, FEAT-036'
---

# Product availability and release candidate signup

## Goal and decisions

Availability leaves the home cards (PR #19) and moves to each product's own site: an enabled download action for available and preview products, and for products in development a disabled download button with a release candidate signup form right below it (double opt-in, CASL consent, unsubscribe in every email). The signup is served by a new Cloud Function, `releaseSignup`, in Montreal, storing in Firestore and sending through the Trigger Email extension. DocMapper gets its own site so every home card links to a product site. App Check is deferred to the contact function (ADR-0015).

## Backlog items

FEAT-037, FEAT-038, FEAT-013, FEAT-036 (release v0.1.0); FEAT-010 superseded by FEAT-037.

### FEAT-037: Availability and release candidate signup on product pages
- **Priority**: high
- **Found**: 2026-11-13, PR #19
- **Description**: Each product page states whether the product can be downloaded; while it cannot, the download button is disabled and an email form below it signs visitors up for release candidates of that product, with double opt-in confirmation, CASL consent and unsubscribe; requested on 2026-11-13 after the badges left the home cards (PR #19).

### FEAT-038: releaseSignup function
- **Priority**: high
- **Found**: 2026-11-13, PR #19
- **Description**: Validation, rate limit, storage in Firestore, confirmation email (double opt-in), confirmation and unsubscribe endpoints for the release candidate signup.

### FEAT-013: Download panel
- **Priority**: medium
- **Found**: 2026-10-30
- **Description**: Per-platform download buttons and install instructions, disabled while the product is not available.

### FEAT-036: DocMapper site
- **Priority**: medium
- **Found**: 2026-11-12
- **Description**: Overview, features and status of DocMapper at its own subdomain, with the availability banner while it has no installers; adds docmapper to domains.json and the site links.

## Detail

The specification, research, data model, contract, plan and tasks are in `specs/010-product-availability-signup/`.

## Milestones

1. Content and text
2. Function
3. Availability on the product page
4. Release candidate signup
5. Unsubscribe
6. DocMapper site
7. CI, deploy and setup
8. Polish and documentation
