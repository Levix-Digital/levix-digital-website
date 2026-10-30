<script setup lang="ts">
import { SOURCE_LANGUAGE } from '@levix/i18n'
import { useHead } from '@unhead/vue'

useHead({ htmlAttrs: { lang: SOURCE_LANGUAGE } })
</script>

<template>
  <RouterView />
</template>
