---
title: Design System
summary: Ceramic and Aurora tokens, light and dark themes, shared layout, components and the 3D hero.
code: [packages/ui]
---

# Design System

Ceramic and Aurora tokens, light and dark themes, shared layout, components and the 3D hero.

## Responsibilities

Owns the Ceramic and Aurora design language: tokens (colors, typography, shadows), the light and dark themes, the shared layout (header, footer, availability banner, consent banner, language and theme pickers), components (ceramic cards, buttons, plan tables, download panels) and the 3D hero. Does not own text or facts.

## Structure

`packages/ui/src/tokens.css` (CSS variables per theme), `tailwind.preset.ts`, `components/`, `layout/`, `hero/` (Three.js scene, aurora shader, static fallback). Public entry point `packages/ui/src/index.ts`.

## Behavior

Light is the default theme; dark follows the system preference until the visitor chooses, and the choice is kept in local storage. The hero loads Three.js after the first paint, only with WebGL and without a reduced-motion preference; otherwise it shows a static image. It pauses when off screen.

## Interfaces

Components receive text through props or the i18n `t()` function; they never import product content directly.

## Decisions

- [ADR-0002](../adr/0002-vue-3-with-vite-static-prerendering.md): Vue 3, Tailwind and Three.js.
