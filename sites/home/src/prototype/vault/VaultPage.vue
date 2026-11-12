<script setup lang="ts">
/**
 * The vault home prototype (route /prototype/vault, not indexed). The first screen is a stage: a
 * 3D vault that opens on the products, with company panels above and product buttons below,
 * styled as a spaceship console. Below the stage, the same content as plain HTML, for search
 * engines and for visitors who just want to read. Without WebGL, with reduced motion or reduced
 * data, or by the visitor's choice, the stage is a still image with the same panels.
 */
import { PageContainer } from '@levix/ui'
import { useHead } from '@unhead/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue'
import { chooseMode, readViewEnvironment, storeMode, type VaultMode } from './capability'
import { vaultProducts, vaultSections, vaultText, type VaultSectionId } from './content'
import type { VaultScene } from './scene'

useHead({
  title: `${vaultText.title}: vault prototype`,
  meta: [{ name: 'robots', content: 'noindex' }],
})

/** `pending` is the prerendered page, before the browser decides. */
const mode = ref<VaultMode | 'pending'>('pending')
const sceneReady = ref(false)
const introDone = ref(false)
const focused = ref<number | null>(null)
const hovered = ref<number | null>(null)
const openSection = ref<VaultSectionId | null>(null)
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const productPanel = useTemplateRef<HTMLElement>('productPanel')
const sectionPanel = useTemplateRef<HTMLElement>('sectionPanel')
const scene = shallowRef<VaultScene | null>(null)

const focusedProduct = computed(() => (focused.value === null ? null : vaultProducts[focused.value]))
const currentSection = computed(() => vaultSections.find((section) => section.id === openSection.value) ?? null)
/** The console (panels and buttons) shows once the intro is over, or at once in the static view. */
const consoleVisible = computed(() => mode.value !== 'cinematic' || introDone.value)
const hint = computed(() => (hovered.value === null ? vaultText.ringHint : vaultProducts[hovered.value]?.name))

let returnFocus: HTMLElement | null = null
let themeObserver: MutationObserver | null = null
let colorScheme: MediaQueryList | null = null

function isDark(): boolean {
  return getComputedStyle(document.documentElement).colorScheme.includes('dark')
}

function followTheme(): void {
  scene.value?.setDark(isDark())
}

async function startScene(skipIntro: boolean): Promise<void> {
  await nextTick()
  if (!canvas.value) return
  try {
    const { createVaultScene } = await import('./scene')
    if (mode.value !== 'cinematic' || !canvas.value) return
    scene.value = createVaultScene({
      canvas: canvas.value,
      products: vaultProducts,
      dark: isDark(),
      skipIntro,
      onSelect: (index) => selectProduct(index),
      onHover: (index) => (hovered.value = index),
      onIntroDone: () => (introDone.value = true),
      onFailure: () => setMode('static', false),
    })
    sceneReady.value = true
  } catch {
    // No WebGL context after all, or the module failed to load: the static view has everything.
    setMode('static', false)
  }
}

function stopScene(): void {
  scene.value?.dispose()
  scene.value = null
  sceneReady.value = false
}

function setMode(next: VaultMode, remember = true): void {
  if (remember) storeMode(next)
  if (next === mode.value) return
  mode.value = next
  if (next === 'static') {
    stopScene()
    return
  }
  introDone.value = false
  void startScene(true)
}

function selectProduct(index: number, from?: HTMLElement): void {
  returnFocus = from ?? null
  openSection.value = null
  focused.value = index
  scene.value?.focus(index)
  void nextTick(() => productPanel.value?.focus())
}

function closeProduct(): void {
  focused.value = null
  scene.value?.release()
  returnFocus?.focus()
  returnFocus = null
}

function toggleSection(id: VaultSectionId, from: HTMLElement): void {
  if (openSection.value === id) {
    closeSection()
    return
  }
  returnFocus = from
  focused.value = null
  openSection.value = id
  scene.value?.lookUp(true)
  void nextTick(() => sectionPanel.value?.focus())
}

function closeSection(): void {
  openSection.value = null
  scene.value?.lookUp(false)
  returnFocus?.focus()
  returnFocus = null
}

function turn(step: 1 | -1): void {
  if (scene.value) {
    const index = scene.value.turn(step)
    if (focused.value !== null) focused.value = index
    return
  }
  const count = vaultProducts.length
  if (focused.value !== null) focused.value = (focused.value + step + count) % count
}

