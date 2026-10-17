<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import { TabsRoot } from 'reka-ui'
import { toRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideTabsContext } from './tabs.context'
import type { TabsVariant } from './tabs.variants'
import { useReducedMotion } from '../../utils/motion'

// The app's motion preference (setMotionPreference), not only the system's.
const reducedMotion = useReducedMotion()

/**
 * Tabs whose indicator stretches over to the active tab instead of jumping (see TabsList).
 * Behavior and accessibility (arrow keys, Home/End, ARIA) come from Reka UI.
 */
const props = defineProps<{
  defaultValue?: string
  variant?: TabsVariant
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string>()
if (value.value === undefined) value.value = props.defaultValue

provideTabsContext({ value, variant: toRef(() => props.variant ?? 'underline') })
</script>

<template>
  <MotionConfig :reduced-motion="reducedMotion">
    <TabsRoot v-model="value" :class="cn('flex flex-col gap-4', props.class)">
      <slot />
    </TabsRoot>
  </MotionConfig>
</template>
