<script setup lang="ts">
import { TooltipProvider } from 'reka-ui'
import { provideTooltipGroup, TOOLTIP_DELAY } from './tooltip.context'

/**
 * Tooltips that belong together, like the icons of a toolbar or a folded sidebar: once one has
 * shown, moving to the next shows it at once instead of waiting again.
 */
withDefaults(defineProps<{ delay?: number }>(), { delay: TOOLTIP_DELAY })
provideTooltipGroup()
</script>

<template>
  <TooltipProvider :delay-duration="delay" :skip-delay-duration="300">
    <slot />
  </TooltipProvider>
</template>