function skipIntro(): void {
  scene.value?.skipIntro()
}

function replayIntro(): void {
  focused.value = null
  openSection.value = null
  introDone.value = false
  scene.value?.replayIntro()
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target instanceof Element ? event.target : null
  if (target?.closest('input, textarea, select')) return
  if (event.key === 'Escape') {
    if (focused.value !== null) closeProduct()
    else if (openSection.value) closeSection()
    else skipIntro()
  } else if (consoleVisible.value && target?.closest('[data-vault-stage]')) {
    if (event.key === 'ArrowRight') turn(1)
    else if (event.key === 'ArrowLeft') turn(-1)
  }
}

onMounted(() => {
  const chosen = chooseMode(readViewEnvironment())
  mode.value = chosen
  window.addEventListener('keydown', onKeydown)
  themeObserver = new MutationObserver(followTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  colorScheme = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null
  colorScheme?.addEventListener('change', followTheme)
  // The scene loads after the first paint of the page, so it never delays the content.
  if (chosen === 'cinematic') requestAnimationFrame(() => setTimeout(() => void startScene(false), 0))
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  themeObserver?.disconnect()
  colorScheme?.removeEventListener('change', followTheme)
  stopScene()
})
</script>

<template>
  <section
    class="vault-stage"
    :class="{
      'is-cinematic': mode === 'cinematic',
      'is-ready': sceneReady,
      'is-intro': mode === 'cinematic' && !introDone,
      'has-panel': focused !== null || openSection !== null,
    }"
    aria-labelledby="vault-title"
    data-vault-stage
  >
    <!-- The still image: the prerendered page, the static view and the moment before the scene. -->
    <div
      class="vault-poster"
      aria-hidden="true"
    >
      <div class="vault-poster-glow" />
      <div class="vault-poster-door">
        <span class="ring ring-1" />
        <span class="ring ring-2" />
        <span class="ring ring-3" />
        <span class="hub" />
      </div>
    </div>

    <canvas
      v-if="mode === 'cinematic'"
      ref="canvas"
      class="vault-canvas"
      aria-hidden="true"
    />

    <div class="vault-title">
      <p class="vault-badge">
        {{ vaultText.prototypeBadge }}
      </p>
      <h1
        id="vault-title"
        class="font-display text-4xl font-semibold tracking-tight text-title sm:text-6xl"
      >
        {{ vaultText.title }}
      </h1>
      <p class="mt-3 font-display text-xl text-title sm:text-2xl">
        {{ vaultText.headline }}
      </p>
      <p class="mt-3 max-w-xl text-base text-body">
        {{ vaultText.intro }}
      </p>
    </div>

    <!-- Above the ring: the company panels. -->
    <nav
      class="vault-console vault-console-top"
      :class="{ 'is-visible': consoleVisible }"
      aria-label="Company"
    >
      <button
        v-for="section in vaultSections"
        :key="section.id"
        type="button"
        class="vault-key"
        :aria-expanded="openSection === section.id"
        :aria-controls="openSection === section.id ? 'vault-section-panel' : undefined"
        @click="toggleSection(section.id, $event.currentTarget as HTMLElement)"
      >
        <span class="vault-key-index">{{ String(vaultSections.indexOf(section) + 1).padStart(2, '0') }}</span>
        {{ section.label }}
      </button>
    </nav>

    <!-- Below the ring: one button per product, and the arrows that turn the ring. -->
    <nav
      class="vault-console vault-console-bottom"
      :class="{ 'is-visible': consoleVisible }"
      :aria-label="vaultText.productsHeading"
    >
      <p
        class="vault-hint"
        aria-live="polite"
      >
        {{ hint }}
      </p>
      <div class="vault-keys">
        <button
          type="button"
          class="vault-key vault-arrow"
          aria-label="Previous product"
          @click="turn(-1)"
        >
          ‹
        </button>
        <button
          v-for="(product, index) in vaultProducts"
          :key="product.id"
          type="button"
          class="vault-key"
          :class="[`hue-${product.hue}`, { 'is-active': focused === index || hovered === index }]"
          :aria-pressed="focused === index"
          @click="selectProduct(index, $event.currentTarget as HTMLElement)"
        >
          <span class="vault-key-dot" />
          {{ product.name }}
        </button>
        <button
          type="button"
          class="vault-key vault-arrow"
          aria-label="Next product"
          @click="turn(1)"
        >
          ›
        </button>
      </div>
    </nav>

    <div class="vault-controls">
      <button
        v-if="mode === 'cinematic' && !introDone"
        type="button"
        class="vault-control"
        @click="skipIntro"
      >
        {{ vaultText.skip }}
      </button>
      <button
        v-if="mode === 'cinematic' && introDone"
        type="button"
        class="vault-control"
        @click="replayIntro"
      >
        {{ vaultText.replay }}
      </button>
      <button
        v-if="mode !== 'pending'"
        type="button"
        class="vault-control"
        @click="setMode(mode === 'cinematic' ? 'static' : 'cinematic')"
      >
        {{ mode === 'cinematic' ? vaultText.staticView : vaultText.cinematicView }}
      </button>
    </div>

    <aside
      v-if="focusedProduct"
      ref="productPanel"
      class="vault-panel vault-product-panel"
      :class="`hue-${focusedProduct.hue}`"
      tabindex="-1"
      :aria-label="focusedProduct.name"
    >
      <p class="vault-panel-label">
        {{ String((focused ?? 0) + 1).padStart(2, '0') }} / {{ String(vaultProducts.length).padStart(2, '0') }}
      </p>
      <h2 class="font-display text-3xl font-semibold text-title">
        {{ focusedProduct.name }}
      </h2>
      <p class="mt-2 text-body">
        {{ focusedProduct.tagline }}
      </p>
      <ul class="mt-4 space-y-2 text-sm text-body">
        <li
          v-for="fact in focusedProduct.facts"
          :key="fact"
          class="vault-fact"
        >
          {{ fact }}
        </li>
      </ul>
      <div class="mt-6 flex flex-wrap gap-3">
        <a
          class="vault-action is-primary"
          :href="focusedProduct.url"
        >{{ vaultText.visit }} {{ focusedProduct.name }}</a>
        <button
          type="button"
          class="vault-action"
          @click="closeProduct"
        >
          {{ vaultText.back }}
        </button>
      </div>
    </aside>

    <aside
      v-if="currentSection"
      id="vault-section-panel"
      ref="sectionPanel"
      class="vault-panel vault-section-panel"
      tabindex="-1"
      :aria-label="currentSection.title"
    >
      <p class="vault-panel-label">
        {{ currentSection.label }}
      </p>
      <h2 class="font-display text-2xl font-semibold text-title">
        {{ currentSection.title }}
      </h2>
      <p
        v-for="paragraph in currentSection.body"
        :key="paragraph"
        class="mt-2 text-body"
      >
        {{ paragraph }}
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <a
          v-if="currentSection.id === 'contact'"
          class="vault-action is-primary"
          href="mailto:contact@levix.digital"
        >contact@levix.digital</a>
        <button
          type="button"
          class="vault-action"
          @click="closeSection"
        >
          {{ vaultText.close }}
        </button>
      </div>
    </aside>
  </section>

  <!-- The same content as plain HTML: what search engines index and what a hurried reader scans. -->
  <section
    class="border-t border-bevel py-20"
    aria-labelledby="vault-products-heading"
  >
    <PageContainer>
      <h2
        id="vault-products-heading"
        class="font-display text-3xl font-semibold tracking-tight text-title"
      >
        {{ vaultText.productsHeading }}
      </h2>
      <ul class="mt-8 grid gap-6 sm:grid-cols-2">
        <li
          v-for="product in vaultProducts"
          :key="product.id"
          class="rounded-2xl border border-bevel bg-surface-raised p-6 shadow-ceramic"
        >
          <h3 class="font-display text-xl font-semibold text-title">
            <a
              class="hover:text-accent"
              :href="product.url"
            >{{ product.name }}</a>
          </h3>
          <p class="mt-2 text-body">
            {{ product.tagline }}
          </p>
          <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-body">
            <li
              v-for="fact in product.facts"
              :key="fact"
            >
              {{ fact }}
            </li>
          </ul>
        </li>
      </ul>
    </PageContainer>
  </section>
  <section
    v-for="section in vaultSections"
    :key="section.id"
    class="border-t border-bevel py-16"
    :aria-labelledby="`vault-${section.id}-heading`"
  >
    <PageContainer>
      <h2
        :id="`vault-${section.id}-heading`"
        class="font-display text-2xl font-semibold tracking-tight text-title"
      >
        {{ section.title }}
      </h2>
      <p
        v-for="paragraph in section.body"
        :key="paragraph"
        class="mt-3 max-w-3xl text-body"
      >
        {{ paragraph }}
      </p>
    </PageContainer>
  </section>
