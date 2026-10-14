<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A quiet placeholder for content that has not arrived yet, with the shape of what will come: a
 * block a tone off the page and a faint band crossing it, which stops under reduced motion. Its size
 * is the consumer's (`class="h-4 w-48"`); `circle` makes it round, for an avatar. Hidden from screen
 * readers: mark the region that waits with `aria-busy="true"` and say so once, as USAGE shows.
 */
const props = defineProps<{
  circle?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div aria-hidden="true" :class="cn('skeleton', circle && 'rounded-full', props.class)" />
</template>
