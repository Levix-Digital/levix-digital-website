<script setup lang="ts">
/**
 * The frame both headers share: the brand on the left; the navigation and the pickers on the
 * right on wide screens, folded behind a menu button below the md breakpoint. The prerendered
 * page shows everything (nothing is out of reach without JavaScript); the button appears once
 * mounted, so the hydrated markup matches the prerendered one.
 */
import { nextTick, onMounted, ref, useId } from 'vue'
import PageContainer from './PageContainer.vue'

defineProps<{ menuLabel: string }>()

const panelId = `header-panel-${useId()}`
const enhanced = ref(false)
const open = ref(false)
const button = ref<HTMLButtonElement | null>(null)

onMounted(() => {
  enhanced.value = true
})

async function closeAndFocus(): Promise<void> {
  if (!open.value) return
  open.value = false
  await nextTick()
  button.value?.focus()
}

function closeOnLink(event: MouseEvent): void {
  if (event.target instanceof Element && event.target.closest('a')) open.value = false
}
</script>

<template>
  <header
    class="border-b border-bevel bg-surface-raised"
    @keydown.esc="closeAndFocus"
  >
    <PageContainer>
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <div class="mr-auto min-w-0">
          <slot name="brand" />
        </div>
        <button
          v-if="enhanced"
          ref="button"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-control px-3 py-1 text-sm text-title md:hidden"
          :aria-expanded="open"
          :aria-controls="panelId"
          @click="open = !open"
        >
          <svg
            class="size-4"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              :d="open ? 'M3 3 L13 13 M13 3 L3 13' : 'M2 4 H14 M2 8 H14 M2 12 H14'"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          {{ menuLabel }}
        </button>
        <div
          :id="panelId"
          class="w-full flex-col gap-4 pb-2 md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:pb-0"
          :class="enhanced && !open ? 'hidden' : 'flex'"
          @click="closeOnLink"
        >
          <slot />
          <div class="flex items-center gap-3">
            <slot name="pickers" />
          </div>
        </div>
      </div>
    </PageContainer>
  </header>
</template>
