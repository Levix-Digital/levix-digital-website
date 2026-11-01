<script setup lang="ts">
/**
 * The footer of the five sites: the company's contact details, the product links and the
 * copyright. The year starts as the build year (matching the prerendered page, and kept without
 * JavaScript) and becomes the visitor's current year once mounted.
 */
import { onMounted, ref } from 'vue'
import { BUILD_YEAR } from '../layout/build-year'
import type { LayoutCompany, LayoutSiteLink, LayoutStrings } from '../layout/types'
import PageContainer from './PageContainer.vue'

defineProps<{
  company: LayoutCompany
  products: readonly LayoutSiteLink[]
  current: string
  strings: LayoutStrings
}>()

const year = ref(BUILD_YEAR)

onMounted(() => {
  year.value = new Date().getFullYear()
})
</script>

<template>
  <footer class="border-t border-bevel bg-surface-raised text-sm">
    <PageContainer>
      <div class="grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <h2 class="text-base font-semibold">
            {{ strings['layout.contact'] }}
          </h2>
          <p class="mt-3">
            <a
              class="text-accent underline-offset-4 hover:underline"
              :href="`mailto:${company.email}`"
            >{{ company.email }}</a>
          </p>
          <p class="mt-1">
            {{ company.location.city }}, {{ company.location.province }}, {{ company.location.country }}
          </p>
        </div>
        <div>
          <h2 class="text-base font-semibold">
            {{ strings['layout.products'] }}
          </h2>
          <ul class="mt-3 flex flex-col gap-1">
            <li
              v-for="product in products"
              :key="product.id"
            >
              <a
                class="hover:text-accent aria-[current=page]:font-semibold aria-[current=page]:text-title"
                :href="product.url"
                :aria-current="product.id === current ? 'page' : undefined"
              >{{ product.name }}</a>
            </li>
          </ul>
        </div>
      </div>
      <p class="border-t border-bevel py-6 text-muted">
        © {{ year }} {{ company.name }}
      </p>
    </PageContainer>
  </footer>
</template>
