<script setup lang="ts">
/**
 * The page frame of every site: a skip link, the header (the company's on the home, the
 * product's elsewhere), the page in <main>, and the shared footer. The site passes the facts and
 * the text.
 */
import { computed } from 'vue'
import type { LayoutCompany, LayoutSiteLink, LayoutStrings } from '../layout/types'
import CompanyHeader from './CompanyHeader.vue'
import ProductHeader from './ProductHeader.vue'
import SiteFooter from './SiteFooter.vue'

const props = defineProps<{
  site: string
  company: LayoutCompany
  companySite: LayoutSiteLink
  products: readonly LayoutSiteLink[]
  strings: LayoutStrings
}>()

const product = computed(() => props.products.find((candidate) => candidate.id === props.site))
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      class="sr-only rounded-full bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
      href="#main"
    >{{ strings['layout.skip'] }}</a>
    <ProductHeader
      v-if="product"
      :product="product"
      :company-site="companySite"
      :strings="strings"
    >
      <template #pickers>
        <slot name="pickers" />
      </template>
    </ProductHeader>
    <CompanyHeader
      v-else
      :company-site="companySite"
      :products="products"
      :strings="strings"
    >
      <template #pickers>
        <slot name="pickers" />
      </template>
    </CompanyHeader>
    <main
      id="main"
      class="flex-1 focus:outline-none"
      tabindex="-1"
    >
      <slot />
    </main>
    <SiteFooter
      :company="company"
      :products="products"
      :current="site"
      :strings="strings"
    />
  </div>
</template>
