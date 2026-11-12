<script setup lang="ts">
import { company } from '@levix/content'
import { PageContainer, SectionHeading } from '@levix/ui'
import strings from '../../locales/en.json'
</script>

<template>
  <section
    id="contact"
    aria-labelledby="contact-title"
    tabindex="-1"
    class="scroll-mt-20 border-t border-bevel py-20"
  >
    <PageContainer>
      <SectionHeading
        id="contact-title"
        :eyebrow="strings['home.contact.eyebrow']"
        :title="strings['home.contact.title']"
        :lead="strings['home.contact.lead']"
      />
      <p class="mt-6 text-xl font-semibold">
        <a
          class="text-accent underline-offset-4 hover:underline"
          :href="`mailto:${company.email}`"
        >{{ company.email }}</a>
      </p>
      <p class="mt-2">
        {{ strings['home.contact.location'] }}
      </p>
    </PageContainer>
  </section>
</template>
