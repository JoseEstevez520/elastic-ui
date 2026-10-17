<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableHeaderClass } from './table.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <thead :class="cn(tableHeaderClass, props.class)">
    <slot />
  </thead>
</template>
