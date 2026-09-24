<script setup lang="ts">
import { SelectRoot, useForwardPropsEmits, type SelectRootEmits, type SelectRootProps } from 'reka-ui'

/**
 * Picks one option (or several, with `multiple`) from a list that appears from its trigger, like
 * a Popover. Behavior and accessibility (arrow keys, typeahead, ARIA, a native select for forms)
 * come from Reka UI.
 */
const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

// Forwards only the props the parent actually passed, so an absent `modelValue` stays uncontrolled.
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </SelectRoot>
</template>
