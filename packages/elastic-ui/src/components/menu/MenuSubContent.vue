<script setup lang="ts">
import {
  DropdownMenuPortal,
  DropdownMenuSubContent,
  useForwardPropsEmits,
  type DropdownMenuSubContentEmits,
  type DropdownMenuSubContentProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { floatingPanelClass } from '../popover/popover.variants'
import { menuContentClass, menuListClass } from './menu.variants'

defineOptions({ inheritAttrs: false })

// Beside its trigger, lined up with the list it came from: the offset makes up for the list's
// own padding, so the first items of both sit on one line.
const props = withDefaults(defineProps<DropdownMenuSubContentProps & { class?: HTMLAttributes['class'] }>(), {
  sideOffset: 4,
  alignOffset: -4,
  collisionPadding: 16,
})
const emits = defineEmits<DropdownMenuSubContentEmits>()
const forwarded = useForwardPropsEmits(useDelegatedProps(props), emits)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuSubContent
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(floatingPanelClass, menuContentClass, props.class)"
    >
      <div :class="menuListClass">
        <slot />
      </div>
    </DropdownMenuSubContent>
  </DropdownMenuPortal>
</template>
