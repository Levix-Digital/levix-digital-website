<script setup lang="ts">
/** The company navigation: a named list of links, stacked on small screens, in a row on wide ones. */
import type { LayoutSiteLink } from '../layout/types'

defineProps<{ label: string; links: readonly LayoutSiteLink[] }>()
</script>

<template>
  <nav :aria-label="label">
    <ul class="flex flex-col gap-3 md:flex-row md:gap-6">
      <li
        v-for="link in links"
        :key="link.id"
      >
        <a
          class="text-sm font-medium text-body hover:text-accent"
          :href="link.url"
        >{{ link.name }}</a>
      </li>
    </ul>
  </nav>
</template>