</template>

<style scoped>
/* The stage fills the first screen below the header. */
.vault-stage {
  --vault-line: color-mix(in srgb, var(--color-aurora-cyan) 45%, transparent);
  --vault-glass: color-mix(in srgb, var(--levix-surface-raised) 62%, transparent);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  height: calc(100svh - 4.5rem);
  min-height: 600px;
  background: radial-gradient(ellipse at 50% 45%, var(--levix-surface-raised), var(--levix-surface) 70%);
}

.vault-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.is-ready .vault-canvas {
  opacity: 1;
}

/* The still image: a closed vault door with its aurora seams, drawn in CSS. */
.vault-poster {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transition: opacity 0.8s ease;
}

.is-ready .vault-poster {
  opacity: 0;
}

.vault-poster-glow {
  position: absolute;
  width: min(80vmin, 640px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-aurora-cyan) 22%, transparent), transparent 65%);
}

.vault-poster-door {
  position: relative;
  width: min(54vmin, 440px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--levix-surface-raised), var(--levix-surface) 75%);
  box-shadow:
    0 0 0 10px var(--levix-bevel),
    0 0 0 13px color-mix(in srgb, var(--color-aurora-cyan) 60%, transparent),
    0 0 60px 10px var(--levix-shadow-glow-active),
    var(--shadow-ceramic);
}

