<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useCardContext } from './card.context'
import { cardImageVariants } from './card.variants'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    class?: HTMLAttributes['class']
  }>(),
  { alt: '' },
)
const { size } = useCardContext()
</script>

<template>
  <img :src="src" :alt="alt" :class="cn(cardImageVariants({ size }), props.class)" />
</template>
