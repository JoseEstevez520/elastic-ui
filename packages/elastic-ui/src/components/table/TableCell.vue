<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableCellVariants } from './table.variants'

const props = defineProps<{
  /** A figure: right-aligned, in digits of one width, so a column of them lines up. */
  numeric?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <td :class="cn(tableCellVariants({ numeric }), props.class)"><slot /></td>
</template>
