<script setup lang="ts">
import { company, companySite, products } from '@levix/content'
import { SOURCE_LANGUAGE, layoutStrings } from '@levix/i18n'
import { SiteLayout } from '@levix/ui'
import { useHead } from '@unhead/vue'

useHead({ htmlAttrs: { lang: SOURCE_LANGUAGE } })
</script>

<template>
  <SiteLayout
    site="gedo"
    :company="company"
    :company-site="companySite"
    :products="products"
    :strings="layoutStrings"
  >
    <RouterView />
  </SiteLayout>
</template>
