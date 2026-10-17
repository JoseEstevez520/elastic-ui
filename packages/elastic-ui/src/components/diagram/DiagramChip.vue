<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDiagramContext } from './diagram.context'

/**
 * A part of a diagram, as a soft tint of its colour with its name in it (`diagram-chip`): a step,
 * a tool, a model. An optional icon goes before the name and a quieter note after it. Its colour
 * is `--diagram-color`, set on it or on what holds it, or `color`. In a group it keeps its own
 * width; in an area it stretches to the area's.
 */
const props = defineProps<{
  icon?: Component
  /** A quieter word or two after the name. */
  note?: string
  /** Any CSS colour, the same for the same concept on every page. */
  color?: string
  class?: HTMLAttributes['class']
}>()

const context = useDiagramContext()
</script>

<template>
  <span
    :class="
      cn(
        'diagram-chip diagram-in max-w-full [overflow-wrap:break-word]',
        context && !context.inArea && 'shrink-0 self-center',
        props.class,
      )
    "
    :style="color ? { '--diagram-color': color } : undefined"
  >
    <component :is="icon" v-if="icon" class="size-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
    <slot />
    <span v-if="note" class="font-normal text-fg-secondary">· {{ note }}</span>
  </span>
</template>
