<script setup lang="ts">
/** A link styled as a button: primary (accent fill) or secondary (outlined). */
withDefaults(defineProps<{ href: string; variant?: 'primary' | 'secondary' }>(), { variant: 'primary' })
</script>

<template>
  <a
    :href="href"
    class="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
    :class="variant === 'primary'
      ? 'bg-accent text-on-accent hover:opacity-90'
      : 'border border-control text-title hover:border-accent hover:text-accent'"
  ><slot /></a>
</template>
