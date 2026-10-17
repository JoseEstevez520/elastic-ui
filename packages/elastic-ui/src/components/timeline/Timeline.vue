<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Things that happened, in order, each with its date: a career, a project's milestones, a
 * changelog. A hollow node for each, one line running through them, and beside each node its date
 * and title, drawn as Steps draws its steps. Taken from the Portfolio's lanes. For steps someone
 * follows, Steps.
 *
 * Two that ran at the same time (work and studies) go side by side, each under its own heading,
 * with `side-by-side`, which stacks them where they do not fit. On a ground other than the page,
 * set `--timeline-bg` to it, so the nodes still hide the line.
 */
const props = defineProps<{
  /** What the entries are, for screen readers, when no heading names the list. */
  label?: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <ol :aria-label="label" :class="cn('flex flex-col', props.class)">
    <slot />
  </ol>
</template>
