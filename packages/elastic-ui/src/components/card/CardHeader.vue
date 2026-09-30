<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useCardContext } from './card.context'
import { cardSectionVariants } from './card.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const { size } = useCardContext()
</script>

<template>
  <div :class="cn('flex flex-col gap-1.5', cardSectionVariants({ size }), props.class)">
    <slot />
  </div>
</template>
