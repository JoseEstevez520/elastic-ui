<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableHeadVariants } from './table.variants'

const props = defineProps<{
  /** A figure: right-aligned, in digits of one width, so a column of them lines up. */
  numeric?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <th scope="col" :class="cn(tableHeadVariants({ numeric }), props.class)"><slot /></th>
</template>
