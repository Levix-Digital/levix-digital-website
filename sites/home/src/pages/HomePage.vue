<script setup lang="ts">
import { company } from '@levix/content'
import { PageContainer, ThemePicker } from '@levix/ui'
import { useHead } from '@unhead/vue'
import strings from '../locales/en.json'

useHead({ title: strings['home.title'] })

const themeLabels = {
  legend: strings['theme.legend'],
  system: strings['theme.system'],
  light: strings['theme.light'],
  dark: strings['theme.dark'],
}
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
      <ThemePicker
        class="mt-8"
        :labels="themeLabels"
      />
    </PageContainer>
  </main>
</template>
