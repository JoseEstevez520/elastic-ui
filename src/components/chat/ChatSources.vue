<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * What a step found: its ChatSources as lines hanging from the step on a fine thread, coming into
 * focus one after another.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <!-- The wave plays each time the step opens around it. -->
  <ul :class="cn('ml-[7px] flex flex-col gap-1 border-l border-[color:var(--chat-line,color-mix(in_oklab,var(--color-fg)_12%,transparent))] pl-4 [[data-state=open]>*>&]:stagger-items', props.class)">
    <slot />
  </ul>
</template>
