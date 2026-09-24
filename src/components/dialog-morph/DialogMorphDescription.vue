<script setup lang="ts">
import { DialogDescription } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogDescription :class="cn('mt-2 text-sm text-fg-secondary', props.class)">
    <slot />
  </DialogDescription>
</template>
