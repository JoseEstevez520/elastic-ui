<script setup lang="ts">
import { SelectTrigger, type SelectTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import { selectTriggerClass } from './select.variants'

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegated = useDelegatedProps(props)
// In a Field: its id, what describes it, and whether it is invalid.
const fieldAttrs = useFieldControl(() => undefined)
</script>

<template>
  <SelectTrigger v-bind="{ ...fieldAttrs, ...delegated }" :class="cn(selectTriggerClass, props.class)">
    <slot />
    <DisclosureChevron />
  </SelectTrigger>
</template>
