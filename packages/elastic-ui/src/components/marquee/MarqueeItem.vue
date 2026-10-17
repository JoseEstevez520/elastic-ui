<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useMarqueeContext } from './marquee.context'
import { marqueeIconVariants, marqueeItemVariants } from './marquee.variants'

/**
 * One entry of a Marquee: an optional icon and its text, in one style. Keep it to a few words; a
 * date or a place goes in the same line ("Winner · Regional hackathon 2026"), not beside it.
 */
const props = defineProps<{
  /** Shown before the text, in a thin stroke, in the text's grey. */
  icon?: Component
  class?: HTMLAttributes['class']
}>()

const { size } = useMarqueeContext()
</script>

<template>
  <li :class="cn(marqueeItemVariants({ size }), props.class)">
    <component :is="icon" v-if="icon" :stroke-width="1.5" aria-hidden="true" :class="marqueeIconVariants({ size })" />
    <slot />
  </li>
</template>
