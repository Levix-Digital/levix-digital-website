<script setup lang="ts">
/**
 * The theme picker (FEAT-007): System, Light and Dark as native radio buttons in a segmented
 * control, so the keyboard (Tab, arrow keys) and screen readers work with no extra code.
 * The site passes the labels: this package does not own text.
 */
import { useId } from 'vue'
import type { ThemePreference } from '../theme/preference'
import { useThemePreference } from '../theme/useThemePreference'

export interface ThemePickerLabels {
  legend: string
  system: string
  light: string
  dark: string
}

defineProps<{ labels: ThemePickerLabels }>()

const OPTIONS: readonly ThemePreference[] = ['system', 'light', 'dark']

const name = `theme-${useId()}`
const { preference, setPreference } = useThemePreference()
</script>

<template>
  <fieldset class="inline-flex rounded-full border border-control bg-surface-raised p-0.5 text-sm">
    <legend class="sr-only">
      {{ labels.legend }}
    </legend>
    <label
      v-for="option in OPTIONS"
      :key="option"
      class="cursor-pointer rounded-full px-3 py-1 text-body has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
    >
      <input
        class="sr-only"
        type="radio"
        :name="name"
        :value="option"
        :checked="preference === option"
        @change="setPreference(option)"
      >
      {{ labels[option] }}
    </label>
  </fieldset>
</template>
