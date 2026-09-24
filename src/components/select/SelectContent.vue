<script setup lang="ts">
import {
  SelectContent,
  SelectPortal,
  SelectViewport,
  useForwardPropsEmits,
  type SelectContentEmits,
  type SelectContentProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { floatingPanelClass } from '../popover/popover.variants'
import { selectContentClass } from './select.variants'

defineOptions({ inheritAttrs: false })

// Placed below the trigger like a Popover, rather than over it where the chosen option lines up
// with the trigger (Reka UI's `item-aligned`), so it can appear from the trigger the same way.
const props = withDefaults(
  defineProps<Omit<SelectContentProps, 'position'> & { class?: HTMLAttributes['class'] }>(),
  { sideOffset: 6, collisionPadding: 16 },
)
const emits = defineEmits<SelectContentEmits>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="{ ...forwarded, ...$attrs }"
      position="popper"
      :class="cn(floatingPanelClass, selectContentClass, props.class)"
    >
      <!-- Options come into focus as one wave from the trigger outwards (see `stagger-items`). A
           list long enough to scroll opens on the chosen option, maybe mid-list, where a wave
           counted from the first option would land all at once; there the panel's fade is enough. -->
      <SelectViewport class="p-1 stagger-items [--stagger-delay:0.05s] [&:has(>:nth-child(9))>*]:animate-none">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
