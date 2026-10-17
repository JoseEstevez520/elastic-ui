<script setup lang="ts">
import { DialogTitle } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/** Names the dialog for assistive technology; every DialogMorph needs one. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogTitle :class="cn('text-title text-fg', props.class)">
    <slot />
  </DialogTitle>
</template>
