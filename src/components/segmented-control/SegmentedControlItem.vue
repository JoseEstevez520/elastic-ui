<script setup lang="ts">
import { RadioGroupItem, injectRadioGroupRootContext } from 'reka-ui'
import { computed, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { segmentedControlItemVariants } from './segmented-control.variants'

const props = defineProps<{
  value: string
  icon?: Component
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const group = injectRadioGroupRootContext()
const checked = computed(() => group.modelValue?.value === props.value)
</script>

<template>
  <RadioGroupItem :value="value" :disabled="disabled" :class="cn(segmentedControlItemVariants({ checked }), props.class)">
    <component :is="icon" v-if="icon" aria-hidden="true" class="size-4" />
    <slot />
  </RadioGroupItem>
</template>
