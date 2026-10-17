<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableRowVariants } from './table.variants'

const props = defineProps<{
  /** The row does something when pressed (opens its item): it takes a tone under the pointer. */
  interactive?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr :class="cn(tableRowVariants({ interactive }), props.class)">
    <slot />
  </tr>
</template>
