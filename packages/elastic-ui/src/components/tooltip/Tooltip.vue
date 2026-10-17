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
    /** Stays open when its trigger is pressed, for a trigger whose label follows what it does. */
    persistent?: boolean
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
    <TooltipRoot :disabled="disabled" :disable-closing-trigger="persistent || undefined" :delay-duration="grouped ? undefined : TOOLTIP_DELAY">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <!-- Its text is also what screen readers are told, kept in step as it changes (Reka UI reads
             the content's text only once). -->
        <TooltipContent :aria-label="content" :side="side" :side-offset="6" :collision-padding="8" :class="cn(tooltipContentClass, props.class)">
          <slot name="content">{{ content }}</slot>
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </component>
</template>
