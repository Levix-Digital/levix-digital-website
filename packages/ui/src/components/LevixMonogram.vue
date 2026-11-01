<script setup lang="ts">
/**
 * The "LD" monogram of the company logo (levix-digital-logo.svg), cropped to the symbol, without
 * the file's light background or text, so it sits on either theme. The groove follows the bevel
 * token; the opal metal keeps its colors. Decorative: the link around it carries the name.
 */
import { useId } from 'vue'

const PATH = 'M 260 65 L 260 225 L 430 225 A 70 70 0 0 0 500 155 A 70 70 0 0 0 430 85 L 380 85 L 380 170'

// Two monograms on a page need their own gradient and filter ids; url(#...) needs a plain id.
const key = useId().replace(/[^\w-]/g, '')
const metal = `levix-metal-${key}`
const sheen = `levix-sheen-${key}`
const deboss = `levix-deboss-${key}`
</script>

<template>
  <svg
    viewBox="232 58 296 196"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient
        :id="metal"
        x1="0%"
        y1="100%"
        x2="100%"
        y2="0%"
      >
        <stop
          offset="0%"
          stop-color="#080A0E"
        />
        <stop
          offset="22%"
          stop-color="#121722"
        />
        <stop
          offset="38%"
          stop-color="#00E5FF"
        />
        <stop
          offset="48%"
          stop-color="#0D1219"
        />
        <stop
          offset="68%"
          stop-color="#7928CA"
        />
        <stop
          offset="84%"
          stop-color="#141922"
        />
        <stop
          offset="100%"
          stop-color="#07090C"
        />
      </linearGradient>
      <linearGradient
        :id="sheen"
        x1="100%"
        y1="100%"
        x2="0%"
        y2="0%"
      >
        <stop
          offset="0%"
          stop-color="#000000"
          stop-opacity="0.85"
        />
        <stop
          offset="36%"
          stop-color="#00E5FF"
          stop-opacity="0.28"
        />
        <stop
          offset="68%"
          stop-color="#7928CA"
          stop-opacity="0.28"
        />
        <stop
          offset="100%"
          stop-color="#000000"
          stop-opacity="0.9"
        />
      </linearGradient>
      <filter
        :id="deboss"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
      >
        <feDropShadow
          dx="0"
          dy="2.5"
          stdDeviation="1.5"
          flood-color="#000000"
          flood-opacity="0.25"
        />
        <feDropShadow
          dx="0"
          dy="-1"
          stdDeviation="0.8"
          flood-color="#E2E8F0"
          flood-opacity="0.8"
        />
      </filter>
    </defs>
    <path
      class="stroke-bevel"
      :d="PATH"
      fill="none"
      stroke-width="46"
    />
    <path
      :d="PATH"
      fill="none"
      :stroke="`url(#${metal})`"
      stroke-width="40"
      :filter="`url(#${deboss})`"
    />
    <path
      class="mix-blend-screen"
      :d="PATH"
      fill="none"
      :stroke="`url(#${sheen})`"
      stroke-width="40"
    />
  </svg>
</template>
