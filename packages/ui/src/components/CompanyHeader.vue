<script setup lang="ts">
/** The header of the company home: the monogram and name, the product links and the pickers. */
import type { LayoutSiteLink, LayoutStrings } from '../layout/types'
import HeaderBar from './HeaderBar.vue'
import LevixMonogram from './LevixMonogram.vue'
import MainNavigation from './MainNavigation.vue'
import ThemePicker from './ThemePicker.vue'

const props = defineProps<{
  companySite: LayoutSiteLink
  products: readonly LayoutSiteLink[]
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
      <a
        class="inline-flex items-center gap-2"
        :href="companySite.url"
        :aria-label="companySite.name"
      >
        <LevixMonogram class="h-7 w-auto" />
        <span class="font-display text-base tracking-[0.12em] whitespace-nowrap">
          <span class="font-bold text-title">LEVIX</span>
          <span class="text-body"> DIGITAL</span>
        </span>
      </a>
    </template>
    <MainNavigation
      :label="strings['layout.nav']"
      :links="products"
    />
    <template #pickers>
      <ThemePicker :labels="themeLabels" />
      <slot name="pickers" />
    </template>
  </HeaderBar>
</template>
