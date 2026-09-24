<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'reka-ui'

/** The chosen option's text, or `placeholder` until there is one. */
const props = defineProps<SelectValueProps>()
</script>

<template>
  <!-- `min-w-0` lets it shrink inside the trigger's flex row, so a long label truncates. -->
  <SelectValue v-bind="props" class="min-w-0 truncate">
    <slot />
  </SelectValue>
</template>
