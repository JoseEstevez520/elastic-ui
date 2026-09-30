<script setup lang="ts">
import { PopoverRoot, useForwardPropsEmits, type PopoverRootEmits, type PopoverRootProps } from 'reka-ui'

/**
 * A panel that appears from its trigger. Behavior and accessibility
 * (focus, Escape, click outside, positioning) come from Reka UI.
 */
const props = defineProps<PopoverRootProps>()
const emits = defineEmits<PopoverRootEmits>()

// Forwards only the props the parent actually passed, so an absent `open` stays uncontrolled.
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <PopoverRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </PopoverRoot>
</template>
