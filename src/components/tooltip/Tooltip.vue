<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { Passthrough } from '../../utils/Passthrough'
import { cn } from '../../utils/cn'
import { TOOLTIP_DELAY, useInTooltipGroup } from './tooltip.context'
import { tooltipContentClass } from './tooltip.variants'

/**
 * A short label for its trigger, shown on hover and keyboard focus. The trigger is the default
 * slot, rendered as is (Reka UI's `as-child`), so any button or link keeps its own element.
 */
const props = withDefaults(
  defineProps<{
    /** The text; use the `content` slot for anything richer. */
    content?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    /** Hides the tooltip without changing the markup, as a folded sidebar's labels need. */
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { side: 'top' },
)

// On its own, a tooltip brings its own provider; inside a TooltipGroup it shares the group's.
const grouped = useInTooltipGroup()
const Wrapper = grouped ? Passthrough : TooltipProvider
</script>

<template>
  <component :is="Wrapper">
    <TooltipRoot :disabled="disabled" :delay-duration="grouped ? undefined : TOOLTIP_DELAY">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent :side="side" :side-offset="6" :collision-padding="8" :class="cn(tooltipContentClass, props.class)">
          <slot name="content">{{ content }}</slot>
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </component>
</template>
