<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideDiagramContext, useDiagramContext, type DiagramLayout } from './diagram.context'
import { diagramAreaPartsVariants, diagramPartAcross } from './diagram.variants'

/**
 * A concept that holds others, drawn as a larger tint (`diagram-area`) with its title on top: the
 * harness round a model, the client with its browser and Postman. Its parts (DiagramChip,
 * DiagramItem, DiagramArrow) go in the default slot, in a column, a wrapping row or a grid, and an
 * optional line under them says what it does. Its colour is `--diagram-color`, or `color`.
 * An area holds no other area: a box inside a box reads as two things.
 */
const props = withDefaults(
  defineProps<{
    /** Its name; the `title` slot takes richer markup, such as a quieter aside after it. */
    title?: string
    /** Shown before the title. */
    icon?: Component
    /** One short line under its parts. */
    note?: string
    /** Any CSS colour, the same for the same concept on every page. */
    color?: string
    /** How its parts sit. */
    layout?: DiagramLayout
    class?: HTMLAttributes['class']
  }>(),
  { layout: 'column' },
)

const outer = useDiagramContext()
provideDiagramContext({
  direction: computed(() => (props.layout === 'row' ? 'across' : 'down')),
  inArea: true,
})
</script>

<template>
  <div
    :class="
      cn(
        'diagram-area diagram-in gap-2',
        outer && diagramPartAcross({ direction: outer.direction.value ?? 'unknown' }),
        props.class,
      )
    "
    :style="color ? { '--diagram-color': color } : undefined"
  >
    <span v-if="title || $slots.title || icon" class="flex items-center gap-1.5 text-label font-semibold">
      <component :is="icon" v-if="icon" class="size-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
      <slot name="title">{{ title }}</slot>
    </span>
    <div v-if="$slots.default" :class="diagramAreaPartsVariants({ layout })"><slot /></div>
    <p v-if="note" class="text-ui text-fg-secondary">{{ note }}</p>
  </div>
</template>
