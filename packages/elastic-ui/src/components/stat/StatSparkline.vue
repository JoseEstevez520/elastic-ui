<script setup lang="ts">
import { labelFor } from '../../utils/labels'
import { motion, useSpring } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { bezier, EASE_EMPHASIZED, prefersReducedMotion } from '../../utils/motion'
import { monotonePath } from './monotone-curve'
import { trendColorVar, type StatChartVariant, type StatTrendTone } from './stat.variants'

/**
 * The trend as a shape, not only a number: a soft area fading down from a smooth monotone curve
 * (`variant: 'line'`, Fritsch–Carlson's monotone cubic, the curve behind d3's `curveMonotoneX`),
 * or rounded bars on a baseline for a value that comes one period at a time (`variant: 'bars'`),
 * its last bar in the trend's tone and the rest a tone quieter. Scaled to the series itself, so a
 * flat run reads as flat and a single value as a dot or a lone bar. Hovering, dragging (pointer)
 * or the arrow keys (keyboard) move a mark to the nearest point and emit `scrub` with its index,
 * `null` on leaving; Stat morphs its value and description from that. Internal to Stat: it never
 * appears on its own.
 */
const props = withDefaults(
  defineProps<{
    series: number[]
    /** One name per point, read out by Stat while that point is scrubbed. */
    labels?: string[]
    tone?: StatTrendTone
    variant?: StatChartVariant
    /** Fills its container edge to edge, taller, meant to sit at a Card's bottom. */
    foot?: boolean
    chartLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    tone: 'neutral',
    variant: 'line',
    foot: false,
    chartLabel: labelFor('trendChart'),
  },
)
const emit = defineEmits<{ scrub: [index: number | null] }>()

const PAD_Y = 4
// Keeps a line's own points off the left/right edge, so the floating dot (r 2.75) at the first or
// last one always sits fully inside the box instead of being clipped by a bleeding Card's
// `overflow-hidden` (bars need no such margin: their edges are meant to sit flush, and a rect has
// no radius to clip).
const PAD_X = 4

