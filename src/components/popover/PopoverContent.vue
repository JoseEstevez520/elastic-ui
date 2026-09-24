<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  useForwardPropsEmits,
  type PopoverContentEmits,
  type PopoverContentProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { floatingPanelClass, popoverContentClass } from './popover.variants'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>(), {
  sideOffset: 8,
  // Keeps the panel off the screen's edges on a phone.
  collisionPadding: 16,
})
const emits = defineEmits<PopoverContentEmits>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(floatingPanelClass, popoverContentClass, props.class)"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
