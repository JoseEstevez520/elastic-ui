<script setup lang="ts">
import { SelectLabel } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <SelectLabel :class="cn('px-2.5 pt-2 pb-1 text-xs font-medium text-fg-muted', props.class)">
    <slot />
  </SelectLabel>
</template>
