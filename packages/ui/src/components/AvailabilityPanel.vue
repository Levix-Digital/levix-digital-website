<script setup lang="ts">
/**
 * Whether a product can be downloaded today: its status, a note, and the download action. A product in development
 * shows the button disabled and, right below it, the release candidate signup.
 */
import { computed, useId } from 'vue'
import { fillText, type AvailabilityStrings, type PanelProduct } from '../release-signup/types'
import ActionLink from './ActionLink.vue'
import ReleaseSignupForm from './ReleaseSignupForm.vue'
import StatusBadge from './StatusBadge.vue'
import type { ReleaseSignupClient } from '../release-signup/client'

const props = withDefaults(
  defineProps<{
    product: PanelProduct
    strings: AvailabilityStrings
    contactEmail: string
    consentVersion: string
    endpoint: string
    client?: ReleaseSignupClient | undefined
  }>(),
  { client: undefined },
)

const id = useId()
const note = computed(() => fillText(props.strings[`availability.note.${props.product.status}`], { product: props.product.name }))
</script>

<template>
  <section
    :aria-labelledby="`${id}-label`"
    class="relative mt-10 overflow-hidden rounded-2xl border border-bevel bg-surface-raised p-6 shadow-ceramic"
  >
    <span
      aria-hidden="true"
      class="bg-aurora absolute inset-x-0 top-0 h-px opacity-70"
    />
    <div class="flex flex-wrap items-center gap-3">
      <h2
        :id="`${id}-label`"
        class="text-sm font-medium text-muted"
      >
        {{ strings['availability.label'] }}
      </h2>
      <StatusBadge
        :status="product.status"
        :label="strings[`availability.status.${product.status}`]"
      />
    </div>
    <p
      :id="`${id}-note`"
      class="mt-3"
    >
      {{ note }}
    </p>
    <div class="mt-5">
      <ActionLink
        v-if="product.install"
        :href="product.install.url"
      >
        {{ product.install.label }}
      </ActionLink>
      <button
        v-else
        type="button"
        disabled
        :aria-describedby="`${id}-note`"
        class="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-control px-5 py-2.5 text-sm font-semibold text-muted opacity-70"
      >
        {{ strings['availability.download'] }}
      </button>
    </div>
    <ReleaseSignupForm
      v-if="product.status === 'in-development'"
      :product="product"
      :strings="strings"
      :contact-email="contactEmail"
      :consent-version="consentVersion"
      :endpoint="endpoint"
      :client="client"
    />
  </section>
</template>
