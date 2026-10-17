<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableBodyClass } from './table.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <tbody :class="cn(tableBodyClass, props.class)">
    <slot />
  </tbody>
</template>
