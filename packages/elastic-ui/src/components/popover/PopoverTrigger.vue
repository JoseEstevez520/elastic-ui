<script setup lang="ts">
import { PopoverTrigger, type PopoverTriggerProps } from 'reka-ui'

/** Unstyled; use `as-child` to make a Button the trigger. */
const props = defineProps<PopoverTriggerProps>()
</script>

<template>
  <PopoverTrigger v-bind="props">
    <slot />
  </PopoverTrigger>
</template>
