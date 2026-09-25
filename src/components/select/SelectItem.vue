<script setup lang="ts">
import { SelectItem, SelectItemIndicator, SelectItemText, type SelectItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { CheckIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { selectItemClass } from './select.variants'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegated = useDelegatedProps(props)
</script>

<template>
  <SelectItem v-bind="delegated" :class="cn(selectItemClass, props.class)">
    <SelectItemIndicator class="absolute left-2.5 flex items-center">
      <CheckIcon aria-hidden="true" stroke-width="2.5" class="size-3.5" />
    </SelectItemIndicator>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
