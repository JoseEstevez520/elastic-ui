<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { tableClass } from './table.variants'

/**
 * A plain table for data (Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
 * TableCaption): no sorting or filtering of its own, only the markup, quiet. Too wide for its
 * room, as on a phone, it scrolls sideways and fades at the side that has more, as CodeBlock
 * does, never cutting a column in half at a hard edge.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()

// Which sides have columns scrolled out of sight, to fade them.
const scroller = useTemplateRef<HTMLElement>('scroller')
const hidden = ref({ start: false, end: false })
function measure() {
  const el = scroller.value
  if (!el) return
  hidden.value = { start: el.scrollLeft > 1, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 }
}
let observer: ResizeObserver | undefined
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (scroller.value) {
    observer.observe(scroller.value)
    if (scroller.value.firstElementChild) observer.observe(scroller.value.firstElementChild)
  }
})
onBeforeUnmount(() => observer?.disconnect())

const FADE = '24px'
const mask = computed(() => {
  const { start, end } = hidden.value
  if (!start && !end) return undefined
  const from = start ? `transparent, #000 ${FADE}` : '#000'
  const to = end ? `#000 calc(100% - ${FADE}), transparent` : '#000'
  return { maskImage: `linear-gradient(to right, ${from}, ${to})` }
})
</script>

<template>
  <div
    ref="scroller"
    class="w-full overflow-x-auto overscroll-x-contain scrollbar-subtle"
    :style="mask"
    @scroll="measure"
  >
    <table :class="cn(tableClass, props.class)">
      <slot />
    </table>
  </div>
</template>
