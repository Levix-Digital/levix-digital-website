<script setup lang="ts">
import { company, productById, releaseSignupEndpoint } from '@levix/content'
import { CONSENT_VERSION, availabilityStrings } from '@levix/i18n'
import { BUILD_RELEASE, ProductIntro } from '@levix/ui'
import { useHead } from '@unhead/vue'

// The latest release read while the site was built (FEAT-016).
const product = { ...productById('docmapper'), release: BUILD_RELEASE }

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
