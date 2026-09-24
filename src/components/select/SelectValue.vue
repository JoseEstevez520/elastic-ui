<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'reka-ui'

/** The chosen option's text, or `placeholder` until there is one. */
const props = defineProps<SelectValueProps>()
</script>

<template>
  <SelectValue v-bind="props" class="truncate">
    <slot />
  </SelectValue>
</template>