// The viewBox is set to the container's own measured pixel size, so the SVG scales 1:1 with no
// distortion (a viewBox stretched to fit a wider box thickens or thins a stroke unevenly).
// Seeded, not 0: the SVG (and the motion paths in it) mount on the very first render rather than
// waiting behind a `v-if` for the real measurement, so motion-v's mount-then-animate sequence
// always runs the same way. The real width lands moments later, before the browser's next paint,
// as an unanimated snap (only x reads it, and x never animates; see the spring below).
const containerRef = useTemplateRef<HTMLElement>('container')
const measuredWidth = ref(100)
let observer: ResizeObserver | undefined
onMounted(() => {
  const el = containerRef.value
  if (!el) return
  measuredWidth.value = el.getBoundingClientRect().width
  observer = new ResizeObserver((entries) => (measuredWidth.value = entries[0].contentRect.width))
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const W = computed(() => measuredWidth.value)
const H = computed(() => (props.foot ? 64 : 32))
const baseline = computed(() => H.value - PAD_Y)

const n = computed(() => props.series.length)

// x only lands when the number of points changes (see the spring below); a bar owns an even
// slice of the width, a line's points spread edge to edge.
const xPositions = computed(() => {
  const count = n.value
  if (count === 0) return []
  if (props.variant === 'bars') {
    const step = W.value / count
    return props.series.map((_, i) => (i + 0.5) * step)
  }
  if (count === 1) return [W.value / 2]
  const usable = Math.max(0, W.value - 2 * PAD_X)
  const step = usable / (count - 1)
  return props.series.map((_, i) => PAD_X + i * step)
})
const barWidth = computed(() => {
  const count = n.value
  if (count === 0) return 0
  const step = W.value / count
  return Math.max(2, step - Math.min(6, step * 0.3))
})

// What the springs follow: a line's own y, or a bar's top (its height is the baseline minus it).
// Scaled to the series' own min/max, with a little padding so a line never touches the edge; a
// flat series (or a single point) lands in the middle rather than dividing by zero.
function targetsFor(series: number[]): number[] {
  const count = series.length
  if (count === 0) return []
  const h = H.value
  if (props.variant === 'bars') {
    const min = Math.min(...series)
    const max = Math.max(...series)
    const range = max - min
    const usable = h - 2 * PAD_Y
    return series.map((v) => {
      const frac = range === 0 ? 0.5 : (v - min) / range
      return h - PAD_Y - Math.max(2, frac * usable)
    })
  }
  if (count === 1) return [h / 2]
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min
  const padding = range === 0 ? 1 : range * 0.1
  const lo = min - padding
  const span = max + padding - lo
  return series.map((v) => PAD_Y + (1 - (v - lo) / span) * (h - 2 * PAD_Y))
}

const target = computed(() => targetsFor(props.series))

// Each mark follows its target on a spring damped past critical, so it never overshoots and keeps
// its speed from one update to the next (see "Progress moves in jerks" in DECISIONS.md).
type Spring = ReturnType<typeof useSpring>
let springs: Spring[] = []
let stopFollowing: Array<() => void> = []
const shown = ref<number[]>([])

function rebuild(values: number[]) {
  stopFollowing.forEach((stop) => stop())
  shown.value = values.slice()
  springs = values.map((v) => useSpring(v, { stiffness: 170, damping: 30 }))
  stopFollowing = springs.map((spring, i) => spring.on('change', (v) => (shown.value[i] = v)))
}
rebuild(target.value)

watch(target, (values, before) => {
  if (values.length !== (before?.length ?? -1)) {
    rebuild(values)
    return
  }
  const reduced = prefersReducedMotion()
  values.forEach((v, i) => (reduced ? springs[i].jump(v) : springs[i].set(v)))
})
onBeforeUnmount(() => stopFollowing.forEach((stop) => stop()))

const points = computed(() => xPositions.value.map((x, i) => ({ x, y: shown.value[i] ?? target.value[i] })))
const bars = computed(() =>
  xPositions.value.map((cx, i) => {
    const top = shown.value[i] ?? target.value[i]
    return { cx, x: cx - barWidth.value / 2, y: top, width: barWidth.value, height: Math.max(0, baseline.value - top) }
  }),
)

const hasLine = computed(() => props.variant === 'line' && points.value.length >= 2)
const lineD = computed(() => monotonePath(points.value))
const areaD = computed(() => {
  if (!hasLine.value) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  return `${lineD.value} L${last.x.toFixed(2)},${H.value} L${first.x.toFixed(2)},${H.value} Z`
})

// The point a scrub (pointer or keyboard) is on; while none, the line's own dot sits on its last
// point, as before scrubbing existed.
const scrubIndex = ref<number | null>(null)
function setScrub(index: number | null) {
  scrubIndex.value = index
  emit('scrub', index)
}
const activeIndex = computed(() => scrubIndex.value ?? points.value.length - 1)
const activePoint = computed(() => points.value[activeIndex.value])
const scrubX = computed(() => (scrubIndex.value !== null ? xPositions.value[scrubIndex.value] : undefined))

function nearestIndex(clientX: number): number {
  const el = containerRef.value
  const count = n.value
  if (!el || count === 0) return 0
  const rect = el.getBoundingClientRect()
  const ratio = rect.width === 0 ? 0 : Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  if (props.variant === 'bars') return Math.min(count - 1, Math.floor(ratio * count))
  return count === 1 ? 0 : Math.round(ratio * (count - 1))
}
function onPointerMove(e: PointerEvent) {
  if (e.pointerType === 'touch' && e.buttons === 0) return
  setScrub(nearestIndex(e.clientX))
}
function onPointerDown(e: PointerEvent) {
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  setScrub(nearestIndex(e.clientX))
}
function endScrub() {
  setScrub(null)
}
function onKeydown(e: KeyboardEvent) {
  const count = n.value
  if (count === 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
  e.preventDefault()
  const current = scrubIndex.value ?? count - 1
  const next =
    e.key === 'ArrowLeft'
      ? Math.max(0, current - 1)
      : e.key === 'ArrowRight'
        ? Math.min(count - 1, current + 1)
        : e.key === 'Home'
          ? 0
          : count - 1
  setScrub(next)
}

const color = computed(() => trendColorVar(props.tone))
const gradientId = `stat-sparkline-${useId()}`

const reduced = prefersReducedMotion()
const lineInitial = reduced ? false : { pathLength: 0 }
const lineTransition = reduced ? { duration: 0 } : { duration: 0.6, ease: EASE_EMPHASIZED }

// The area and the end dot arrive once the line has reached the end, not before, so nothing
// appears ahead of the stroke that is still drawing towards it. A plain `ref` and CSS transition,
// timed to land after the stroke: driving this from motion-v's own delayed `animate` (as the
// stroke's `pathLength` is) raced against Vue's reactive updates to the path's `d` while the width
// is first measured, and intermittently left it stuck at its `initial` opacity.
const revealed = ref(reduced)
let revealTimer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  if (!reduced) revealTimer = setTimeout(() => (revealed.value = true), 620)
})
onBeforeUnmount(() => clearTimeout(revealTimer))
const revealStyle = computed(() => ({
  opacity: revealed.value ? 1 : 0,
  transition: reduced ? 'none' : `opacity 300ms ${bezier(EASE_EMPHASIZED)}`,
}))
</script>

<template>
  <div
    ref="container"
    :class="
      cn(
        'relative w-full outline-none focus-ring rounded-sm',
        props.foot ? 'h-16' : 'h-8',
        color ? '' : 'text-fg-muted',
        props.class,
      )
    "
    :style="color ? { color } : undefined"
    tabindex="0"
    :aria-label="chartLabel"
    @pointermove="onPointerMove"
    @pointerenter="onPointerMove"
    @pointerdown="onPointerDown"
    @pointerup="endScrub"
    @pointercancel="endScrub"
    @pointerleave="endScrub"
    @keydown="onKeydown"
    @blur="endScrub"
  >
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="block h-full w-full overflow-visible">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.12" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <template v-if="variant === 'line'">
        <path v-if="hasLine" :d="areaD" :fill="`url(#${gradientId})`" stroke="none" :style="revealStyle" />
        <motion.path
          v-if="hasLine"
          :d="lineD"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          :initial="lineInitial"
          :animate="{ pathLength: 1 }"
          :transition="lineTransition"
        />
        <circle
          v-if="activePoint"
          :cx="activePoint.x"
          :cy="activePoint.y"
          r="2.75"
          fill="currentColor"
          :style="revealStyle"
        />
      </template>

      <g v-else>
        <rect
          v-for="(bar, i) in bars"
          :key="i"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :rx="Math.min(bar.width / 2, 2.5)"
          fill="currentColor"
          :fill-opacity="i === bars.length - 1 || i === scrubIndex ? 1 : 0.35"
        />
      </g>

      <line
        v-if="scrubX !== undefined"
        :x1="scrubX"
        :x2="scrubX"
        y1="0"
        :y2="H"
        stroke="currentColor"
        stroke-opacity="0.25"
        stroke-width="1"
      />
    </svg>
  </div>
</template>
