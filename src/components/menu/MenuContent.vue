<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  useForwardPropsEmits,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { floatingPanelClass } from '../popover/popover.variants'
import { menuContentClass, menuListClass } from './menu.variants'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>(), {
  sideOffset: 6,
  align: 'start',
  // Keeps the menu off the screen's edges on a phone.
  collisionPadding: 16,
})
const emits = defineEmits<DropdownMenuContentEmits>()
const forwarded = useForwardPropsEmits(useDelegatedProps(props), emits)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(floatingPanelClass, menuContentClass, props.class)"
    >
      <!-- Its own element, so the wave can tell which way the menu opened (see `stagger-items`). -->
      <div :class="menuListClass">
        <slot />
      </div>
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
