<script setup lang="ts">
/** The top of a product site: the product's name, what it is for, and its availability panel. */
import AvailabilityPanel from './AvailabilityPanel.vue'
import PageContainer from './PageContainer.vue'
import SectionHeading from './SectionHeading.vue'
import type { AvailabilityStrings, PanelProduct } from '../release-signup/types'

defineProps<{
  product: PanelProduct
  strings: AvailabilityStrings
  contactEmail: string
  consentVersion: string
  endpoint: string
}>()
</script>

<template>
  <section class="py-16 sm:py-24">
    <PageContainer>
      <SectionHeading
        :level="1"
        :title="product.name"
        :lead="product.statement"
      />
      <AvailabilityPanel
        :product="product"
        :strings="strings"
        :contact-email="contactEmail"
        :consent-version="consentVersion"
        :endpoint="endpoint"
      />
    </PageContainer>
  </section>
</template>
