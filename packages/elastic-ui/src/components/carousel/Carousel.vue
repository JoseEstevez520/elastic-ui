<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { bezier, EASE_EMPHASIZED, morphTransition, prefersReducedMotion } from '../../utils/motion'
import { provideCarousel } from './carousel.context'
import { carouselTrackClass, DOT, DOT_GAP, PILL } from './carousel.variants'

/**
 * Slides in a row, one shown at a time: photos of a project, cards, steps of a story. The track
 * moves as one to the slide chosen, on the library's morph ease; dragged or swiped, it follows the
 * finger and settles on the nearest slide, holding back past either end rather than springing.
 * Under it, a dot per slide: the one shown is a slim pill that stretches towards the next dot and
 * catches up with itself, quiet chevrons on either side,
 * fainter at the ends. Arrow keys move it while it has the focus. A photo on a slide can be an
 * ImageView, which opens where it is. ARIA: a region named by `label`, each slide "Slide 2 of 5".
 */
const props = withDefaults(
  defineProps<{
    /** Goes on from the last slide to the first, and back. */
    loop?: boolean
    label?: string
    slideLabel?: string
    ofLabel?: string
    previousLabel?: string
    nextLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    label: labelFor('carousel'),
    slideLabel: labelFor('slide'),
    ofLabel: labelFor('of'),
    previousLabel: labelFor('previous'),
    nextLabel: labelFor('next'),
  },
)
const current = defineModel<number>({ default: 0 })

// The slides register themselves; kept in the order they stand in the track.
const slides = ref<HTMLElement[]>([])
const byPlace = (a: HTMLElement, b: HTMLElement) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
provideCarousel({
  slides,
  register: (el) => (slides.value = [...slides.value, el].sort(byPlace)),
  unregister: (el) => (slides.value = slides.value.filter((s) => s !== el)),
  current,
  slideLabel: props.slideLabel,
  ofLabel: props.ofLabel,
})
const count = computed(() => slides.value.length)
const clamp = (i: number) => Math.min(Math.max(i, 0), Math.max(count.value - 1, 0))

function go(to: number) {
  if (!count.value) return
  current.value = props.loop ? (to + count.value) % count.value : clamp(to)
}
const atStart = computed(() => !props.loop && current.value <= 0)
const atEnd = computed(() => !props.loop && current.value >= count.value - 1)

// The track's place: the chosen slide's left edge, read from the layout, so any slide width and
// gap works. Measured again when the carousel's width changes.
const viewport = useTemplateRef<HTMLElement>('viewport')
const offset = ref(0)
function measure() {
  offset.value = slides.value[clamp(current.value)]?.offsetLeft ?? 0
}
watch([current, count], () => nextTick(measure))
let resize: ResizeObserver | undefined
onMounted(() => {
  measure()
  resize = new ResizeObserver(() => ((settling.value = false), measure()))
  if (viewport.value) resize.observe(viewport.value)
})
onBeforeUnmount(() => resize?.disconnect())

// Dragged: the track follows the pointer at once; past either end it holds back, following at a
// third of the distance. Let go, it settles on the slide it was dragged towards, if dragged a
// fifth of a slide or flicked, else back where it was. A drag is not a click: the click that ends
// it is swallowed, so a photo on the slide does not open.
const drag = ref(0)
const dragging = ref(false)
const settling = ref(true)
let start: { x: number; y: number; time: number; id: number } | undefined
let moved = false
function down(e: PointerEvent) {
  if (e.button !== 0 || count.value < 2) return
  start = { x: e.clientX, y: e.clientY, time: e.timeStamp, id: e.pointerId }
  moved = false
}
function move(e: PointerEvent) {
  if (!start || e.pointerId !== start.id) return
  const dx = e.clientX - start.x
  if (!dragging.value) {
    // Only a sideways drag moves it; a vertical one scrolls the page.
    if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - start.y)) return
    dragging.value = true
    moved = true
    viewport.value?.setPointerCapture(e.pointerId)
  }
  const beyond = (dx > 0 && atStart.value) || (dx < 0 && atEnd.value)
  drag.value = beyond ? dx / 3 : dx
}
function up(e: PointerEvent) {
  if (!start || e.pointerId !== start.id) return
  const width = viewport.value?.clientWidth ?? 1
  const speed = drag.value / Math.max(e.timeStamp - start.time, 1)
  const toward = drag.value < -width / 5 || speed < -0.5 ? 1 : drag.value > width / 5 || speed > 0.5 ? -1 : 0
  start = undefined
  if (!dragging.value) return
  dragging.value = false
  settling.value = true
  drag.value = 0
  if (toward) go(current.value + toward)
}
function swallowClick(e: MouseEvent) {
  if (moved) (e.stopPropagation(), e.preventDefault(), (moved = false))
}

