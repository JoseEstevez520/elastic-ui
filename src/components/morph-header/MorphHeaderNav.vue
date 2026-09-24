<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useMorphHeaderPlacement } from './morph-header.context'

const props = withDefaults(
  defineProps<{
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { label: 'Main' },
)
const placement = useMorphHeaderPlacement()
</script>

<template>
  <nav
    :aria-label="label"
    :class="
      cn(
        // In the panel the links come into focus as one wave, once the panel has nearly grown.
        placement === 'panel' ? 'flex w-full flex-col stagger-items [--stagger-delay:0.15s]' : 'flex items-center gap-5',
        props.class,
      )
    "
  >
    <slot />
  </nav>
</template>
