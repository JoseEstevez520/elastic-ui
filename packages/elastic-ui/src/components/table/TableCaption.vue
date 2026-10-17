<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableCaptionClass } from './table.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <caption :class="cn(tableCaptionClass, props.class)">
    <slot />
  </caption>
</template>
