<script setup lang="ts">
import { company } from '@levix/content'
import { PageContainer } from '@levix/ui'
import { useHead } from '@unhead/vue'
import strings from '../locales/en.json'

useHead({ title: strings['home.title'] })
</script>

<template>
  <main class="flex min-h-screen items-center py-24">
    <PageContainer>
      <h1 class="text-4xl font-semibold tracking-tight">
        {{ strings['home.title'] }}
      </h1>
      <p class="mt-4 text-lg">
        {{ strings['home.notice'] }}
      </p>
      <p class="mt-8 text-sm">
        {{ company.name }}
      </p>
    </PageContainer>
  </main>
</template>
