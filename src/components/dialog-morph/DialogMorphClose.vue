<script setup lang="ts">
import { DialogClose, type DialogCloseProps } from 'reka-ui'

/** Unstyled; use `as-child` to make a Button close the dialog. */
const props = defineProps<DialogCloseProps>()
</script>

<template>
  <DialogClose v-bind="props">
    <slot />
  </DialogClose>
</template>
