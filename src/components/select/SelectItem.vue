<script setup lang="ts">
import { SelectItem, SelectItemIndicator, SelectItemText, type SelectItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { selectItemClass } from './select.variants'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegated = useDelegatedProps(props)
</script>

<template>
  <SelectItem v-bind="delegated" :class="cn(selectItemClass, props.class)">
    <SelectItemIndicator class="absolute left-2.5 flex items-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="size-3.5">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </SelectItemIndicator>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
