<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  useForwardPropsEmits,
  type PopoverContentEmits,
  type PopoverContentProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { floatingPanelClass, popoverContentClass, popoverFluidClass } from './popover.variants'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<
    PopoverContentProps & {
      /** On a phone, the panel fills the screen's width, less its margin on each side. */
      fluid?: boolean
      class?: HTMLAttributes['class']
    }
  >(),
  {
    sideOffset: 8,
    // Keeps the panel off the screen's edges on a phone.
    collisionPadding: 16,
  },
)
const emits = defineEmits<PopoverContentEmits>()

const delegated = useDelegatedProps(props, 'fluid')
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(floatingPanelClass, popoverContentClass, fluid && popoverFluidClass, props.class)"
    >
      <!-- Its own element: the wave animates the content, and on the panel it would replace the
           panel's own entrance. Comes in as the panel appears, as Select's options do. -->
      <div class="stagger-children [--stagger-delay:0.05s]">
        <slot />
      </div>
    </PopoverContent>
  </PopoverPortal>
</template>
