<script setup lang="ts">
import { SelectGroup, type SelectGroupProps } from 'reka-ui'

/** Options under a SelectLabel. */
const props = defineProps<SelectGroupProps>()
</script>

<template>
  <SelectGroup v-bind="props">
    <slot />
  </SelectGroup>
</template>
