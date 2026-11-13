<script setup lang="ts">
import { company, productById, releaseSignupEndpoint } from '@levix/content'
import { availabilityStrings } from '@levix/i18n'
import { SubscriptionResultPage } from '@levix/ui'
import { useHead } from '@unhead/vue'

const props = defineProps<{ mode: 'confirm' | 'unsubscribe' }>()
const product = productById('gedo')

useHead({
  title: `${availabilityStrings[props.mode === 'confirm' ? 'subscription.confirm.title' : 'subscription.unsubscribe.title']} · ${product.name}`,
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <SubscriptionResultPage
    :mode="mode"
    :product-name="product.name"
    :strings="availabilityStrings"
    :contact-email="company.email"
    :endpoint="releaseSignupEndpoint"
  />
</template>
