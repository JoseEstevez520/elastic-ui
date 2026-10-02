<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A plain line in a diagram, with no tint: an icon and a short text, as one item of a list in an
 * area (the tools a harness gives, what a role may do). `color` tints the text and the icon, for
 * what it means (an outcome's colour for yes, ask or no).
 */
const props = defineProps<{
  icon?: Component
  /** Any CSS colour, for the text and the icon. */
  color?: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span :class="cn('flex items-center gap-2 text-label', props.class)" :style="color ? { color } : undefined">
    <component :is="icon" v-if="icon" class="size-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
    <slot />
  </span>
</template>
