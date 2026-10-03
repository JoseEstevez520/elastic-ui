<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { timelineItemClass, timelineLineClass, timelineNodeVariants } from './timeline.variants'

/**
 * One entry of a Timeline: its date, its title and, if it needs one, a short line about it (the
 * slot). Its node sits level with the date, the first thing read.
 */
const props = defineProps<{
  /** When it happened, short: "2026", "Apr 2026", "2025–26". */
  date?: string
  title?: string
  /** Still going on: its node fills with the text's colour. */
  current?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <li :class="cn(timelineItemClass, props.class)">
    <!-- In the date's type, so `lh` is the date's line: the node centres on it and the line runs
         from one node's centre to the next's. -->
    <div aria-hidden="true" class="relative text-meta">
      <span class="flex h-[1lh] items-center">
        <span :class="timelineNodeVariants({ current })" />
      </span>
      <span :class="timelineLineClass" />
    </div>

    <div class="min-w-0 pb-7 group-last/timeline:pb-0">
      <p v-if="date" class="text-meta tabular-nums text-fg-muted">{{ date }}</p>
      <p class="mt-1 text-label text-fg">
        <slot name="title">{{ title }}</slot>
      </p>
      <div v-if="$slots.default" class="text-ui text-fg-muted">
        <slot />
      </div>
    </div>
  </li>
</template>
