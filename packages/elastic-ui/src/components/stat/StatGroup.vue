<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/** Several Stats in a row, parted by space rather than boxes; wraps to the next line on a phone. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('flex flex-wrap gap-x-8 gap-y-4', props.class)">
    <slot />
  </div>
</template>
