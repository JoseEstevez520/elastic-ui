<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A scrollbar reduced to a short line, as iOS's scroll indicator but always the same length: 5px
 * wide, growing a little under the pointer, it slides down the edge as you go, however long the
 * page. Hidden at rest, it shows for a moment when it first appears, so you know there is more
 * (as Apple's scroll indicators flash when a view appears), then while you scroll and while the
 * pointer is near the edge, fading soon after; it can be dragged. Call `flash()` when the content
 * changes, such as on a new page. The native scrollbar, whose
 * length the browser sets, is hidden while it is there.
 *
 * On its own it follows the page. For something that scrolls inside the page, put it beside that
 * element in a positioned box and pass the element as `target`.
 */
const props = withDefaults(
  defineProps<{
    /** What scrolls, when it is not the page: an element, or a selector for it. */
    target?: HTMLElement | string
    /** The line's length, in pixels. */
    length?: number
    /** Room kept clear at each end of the edge, in pixels: where the text starts and ends. */
    inset?: number
    /** Show for a moment when it first appears. */
    flashOnMount?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { length: 40, inset: 8, flashOnMount: true },
)

// How long it stays after the last scroll.
const LINGER = 900

let el: HTMLElement | null = null
const page = () => !el
const scroller = () => el ?? document.documentElement

const progress = ref(0)
const scrollable = ref(false)
const track = ref(0)
const scrolling = ref(false)
const near = ref(false)
const dragging = ref(false)

function measure() {
  const s = scroller()
  const max = s.scrollHeight - s.clientHeight
  scrollable.value = max > 1
  progress.value = max > 0 ? s.scrollTop / max : 0
  track.value = (page() ? window.innerHeight : s.clientHeight) - props.inset * 2
}

let linger: ReturnType<typeof setTimeout> | undefined
function show(ms: number) {
  scrolling.value = true
  clearTimeout(linger)
  linger = setTimeout(() => (scrolling.value = false), ms)
}
function onScroll() {
  measure()
  show(LINGER)
}

// A flash is held a little longer than after a scroll: nothing moved to draw the eye to it.
const FLASH = 1400
/** Shows the line for a moment, to say there is more to scroll. */
function flash() {
  measure()
  if (scrollable.value) show(FLASH)
}
defineExpose({ flash })

// Near the edge: the last few pixels of what scrolls, where a scrollbar would be.
const EDGE = 16
function onPointerMove(event: PointerEvent) {
  const box = page() ? { right: window.innerWidth, top: 0, bottom: window.innerHeight } : scroller().getBoundingClientRect()
  near.value = event.clientX >= box.right - EDGE && event.clientY >= box.top && event.clientY <= box.bottom
}

// Dragging the line scrolls in proportion, as a scrollbar's thumb does.
let from = { y: 0, top: 0 }
function onDown(event: PointerEvent) {
  dragging.value = true
  from = { y: event.clientY, top: scroller().scrollTop }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function onDrag(event: PointerEvent) {
  if (!dragging.value) return
  const s = scroller()
  const room = track.value - props.length
  if (room <= 0) return
  s.scrollTop = from.top + ((event.clientY - from.y) / room) * (s.scrollHeight - s.clientHeight)
}

let observer: ResizeObserver | undefined
onMounted(() => {
  el = typeof props.target === 'string' ? document.querySelector(props.target) : (props.target ?? null)
  const s = scroller()
  s.classList.add('scrollbar-none')
  ;(page() ? window : s).addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', measure)
  observer = new ResizeObserver(measure)
  observer.observe(page() ? document.body : s)
  measure()
  if (props.flashOnMount) requestAnimationFrame(flash)
})
onBeforeUnmount(() => {
  const s = scroller()
  s.classList.remove('scrollbar-none')
  ;(page() ? window : s).removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('resize', measure)
  observer?.disconnect()
  clearTimeout(linger)
})

const shown = computed(() => scrollable.value && (scrolling.value || near.value || dragging.value))
const top = computed(() => props.inset + progress.value * Math.max(0, track.value - props.length))
</script>

<template>
  <!-- The native scrollbar still does the work for the keyboard and assistive technology; this
       only draws where you are. -->
  <div
    aria-hidden="true"
    :class="
      cn(
        'pointer-events-none top-0 right-0 z-50 h-full w-4',
        target ? 'absolute' : 'fixed h-dvh',
        props.class,
      )
    "
  >
    <div
      :class="[
        'pointer-events-auto absolute right-1.5 w-[5px] cursor-grab touch-none rounded-full hover:w-[7px] hover:right-[5px] transition-[opacity,background-color,width,right] duration-300 ease-soft motion-reduce:transition-none',
        dragging
          ? 'cursor-grabbing bg-[color:color-mix(in_oklab,var(--color-fg)_40%,transparent)]'
          : 'bg-[color:var(--scroll-indicator,color-mix(in_oklab,var(--color-fg)_22%,transparent))] hover:bg-[color:color-mix(in_oklab,var(--color-fg)_40%,transparent)]',
        shown ? 'opacity-100' : 'pointer-events-none opacity-0',
      ]"
      :style="{ height: `${length}px`, translate: `0 ${top}px` }"
      @pointerdown="onDown"
      @pointermove="onDrag"
      @pointerup="dragging = false"
      @pointercancel="dragging = false"
    />
  </div>
</template>
