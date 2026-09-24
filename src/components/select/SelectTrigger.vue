<script setup lang="ts">
import { SelectTrigger, type SelectTriggerProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import { selectTriggerClass } from './select.variants'

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <SelectTrigger v-bind="delegated" :class="cn(selectTriggerClass, props.class)">
    <slot />
    <DisclosureChevron />
  </SelectTrigger>
</template>
