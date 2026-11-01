<script setup lang="ts">
/**
 * The header of a product site: the product's name in front and a smaller "by Levix Digital"
 * link to the company home. It shares the tokens of the company header, not its layout; each
 * product's own look (logo, accent, menu) is added here by the product site items.
 */
import type { LayoutSiteLink, LayoutStrings } from '../layout/types'
import HeaderBar from './HeaderBar.vue'
import LevixMonogram from './LevixMonogram.vue'
import ThemePicker from './ThemePicker.vue'

const props = defineProps<{
  product: LayoutSiteLink
  companySite: LayoutSiteLink
  strings: LayoutStrings
}>()

const themeLabels = {
  legend: props.strings['theme.legend'],
  system: props.strings['theme.system'],
  light: props.strings['theme.light'],
  dark: props.strings['theme.dark'],
}
</script>

<template>
  <HeaderBar :menu-label="strings['layout.menu']">
    <template #brand>
      <div class="flex flex-col">
        <a
          class="font-display text-xl font-semibold tracking-tight text-title"
          href="/"
        >{{ product.name }}</a>
        <a
          class="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
          :href="companySite.url"
        >
          {{ strings['layout.by'] }}
          <LevixMonogram class="h-3 w-auto" />
          <span>{{ companySite.name }}</span>
        </a>
      </div>
    </template>
    <template #pickers>
      <ThemePicker :labels="themeLabels" />
      <slot name="pickers" />
    </template>
  </HeaderBar>
</template>
