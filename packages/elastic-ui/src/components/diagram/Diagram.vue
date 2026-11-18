<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { prefersReducedMotion } from '../../utils/motion'
import { diagramInk, drawInk, loadRough, penDuration, penIn } from './diagram.ink'

/**
 * A hand-drawn diagram's frame: a `figure` that says in words what it shows, with an optional
 * caption, and brings the drawing in once, as a group, when it first comes into view. Inside, the
 * drawing is yours, an `<svg class="diagram">` with the diagram classes (see USAGE 10), or HTML
 * with `diagram-chip`s; mark what should come in with `diagram-in`, and it does in order.
 * In ink (`ink`, or setDiagramInk for every one), its composed parts are drawn by hand (USAGE 10).
 */
const props = withDefaults(
  defineProps<{
    /** What it shows, for those who cannot see it. */
    label: string
    caption?: string
    /**
     * Draws its chips, areas and arrows by hand, with Rough.js, over the parts laid out as ever.
     * Unset, it follows setDiagramInk.
     */
    ink?: boolean
    class?: HTMLAttributes['class']
  }>(),
  // Unset rather than false, so setDiagramInk decides.
  { ink: undefined },
)

const root = useTemplateRef<HTMLElement>('root')
const shown = ref(false)
// Waiting once mounted and until seen: before any script runs (server rendering) it simply shows.
const waiting = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  waiting.value = true
  // Numbered in order, so they come in one after another.
  root.value
    ?.querySelectorAll<HTMLElement | SVGElement>('.diagram-in')
    .forEach((el, i) => el.style.setProperty('--diagram-index', String(i)))
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      waiting.value = false
      shown.value = true
      observer?.disconnect()
    },
    // Nearly all of it in view, not peeking in at the bottom edge.
    { threshold: 0.3 },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

// Ink: the parts are laid out as ever, then measured and drawn over on a layer of their own,
// again whenever one of them changes size or comes in (a resize, a row running down, a part
// streaming in, the hand-written face arriving). The strokes come in once, as a pen draws them,
// when the frame first shows; after that a redraw simply lands.
const inked = computed(() => props.ink ?? diagramInk.value)
const layer = useTemplateRef<SVGSVGElement>('layer')
const drawing = ref(false)
// When the pen started, once it has; undefined until the frame shows.
let penned: number | undefined
let pending = 0
let sizes: ResizeObserver | undefined
let changes: MutationObserver | undefined
let strokes: ReturnType<typeof drawInk> = []

async function draw() {
  const rough = await loadRough()
  if (!inked.value || !root.value || !layer.value) return
  strokes = drawInk(rough, root.value, layer.value)
  for (const part of root.value.querySelectorAll('.diagram-chip, .diagram-area')) sizes?.observe(part)
  if (!shown.value || prefersReducedMotion()) return
  // Drawn again while the pen is still going: it goes on where it was.
  if (penned === undefined) penned = performance.now()
  const elapsed = performance.now() - penned
  if (elapsed < penDuration(strokes)) penIn(strokes, elapsed)
}
function schedule() {
  cancelAnimationFrame(pending)
  pending = requestAnimationFrame(draw)
}

async function ink(on: boolean) {
  sizes?.disconnect()
  changes?.disconnect()
  if (!on) {
    drawing.value = false
    return
  }
  await loadRough()
  if (!inked.value) return
  drawing.value = true
  penned = undefined
  sizes = new ResizeObserver(schedule)
  // Changes in the parts, not in the layer, which each drawing rewrites.
  changes = new MutationObserver((records) => {
    if (records.some((record) => !layer.value?.contains(record.target))) schedule()
  })
  // Once the layer is in the page, and measured in the face it will be read in.
  const hand = root.value && getComputedStyle(root.value).getPropertyValue('--font-hand')
  if (hand) await document.fonts.load(`1rem ${hand}`).catch(() => {})
  requestAnimationFrame(() => {
    if (!root.value) return
    sizes?.observe(root.value)
    changes?.observe(root.value, { childList: true, subtree: true, characterData: true })
    draw()
  })
}
// Only once mounted: in server rendering, and until then, the parts show as they are.
onMounted(() => inked.value && ink(true))
watch(inked, ink)
watch(shown, (now) => {
  if (now && drawing.value) schedule()
})
onBeforeUnmount(() => {
  sizes?.disconnect()
  changes?.disconnect()
  cancelAnimationFrame(pending)
})
</script>

<template>
  <figure
    ref="root"
    role="img"
    :aria-label="label"
    :data-waiting="waiting || undefined"
    :data-shown="shown || undefined"
    :data-ink="drawing || undefined"
    :class="cn('diagram-frame', props.class)"
  >
    <slot />
    <figcaption v-if="caption" class="mt-3 text-ui text-fg-muted">{{ caption }}</figcaption>
    <svg
      v-if="drawing"
      ref="layer"
      class="diagram-ink-layer pointer-events-none absolute inset-0 size-full overflow-visible"
      aria-hidden="true"
    />
  </figure>
</template>
