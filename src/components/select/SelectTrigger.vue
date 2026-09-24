<script setup lang="ts">
import { SelectTrigger, type SelectTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import { selectTriggerClass } from './select.variants'

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegated = useDelegatedProps(props)
</script>

<template>
  <SelectTrigger v-bind="delegated" :class="cn(selectTriggerClass, props.class)">
    <slot />
    <DisclosureChevron />
  </SelectTrigger>
</template>
