<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideDiagramContext, useDiagramContext, type DiagramDirection, type DiagramLayout } from './diagram.context'
import { diagramGroupVariants, diagramPartAcross } from './diagram.variants'

/**
 * Lays out a diagram's parts (DiagramArea, DiagramChip, DiagramArrow, or other groups) in a row, a
 * column or a grid, with no tint of its own. A row that no longer fits its room runs down instead,
 * as on a phone, and its arrows turn with it: measured from its parts, not from a breakpoint, so
 * it holds in a narrow column and for longer labels in another language.
 */
const props = withDefaults(
  defineProps<{
    layout?: DiagramLayout
    class?: HTMLAttributes['class']
  }>(),
  { layout: 'row' },
)

const root = useTemplateRef<HTMLElement>('root')
// Undefined until measured, and in server rendering.
const stacked = ref<boolean>()
// The width the row needed when it last ran out of room, to know when it fits again.
let needed = 0
let observer: ResizeObserver | undefined

function measure() {
  const el = root.value
  if (!el || props.layout !== 'row') return
  for (const child of el.children) observer?.observe(child)
  if (stacked.value) {
    // Back across once there is the room it needed; if its parts have grown since, the next
    // measure finds it short again and it runs down once more.
    if (el.clientWidth >= needed) stacked.value = false
  } else {
    // Short of room when the row runs past its edge, or a part runs past its own (a long chip
    // in an area squeezed to its narrowest).
    let excess = el.scrollWidth - el.clientWidth
    for (const child of el.children) excess = Math.max(excess, child.scrollWidth - child.clientWidth)
    if (excess > 1) {
      needed = el.clientWidth + excess
      stacked.value = true
    }
  }
}

onMounted(async () => {
  if (props.layout !== 'row') return
  observer = new ResizeObserver(measure)
  observer.observe(root.value!)
  // Measured across, before the first paint, so a phone never sees the row.
  stacked.value = false
  await nextTick()
  measure()
})
// Parts added or changed (a diagram streaming in) may no longer fit.
onUpdated(measure)
onBeforeUnmount(() => observer?.disconnect())

const direction = computed<DiagramDirection>(() => {
  if (props.layout !== 'row') return 'down'
  return stacked.value === undefined ? undefined : stacked.value ? 'down' : 'across'
})
const outer = useDiagramContext()
provideDiagramContext({ direction, inArea: false })
</script>

<template>
  <div
    ref="root"
    :class="
      cn(
        diagramGroupVariants({ layout, stacked: stacked === undefined ? 'unknown' : stacked }),
        outer && diagramPartAcross({ direction: outer.direction.value ?? 'unknown' }),
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
