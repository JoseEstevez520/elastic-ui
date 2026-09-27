<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { descriptionListVariants } from './description-list.variants'

/**
 * A quiet list of key → value pairs, like a record's details: a term and its value
 * (DescriptionItem), parted by space. Semantic `dl`, so it reads as a record to a screen reader
 * too. A value can hold anything: a Badge, a link, a CopyButton.
 */
const props = defineProps<{
  /** A hairline between rows, for a denser record; at rest, space alone parts them. */
  divided?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <dl :class="cn(descriptionListVariants({ divided }), props.class)">
    <slot />
  </dl>
</template>
