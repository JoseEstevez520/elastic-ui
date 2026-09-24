<script setup lang="ts">
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  useForwardPropsEmits,
  type DropdownMenuCheckboxItemEmits,
  type DropdownMenuCheckboxItemProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import MenuCheck from './MenuCheck.vue'
import { menuChoiceItemClass, menuIndicatorClass } from './menu.variants'

/** An option that is on or off; bind it with `v-model`. */
const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DropdownMenuCheckboxItemEmits>()
const forwarded = useForwardPropsEmits(useDelegatedProps(props), emits)
</script>

<template>
  <DropdownMenuCheckboxItem v-bind="forwarded" :class="cn(menuChoiceItemClass, props.class)">
    <DropdownMenuItemIndicator :class="menuIndicatorClass"><MenuCheck /></DropdownMenuItemIndicator>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
