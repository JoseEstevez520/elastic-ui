<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { chatThreadLineClass } from './chat.variants'

/**
 * A few words a step holds instead of sources, such as what went wrong when it failed. Hangs from
 * the same fine thread as ChatSources, and comes into focus each time the step opens around it.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <p
    :class="
      cn(
        chatThreadLineClass,
        'text-sm leading-relaxed text-fg-muted',
        '[[data-state=open]>*>&]:animate-[blur-in_0.45s_var(--ease-soft)_both] motion-reduce:animate-none',
        props.class,
      )
    "
  >
    <slot />
  </p>
</template>
