<script setup lang="ts">
import { motion, useSpring } from 'motion-v'
import { computed, onBeforeUnmount, ref, useId, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { EASE_EMPHASIZED, prefersReducedMotion } from '../../utils/motion'
import { trendColorVar, type StatTrendTone } from './stat.variants'

/**
 * The trend as a shape, not only a number: a small, quiet line (no axes, no grid) with a soft
 * fill fading down from it, in the trend's own tone. Scaled to the series itself, so a flat run
 * reads as flat and a single value as a dot. Internal to Stat: it never appears on its own.
 */
const props = withDefaults(defineProps<{ series: number[]; tone?: StatTrendTone; class?: HTMLAttributes['class'] }>(), {
  tone: 'neutral',
})

const W = 100
const H = 32
const PAD_Y = 4

interface Point {
  x: number
  y: number
}

// Scaled to the series' own min/max, with a little padding so the line never touches the edge; a
// flat series (or a single point) lands in the middle rather than dividing by zero.
function scale(series: number[]): Point[] {
  const n = series.length
  if (n === 0) return []
  if (n === 1) return [{ x: W / 2, y: H / 2 }]

  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min
  const padding = range === 0 ? 1 : range * 0.1
  const lo = min - padding
  const span = max + padding - lo

  return series.map((value, i) => ({
    x: (i / (n - 1)) * W,
    y: PAD_Y + (1 - (value - lo) / span) * (H - 2 * PAD_Y),
  }))
}

const target = computed(() => scale(props.series))

// Each point's y follows its target on a spring damped past critical, so it never overshoots and
// keeps its speed from one update to the next (see "Progress moves in jerks" in DECISIONS.md); x
// only moves when the number of points itself changes, which just lands. Reduced motion jumps.
type Spring = ReturnType<typeof useSpring>
let springs: Spring[] = []
let stopFollowing: Array<() => void> = []
const shownY = ref<number[]>([])

function rebuild(points: Point[]) {
  stopFollowing.forEach((stop) => stop())
  shownY.value = points.map((p) => p.y)
  springs = points.map((p) => useSpring(p.y, { stiffness: 170, damping: 30 }))
  stopFollowing = springs.map((spring, i) => spring.on('change', (v) => (shownY.value[i] = v)))
}

rebuild(target.value)

watch(target, (points, before) => {
  if (points.length !== (before?.length ?? -1)) {
    rebuild(points)
    return
  }
  const reduced = prefersReducedMotion()
  points.forEach((p, i) => (reduced ? springs[i].jump(p.y) : springs[i].set(p.y)))
})

onBeforeUnmount(() => stopFollowing.forEach((stop) => stop()))

const shownPoints = computed(() => target.value.map((p, i) => ({ x: p.x, y: shownY.value[i] ?? p.y })))

const hasLine = computed(() => shownPoints.value.length >= 2)
const lastPoint = computed(() => shownPoints.value[shownPoints.value.length - 1])

const lineD = computed(() =>
  shownPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(''),
)
const areaD = computed(() => {
  if (!hasLine.value) return ''
  const first = shownPoints.value[0]
  const last = lastPoint.value
  return `${lineD.value} L${last.x.toFixed(2)},${H} L${first.x.toFixed(2)},${H} Z`
})

const dotStyle = computed(() =>
  lastPoint.value ? { left: `${lastPoint.value.x}%`, top: `${(lastPoint.value.y / H) * 100}%` } : undefined,
)

const color = computed(() => trendColorVar(props.tone))
const gradientId = `stat-sparkline-${useId()}`

const reduced = prefersReducedMotion()
const lineInitial = reduced ? false : { pathLength: 0 }
const lineTransition = reduced ? { duration: 0 } : { duration: 0.6, ease: EASE_EMPHASIZED }
// The area and the end dot arrive once the line has reached the end, not before, so nothing
// appears ahead of the stroke that is still drawing towards it.
const fadeInitial = reduced ? { opacity: 1 } : { opacity: 0 }
const fadeTransition = reduced ? { duration: 0 } : { duration: 0.3, ease: EASE_EMPHASIZED, delay: 0.6 }
</script>

<template>
  <div
    :class="cn('relative h-8 w-full', color ? '' : 'text-fg-muted', props.class)"
    :style="color ? { color } : undefined"
    aria-hidden="true"
  >
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="block h-full w-full overflow-visible">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.08" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        v-if="hasLine"
        :d="areaD"
        :fill="`url(#${gradientId})`"
        stroke="none"
        :initial="fadeInitial"
        :animate="{ opacity: 1 }"
        :transition="fadeTransition"
      />
      <motion.path
        v-if="hasLine"
        :d="lineD"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :initial="lineInitial"
        :animate="{ pathLength: 1 }"
        :transition="lineTransition"
      />
    </svg>
    <motion.span
      v-if="lastPoint"
      class="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
      :style="dotStyle"
      :initial="fadeInitial"
      :animate="{ opacity: 1 }"
      :transition="fadeTransition"
    />
  </div>
</template>