.vault-poster-door .ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid var(--levix-bevel);
}

.vault-poster-door .ring-1 { inset: 8%; }
.vault-poster-door .ring-2 { inset: 22%; border-color: color-mix(in srgb, var(--color-aurora-emerald) 55%, transparent); }
.vault-poster-door .ring-3 { inset: 34%; border-width: 6px; }

.vault-poster-door .hub {
  position: absolute;
  inset: 46%;
  border-radius: 50%;
  background: var(--color-aurora-cyan);
  box-shadow: 0 0 24px 6px color-mix(in srgb, var(--color-aurora-cyan) 60%, transparent);
}

/* The title: over the door at first; in the 3D view it fades as the door opens. */
.vault-title {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 9%;
  width: min(92vw, 44rem);
  translate: -50% 0;
  text-align: center;
}

.vault-title p:last-child {
  margin-inline: auto;
}

.is-cinematic.is-ready .vault-title {
  animation: vault-title-out 0.9s ease 2.3s forwards;
}

.is-cinematic:not(.is-intro) .vault-title {
  animation: none;
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* In the static view the title stays, and the poster sits lower to make room for it. */
.vault-stage:not(.is-cinematic) .vault-poster {
  padding-top: 12rem;
}

.vault-stage:not(.is-cinematic) .vault-poster-door {
  width: min(28vmin, 250px);
}

/* With a panel open, the static view clears the title and the door for it. */
.vault-stage:not(.is-cinematic).has-panel .vault-title,
.vault-stage:not(.is-cinematic).has-panel .vault-poster {
  opacity: 0;
  visibility: hidden;
}

.vault-stage:not(.is-cinematic) .vault-product-panel {
  right: auto;
  left: 50%;
  top: 44%;
  translate: -50% -50%;
}

.vault-title,
.vault-poster {
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

@keyframes vault-title-out {
  to {
    opacity: 0;
    translate: -50% -1.5rem;
    visibility: hidden;
  }
}

.vault-badge {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.2rem 0.7rem;
  border: 1px solid var(--vault-line);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--levix-ink-cyan);
  background: var(--vault-glass);
}

/* The console: glass keys above and below the ring, like the screens of a ship's bridge. */
.vault-console {
  position: absolute;
  z-index: 3;
  left: 50%;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  width: max-content;
  max-width: calc(100% - 2rem);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.8s ease, translate 0.8s ease;
}

.vault-console.is-visible {
  visibility: visible;
  opacity: 1;
}

.vault-console-top {
  top: 1.25rem;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.vault-console-bottom {
  bottom: 1.5rem;
}

.vault-stage:not(.is-cinematic) .vault-console-top {
  top: auto;
  bottom: 7.5rem;
}

.vault-keys {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.vault-key,
.vault-control,
.vault-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border: 1px solid var(--vault-line);
  border-radius: 0.6rem;
  background: var(--vault-glass);
  backdrop-filter: blur(14px) saturate(1.3);
  color: var(--levix-title);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, translate 0.2s ease;
}

.vault-key:hover,
.vault-key.is-active,
.vault-action:hover,
.vault-control:hover {
  border-color: var(--color-aurora-cyan);
  box-shadow: 0 0 18px -2px color-mix(in srgb, var(--color-aurora-cyan) 55%, transparent);
  translate: 0 -1px;
}

.vault-key:focus-visible,
.vault-control:focus-visible,
.vault-action:focus-visible,
.vault-panel:focus-visible {
  outline: 2px solid var(--levix-focus);
  outline-offset: 3px;
}

/* Corner brackets on the keys. */
.vault-key::before,
.vault-key::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  border-color: var(--color-aurora-cyan);
  border-style: solid;
}

.vault-key::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; border-top-left-radius: 0.6rem; }
.vault-key::after { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; border-bottom-right-radius: 0.6rem; }

