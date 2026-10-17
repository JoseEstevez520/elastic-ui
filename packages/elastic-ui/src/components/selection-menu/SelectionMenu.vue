<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useTemplateRef, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { expandToWords, lines, type Line } from './selection'
import { provideSelectionMenu } from './selection-menu.context'
import { selectionBandClass, selectionBarClass } from './selection-menu.variants'

/**
 * Text you can select to act on. Selecting (with the pointer, or Shift and the arrows) snaps to
 * whole words and paints the selection as one rounded band per line, as in Curio, with a bar of
 * actions above it. Put the text in the default slot and SelectionMenuItems in `actions`.
 *
 * The native selection is let go once taken, so only one band shows; a Copy action covers what
 * it was for.
 */
const props = defineProps<{ label?: string; class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{ select: [text: string] }>()

const root = useTemplateRef<HTMLElement>('root')
const bar = useTemplateRef<HTMLElement>('bar')
const range = shallowRef<Range>()
const text = computed(() => range.value?.toString().trim() ?? '')
const bands = ref<Line[]>([])
const place = ref<{ left: number; top: number }>()

// The band sits a little past the text on every side.
const PAD_X = 4
const PAD_Y = 2
// Room kept between the bar and the text, and from the screen's edges.
const GAP = 8
const EDGE = 12

function clear() {
  range.value = undefined
  bands.value = []
  place.value = undefined
}
provideSelectionMenu({ text, clear })

function take() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.rangeCount) return
  const live = selection.getRangeAt(0)
  if (!root.value?.contains(live.commonAncestorContainer)) return
  const taken = live.cloneRange()
  expandToWords(taken)
  if (!taken.toString().trim()) return
  selection.removeAllRanges()
  range.value = taken
  emit('select', taken.toString().trim())
  measure()
}

// Over the selection, centred on it and kept on screen; below it when there is no room above.
async function measure() {
  if (!range.value) return
  bands.value = lines(range.value)
  await nextTick()
  const box = range.value.getBoundingClientRect()
  const size = bar.value?.getBoundingClientRect()
  if (!size) return
  const left = Math.min(Math.max(box.left + box.width / 2 - size.width / 2, EDGE), window.innerWidth - size.width - EDGE)
  const above = box.top - PAD_Y - GAP - size.height
  place.value = { left, top: above >= EDGE ? above : box.bottom + PAD_Y + GAP }
}

// Follows the text as the page or anything inside it scrolls, and as the window resizes.
let frame = 0
const follow = () => {
  if (range.value && !frame) frame = requestAnimationFrame(() => ((frame = 0), measure()))
}
useEventListener(() => window, 'scroll', follow, { capture: true, passive: true })
useEventListener(() => window, 'resize', follow, { passive: true })
onBeforeUnmount(() => cancelAnimationFrame(frame))

useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (event.key === 'Escape' && range.value) clear()
})
// A press anywhere but the bar lets go; one in the text may be starting a new selection.
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (range.value && !(event.target instanceof Node && bar.value?.contains(event.target))) clear()
})

// With the keyboard, a selection is made with Shift and the arrows, and is done once Shift is let
// go; taking it at each arrow would drop the native selection before it could grow.
function onKeyup(event: KeyboardEvent) {
  if (event.key === 'Shift') take()
}
</script>

<template>
  <div ref="root" :aria-label="label" :class="cn('relative', props.class)" @pointerup="take" @keyup="onKeyup">
    <slot />
  </div>

  <Teleport to="body">
    <template v-if="range">
      <span
        v-for="(line, i) in bands"
        :key="i"
        aria-hidden="true"
        :class="selectionBandClass"
        :style="{
          left: `${line.left - PAD_X}px`,
          top: `${line.top - PAD_Y}px`,
          width: `${line.right - line.left + PAD_X * 2}px`,
          height: `${line.bottom - line.top + PAD_Y * 2}px`,
        }"
      />
      <!-- Hidden until placed, so it never shows at the corner of the screen first. -->
      <div
        ref="bar"
        role="toolbar"
        :aria-label="`Actions for “${text}”`"
        :class="selectionBarClass"
        :style="place ? { left: `${place.left}px`, top: `${place.top}px`, transformOrigin: 'bottom center' } : { visibility: 'hidden' }"
      >
        <slot name="actions" :text="text" :clear="clear" />
      </div>
    </template>
  </Teleport>
</template>
