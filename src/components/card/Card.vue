<script setup lang="ts">
import { toRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideCardContext } from './card.context'
import { cardVariants, type CardVariants } from './card.variants'

const props = defineProps<{
  variant?: CardVariants['variant']
  size?: CardVariants['size']
  class?: HTMLAttributes['class']
}>()

provideCardContext({ size: toRef(() => props.size ?? 'md') })
</script>

<template>
  <div :class="cn(cardVariants({ variant, size }), props.class)">
    <slot />
  </div>
</template>
