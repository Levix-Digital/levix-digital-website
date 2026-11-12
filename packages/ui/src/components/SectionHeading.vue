<script setup lang="ts">
/** The heading of a page section: an optional eyebrow, the title at the given level and a lead. */
withDefaults(
  defineProps<{ title: string; id?: string | undefined; eyebrow?: string | undefined; lead?: string | undefined; level?: 1 | 2 | 3 }>(),
  { id: undefined, eyebrow: undefined, lead: undefined, level: 2 },
)
</script>

<template>
  <div class="max-w-3xl">
    <p
      v-if="eyebrow"
      class="font-mono text-xs font-medium uppercase tracking-widest text-accent"
    >
      {{ eyebrow }}
    </p>
    <component
      :is="`h${level}`"
      :id="id"
      class="mt-2 font-semibold tracking-tight"
      :class="level === 1 ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl'"
    >
      {{ title }}
    </component>
    <p
      v-if="lead"
      class="mt-4 text-lg"
    >
      {{ lead }}
    </p>
  </div>
</template>
