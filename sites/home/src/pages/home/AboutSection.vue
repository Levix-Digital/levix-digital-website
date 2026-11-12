<script setup lang="ts">
import { PageContainer, SectionHeading } from '@levix/ui'
import strings from '../../locales/en.json'
</script>

<template>
  <section
    aria-labelledby="about-title"
    class="border-t border-bevel py-20"
  >
    <PageContainer>
      <SectionHeading
        id="about-title"
        :eyebrow="strings['home.about.eyebrow']"
        :title="strings['home.about.title']"
      />
      <div class="mt-6 max-w-3xl space-y-4 text-lg">
        <p class="text-title">
          {{ strings['home.about.body1'] }}
        </p>
        <p>{{ strings['home.about.body2'] }}</p>
        <p>{{ strings['home.about.body3'] }}</p>
      </div>
    </PageContainer>
  </section>
</template>
