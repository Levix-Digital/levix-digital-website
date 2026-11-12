<script setup lang="ts">
import { useHead } from '@unhead/vue'
import strings from '../locales/en.json'
import AboutSection from './home/AboutSection.vue'
import ContactSection from './home/ContactSection.vue'
import HeroSection from './home/HeroSection.vue'
import PortfolioSection from './home/PortfolioSection.vue'
import ResearchSection from './home/ResearchSection.vue'

useHead({
  title: strings['home.title'],
  meta: [{ name: 'description', content: strings['home.description'] }],
})
</script>

<template>
  <HeroSection />
  <PortfolioSection />
  <AboutSection />
  <ResearchSection />
  <ContactSection />
</template>
