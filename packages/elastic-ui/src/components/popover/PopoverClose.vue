<script setup lang="ts">
import { PopoverClose, type PopoverCloseProps } from 'reka-ui'

/** Unstyled; use `as-child` to make a Button close the popover. */
const props = defineProps<PopoverCloseProps>()
</script>

<template>
  <PopoverClose v-bind="props">
    <slot />
  </PopoverClose>
</template>
