<script setup lang="ts">
import { AccordionItem } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <AccordionItem :value="value" :disabled="disabled" :class="cn('border-b border-border', props.class)">
    <slot />
  </AccordionItem>
</template>