const trackStyle = computed(() => ({
  transform: `translate3d(${-offset.value + drag.value}px, 0, 0)`,
  transition:
    dragging.value || !settling.value || prefersReducedMotion()
      ? 'none'
      : `transform ${morphTransition.duration}s ${bezier(EASE_EMPHASIZED)}`,
}))
// A resize places it at once; the next move eases again.
watch(current, () => (settling.value = true))

function key(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') (e.preventDefault(), go(current.value + 1))
  else if (e.key === 'ArrowLeft') (e.preventDefault(), go(current.value - 1))
}

// The pill: its two ends move one after the other, the leading end first, so it stretches a little
// towards the next dot and then its tail catches up. A plain pill, the dot's own height: no liquid,
// which blurred it into a blob (tried and dropped).
const center = (i: number) => i * (DOT + DOT_GAP) + DOT / 2
const dotsWidth = computed(() => Math.max(count.value, 1) * DOT + Math.max(count.value - 1, 0) * DOT_GAP)
const pill = ref({ left: center(current.value) - PILL / 2, right: center(current.value) + PILL / 2 })
const pillDelays = ref({ left: 0, right: 0 })
watch(current, (to, from) => {
  const forward = to > from
  pillDelays.value = forward ? { left: 70, right: 0 } : { left: 0, right: 70 }
  pill.value = { left: center(to) - PILL / 2, right: center(to) + PILL / 2 }
})
const edge = (delay: number) => `0.34s ${bezier(EASE_EMPHASIZED)} ${delay}ms`
// Each end placed on its own (`left`, `right`), so each can move on its own delay.
const pillStyle = computed(() => ({
  left: `${pill.value.left}px`,
  right: `${dotsWidth.value - pill.value.right}px`,
  height: `${DOT}px`,
  transition: prefersReducedMotion()
    ? 'none'
    : `left ${edge(pillDelays.value.left)}, right ${edge(pillDelays.value.right)}`,
}))
</script>

<template>
  <section
    :aria-label="label"
    aria-roledescription="carousel"
    :class="cn('flex flex-col gap-4 outline-none', props.class)"
  >
    <!-- `touch-pan-y`: a sideways drag is the carousel's, a vertical one the page's. Without it a
         phone takes over a drag that starts a little slanted and cancels it halfway. -->
    <div
      ref="viewport"
      tabindex="0"
      class="touch-pan-y overflow-hidden rounded-[var(--carousel-radius,var(--radius-xl))] focus-ring"
      @keydown="key"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @click.capture="swallowClick"
      @dragstart.prevent
    >
      <div :class="carouselTrackClass" :style="trackStyle" aria-live="polite">
        <slot />
      </div>
    </div>
    <div v-if="count > 1" class="flex items-center justify-center gap-3">
      <button
        type="button"
        :aria-label="previousLabel"
        :disabled="atStart"
        class="flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-[color,opacity] hover:text-fg focus-ring disabled:cursor-default disabled:opacity-40 disabled:hover:text-fg-muted"
        @click="go(current - 1)"
      >
        <ChevronLeftIcon class="size-4" aria-hidden="true" />
      </button>
      <!-- The dots: quiet marks, the pill over them, and a button over each to its slide. -->
      <div class="relative h-4" :style="{ width: `${dotsWidth}px` }">
        <div aria-hidden="true" class="absolute inset-0 flex items-center" :style="{ gap: `${DOT_GAP}px` }">
          <span
            v-for="(_, i) in count"
            :key="i"
            class="shrink-0 rounded-full bg-fg-faint"
            :style="{ width: `${DOT}px`, height: `${DOT}px` }"
          />
        </div>
        <span
          aria-hidden="true"
          class="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-fg)]"
          :style="pillStyle"
        />
        <div class="absolute inset-0 flex items-center" :style="{ gap: `${DOT_GAP}px` }">
          <button
            v-for="(_, i) in count"
            :key="i"
            type="button"
            :aria-label="`${slideLabel} ${i + 1} ${ofLabel} ${count}`"
            :aria-current="i === current || undefined"
            class="relative shrink-0 cursor-pointer rounded-full outline-none before:absolute before:-inset-2 focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
            :style="{ width: `${DOT}px`, height: `${DOT}px` }"
            @click="go(i)"
          />
        </div>
      </div>
      <button
        type="button"
        :aria-label="nextLabel"
        :disabled="atEnd"
        class="flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-[color,opacity] hover:text-fg focus-ring disabled:cursor-default disabled:opacity-40 disabled:hover:text-fg-muted"
        @click="go(current + 1)"
      >
        <ChevronRightIcon class="size-4" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>
