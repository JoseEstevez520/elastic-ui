<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/** A conversation: a ChatThread of ChatMessages over a ChatComposer, filling its height. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('flex min-h-0 flex-col', props.class)">
    <slot />
  </div>
</template>
