---
id: 2
title: Vue 3 with Vite static prerendering
status: accepted
date: '2026-10-30'
version: null
subsystems: []
supersedes: []
superseded_by: []
amends: []
amended_by: []
---

# ADR-0002: Vue 3 with Vite static prerendering

## Context

The site must be fast and indexable by search engines, use the Vue 3, Tailwind and Three.js stack of the original specification, and be known by the team (DocMapper uses Vue 3, Vite and Tailwind).

## Decision

Vue 3 (Composition API, `<script setup>`) with TypeScript in strict mode, built with Vite and prerendered to static HTML at build time with vite-ssg, styled with Tailwind CSS over CSS-variable design tokens (light and dark themes), with Three.js loaded lazily for the 3D hero.

## Alternatives Considered

- **Nuxt**: full framework with server rendering; more than a static site needs, and a second set of conventions to learn.
- **Astro with Vue islands**: very good for static sites, but a new tool for the team and a split between Astro and Vue components.
- **Client-only single-page application**: poor indexing and slower first paint.

## Consequences

Pages are plain HTML on first load and interactive after hydration. Anything that reads `window` or `localStorage` (theme, language, consent, WebGL) must run only in the browser. Performance budgets are verified with Lighthouse CI.
