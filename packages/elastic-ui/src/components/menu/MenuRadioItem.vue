<script setup lang="ts">
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
  useForwardPropsEmits,
  type DropdownMenuRadioItemEmits,
  type DropdownMenuRadioItemProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { menuChoiceItemClass, menuIndicatorClass } from './menu.variants'

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DropdownMenuRadioItemEmits>()
const forwarded = useForwardPropsEmits(useDelegatedProps(props), emits)
</script>

<template>
  <DropdownMenuRadioItem v-bind="forwarded" :class="cn(menuChoiceItemClass, props.class)">
    <DropdownMenuItemIndicator :class="menuIndicatorClass">
      <span class="size-1.5 rounded-full bg-current" />
    </DropdownMenuItemIndicator>
    <slot />
  </DropdownMenuRadioItem>
</template>
