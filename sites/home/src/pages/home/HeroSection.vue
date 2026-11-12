<script setup lang="ts">
import { ActionLink, PageContainer, SectionHeading } from '@levix/ui'
import strings from '../../locales/en.json'
</script>

<template>
  <section
    aria-labelledby="hero-title"
    class="relative overflow-hidden py-20 sm:py-28"
  >
    <PageContainer>
      <SectionHeading
        id="hero-title"
        :level="1"
        :eyebrow="strings['home.hero.eyebrow']"
        :title="strings['home.hero.headline']"
        :lead="strings['home.hero.lead']"
      />
      <span
        aria-hidden="true"
        class="bg-aurora mt-10 block h-px w-40 opacity-80"
      />
      <div class="mt-10 flex flex-wrap gap-4">
        <ActionLink href="#products">
          {{ strings['home.hero.products'] }}
        </ActionLink>
        <ActionLink
          href="#contact"
          variant="secondary"
        >
          {{ strings['home.hero.contact'] }}
        </ActionLink>
      </div>
    </PageContainer>
  </section>
</template>
