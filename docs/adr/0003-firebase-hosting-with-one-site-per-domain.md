---
id: 3
title: Firebase Hosting with one site per domain
status: accepted
date: '2026-10-30'
version: null
subsystems: []
supersedes: []
superseded_by: []
amends: []
amended_by: [9]
---

# ADR-0003: Firebase Hosting with one site per domain

## Context

Levi wants the website on Google Firebase, to centralize the publishing of future software in one place. Each product has its own subdomain (`<product>.levix.digital`); the DNS of `levix.digital` is managed at Hostinger. The site needs a small backend for the contact form and translation.

## Decision

One Firebase project with one Firebase Hosting site per domain (`levix.digital`, `anycontext.levix.digital`, `devcycle.levix.digital`, `gedo.levix.digital`, `aurora.levix.digital`), deployed through hosting targets in `firebase.json`. The backend runs on Cloud Functions for Firebase (2nd generation) with Cloud Firestore. Hostinger DNS points the apex and each subdomain to Firebase Hosting. Product binaries are not hosted on the website: download pages link to each product's release channel.

## Alternatives Considered

- **Cloudflare Pages**: equally suited to static sites, but outside the Google ecosystem Levi chose.
- **One hosting site with path-based products (`levix.digital/anycontext`)**: contradicts the decision of one subdomain per product.
- **Hostinger web hosting**: no global CDN integration with the serverless backend.

## Consequences

Each site deploys and rolls back on its own. Functions and the Translation API need the Blaze (pay as you go) plan and a billing account. DNS changes at Hostinger are a manual step per subdomain, verified by Firebase.