.vault-key-index {
  color: var(--levix-ink-cyan);
}

.vault-key-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--hue);
  box-shadow: 0 0 8px var(--hue);
}

.vault-arrow {
  padding-inline: 0.85rem;
  font-size: 1.1rem;
}

.hue-cyan { --hue: var(--color-aurora-cyan); }
.hue-emerald { --hue: var(--color-aurora-emerald); }
.hue-purple { --hue: #9b4dff; }
.hue-magenta { --hue: #ff2d95; }

.vault-hint {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--levix-title);
  text-shadow: 0 0 12px var(--levix-surface);
}

.vault-controls {
  position: absolute;
  z-index: 3;
  right: 1rem;
  top: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.vault-control {
  padding: 0.4rem 0.75rem;
  font-size: 0.68rem;
}

/* Panels: the product the camera flew to, and the company sections. */
.vault-panel {
  position: absolute;
  z-index: 4;
  padding: 1.75rem;
  border: 1px solid var(--vault-line);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--levix-surface-raised) 72%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: var(--shadow-ceramic-active);
  animation: vault-panel-in 0.6s ease 0.35s both;
}

.vault-panel::before {
  content: "";
  position: absolute;
  inset: 0 1.5rem auto;
  height: 2px;
  background: linear-gradient(90deg, var(--color-aurora-cyan), var(--color-aurora-emerald), var(--color-aurora-purple), var(--color-aurora-magenta));
}

.vault-product-panel {
  right: clamp(1rem, 6vw, 6rem);
  top: 50%;
  translate: 0 -50%;
  width: min(26rem, calc(100% - 2rem));
}

.vault-product-panel::before {
  background: var(--hue);
  box-shadow: 0 0 14px var(--hue);
}

.vault-section-panel {
  left: 50%;
  top: 5.5rem;
  translate: -50% 0;
  width: min(34rem, calc(100% - 2rem));
}

.vault-panel-label {
  margin-bottom: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--levix-ink-cyan);
}

.vault-fact {
  padding-left: 1rem;
  border-left: 2px solid var(--hue, var(--color-aurora-cyan));
}

.vault-action {
  text-decoration: none;
}

.vault-action.is-primary {
  background: var(--levix-accent);
  border-color: var(--levix-accent);
  color: var(--levix-on-accent);
}

@keyframes vault-panel-in {
  from {
    opacity: 0;
    filter: blur(6px);
  }
}

/* Narrow screens: the product panel becomes a sheet at the bottom. */
@media (max-width: 720px) {
  .vault-product-panel {
    left: 1rem;
    right: 1rem;
    top: auto;
    bottom: 1rem;
    translate: none;
    width: auto;
    max-height: 52%;
    overflow-y: auto;
    padding: 1.25rem;
    translate: none;
  }

  .vault-stage:not(.is-cinematic) .vault-product-panel {
    left: 1rem;
    top: auto;
    translate: none;
  }

  .vault-panel h2 {
    font-size: 1.5rem;
  }

  .has-panel .vault-console-top,
  .has-panel .vault-controls {
    visibility: hidden;
    opacity: 0;
  }

  .vault-controls {
    top: auto;
    bottom: 9.5rem;
  }

  .vault-console-top {
    top: 4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vault-canvas,
  .vault-poster,
  .vault-console,
  .vault-panel {
    transition: none;
    animation: none;
  }
}
</style>
