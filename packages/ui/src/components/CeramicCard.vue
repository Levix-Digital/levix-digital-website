<script setup lang="ts">
/**
 * A ceramic plate: raised surface, bevel border and ceramic shadow, with an aurora seam on top.
 * With `href` the whole card is one link (the title is its accessible name); without it, plain content.
 */
withDefaults(defineProps<{ title: string; href?: string | undefined; headingLevel?: 2 | 3 | 4 }>(), {
  href: undefined,
  headingLevel: 3,
})
</script>

<template>
  <article
    class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-bevel bg-surface-raised p-6 shadow-ceramic transition-shadow"
    :class="href ? 'focus-within:shadow-ceramic-active hover:shadow-ceramic-active' : ''"
  >
    <span
      aria-hidden="true"
      class="bg-aurora absolute inset-x-0 top-0 h-px opacity-70"
    />
    <component
      :is="`h${headingLevel}`"
      class="text-xl font-semibold"
    >
      <a
        v-if="href"
        :href="href"
        class="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
      >{{ title }}</a>
      <template v-else>
        {{ title }}
      </template>
    </component>
    <slot />
  </article>
</template>
