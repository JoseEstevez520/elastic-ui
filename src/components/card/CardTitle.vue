<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useCardContext } from './card.context'
import { cardTitleVariants } from './card.variants'

const props = withDefaults(
  defineProps<{
    /** Heading level, so the card fits the page's outline. */
    as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    class?: HTMLAttributes['class']
  }>(),
  { as: 'h3' },
)
const { size } = useCardContext()
</script>

<template>
  <component :is="as" :class="cn(cardTitleVariants({ size }), props.class)">
    <slot />
  </component>
</template>
