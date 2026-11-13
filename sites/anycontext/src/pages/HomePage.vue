<script setup lang="ts">
import { company, productById, releaseSignupEndpoint } from '@levix/content'
import { CONSENT_VERSION, availabilityStrings } from '@levix/i18n'
import { ProductIntro } from '@levix/ui'
import { useHead } from '@unhead/vue'

const product = productById('anycontext')

useHead({ title: product.name, meta: [{ name: 'description', content: product.statement }] })
</script>

<template>
  <ProductIntro
    :product="product"
    :strings="availabilityStrings"
    :contact-email="company.email"
    :consent-version="CONSENT_VERSION"
    :endpoint="releaseSignupEndpoint"
  />
</template>
