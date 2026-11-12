<script setup lang="ts">
import { PageContainer, SectionHeading } from '@levix/ui'
import strings from '../../locales/en.json'
</script>

<template>
  <section
    aria-labelledby="research-title"
    class="border-t border-bevel py-20"
  >
    <PageContainer>
      <SectionHeading
        id="research-title"
        :eyebrow="strings['home.research.eyebrow']"
        :title="strings['home.research.title']"
      />
      <p class="mt-6 max-w-3xl text-lg">
        {{ strings['home.research.body'] }}
      </p>
      <p class="mt-4 font-mono text-sm text-muted">
        {{ strings['home.research.status'] }}
      </p>
    </PageContainer>
  </section>
</template>
