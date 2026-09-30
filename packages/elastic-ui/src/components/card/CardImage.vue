<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useCardContext } from './card.context'
import { cardImageVariants, imageFade } from './card.variants'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    /** Fades the bottom edge into the card instead of ending in a hard line. */
    fade?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { alt: '' },
)
const { size } = useCardContext()
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    loading="lazy"
    decoding="async"
    :class="cn(cardImageVariants({ size }), fade && imageFade, props.class)"
  />
</template>
