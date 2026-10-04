<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'

/**
 * The end of a page that belongs to a sequence (a guide, a course): the one before and the one
 * after, to keep going without going back to the contents. Holds one or two PageNavLinks; with
 * only a `next` it keeps to the right, so the place of each stays the same from page to page.
 */
const props = withDefaults(
  defineProps<{
    /** Names the navigation, for screen readers. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('pageNav') },
)
</script>

<template>
  <nav :aria-label="label" :class="cn('grid gap-4 sm:grid-cols-2', props.class)">
    <slot />
  </nav>
</template>
