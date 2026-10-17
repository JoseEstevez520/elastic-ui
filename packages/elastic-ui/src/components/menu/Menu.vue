<script setup lang="ts">
import { DropdownMenuRoot, useForwardPropsEmits, type DropdownMenuRootEmits, type DropdownMenuRootProps } from 'reka-ui'

/**
 * A list of actions that appears from its trigger, like a Popover. Behavior and accessibility
 * (arrow keys, typeahead, submenus, focus, Escape) come from Reka UI.
 */
const props = defineProps<DropdownMenuRootProps>()
const emits = defineEmits<DropdownMenuRootEmits>()

// Forwards only the props the parent actually passed, so an absent `open` stays uncontrolled.
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DropdownMenuRoot>
</template>
