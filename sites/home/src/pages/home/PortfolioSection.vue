<script setup lang="ts">
import { portfolio, productLines, type AvailabilityStatus } from '@levix/content'
import { CeramicCard, PageContainer, SectionHeading, StatusBadge } from '@levix/ui'
import strings from '../../locales/en.json'

const STATUS_LABEL: Record<AvailabilityStatus, string> = {
  available: strings['home.status.available'],
  preview: strings['home.status.preview'],
  'in-development': strings['home.status.in-development'],
}

const lines = productLines.map((line) => ({
  ...line,
  products: portfolio.filter((product) => product.line === line.id),
}))
</script>

<template>
  <section
    id="products"
    aria-labelledby="products-title"
    tabindex="-1"
    class="scroll-mt-20 border-t border-bevel py-20"
  >
    <PageContainer>
      <SectionHeading
        id="products-title"
        :eyebrow="strings['home.products.eyebrow']"
        :title="strings['home.products.title']"
        :lead="strings['home.products.lead']"
      />
      <div
        v-for="line in lines"
        :key="line.id"
        class="mt-14"
        :data-line="line.id"
      >
        <h3 class="text-2xl font-semibold">
          {{ line.name }}
        </h3>
        <p class="mt-2 max-w-3xl">
          {{ line.summary }}
        </p>
        <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="product in line.products"
            :key="product.id"
            :data-product="product.id"
          >
            <CeramicCard
              :title="product.name"
              :href="product.site"
              :heading-level="4"
            >
              <p class="mt-3 flex-1">
                {{ product.statement }}
              </p>
              <p class="mt-5 flex flex-wrap items-center gap-3">
                <StatusBadge
                  :status="product.status"
                  :label="STATUS_LABEL[product.status]"
                />
                <span
                  v-if="!product.site"
                  class="text-sm text-muted"
                >{{ strings['home.products.noSite'] }}</span>
              </p>
            </CeramicCard>
          </li>
        </ul>
      </div>
    </PageContainer>
  </section>
</template>
