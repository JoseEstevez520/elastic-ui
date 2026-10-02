<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A row of technologies, each its logo and its name (LogoListItem), to name a stack without
 * spending text. It wraps onto more lines as it needs.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ul :class="cn('flex flex-wrap gap-2', props.class)">
    <slot />
  </ul>
</template>
