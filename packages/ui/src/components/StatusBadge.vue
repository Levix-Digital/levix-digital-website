<script setup lang="ts">
/** The availability of a product as a text label, colored by status (the color never carries it alone). */
import { computed } from 'vue'

export type BadgeStatus = 'available' | 'preview' | 'in-development'

const props = defineProps<{ status: BadgeStatus; label: string }>()

const TONE: Record<BadgeStatus, string> = {
  available: 'text-success border-success',
  preview: 'text-info border-info',
  'in-development': 'text-muted border-control',
}

const tone = computed(() => TONE[props.status])
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium"
    :class="tone"
    :data-status="status"
  >{{ label }}</span>
</template>
