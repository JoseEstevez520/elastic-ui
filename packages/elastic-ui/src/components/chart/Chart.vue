<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import { placeLabels, type Box, type LabelRequest } from './chart.labels'
import { formatTick, formatValue, numericScale, type NumericScale } from './chart.scale'
import type { ChartAxis, ChartPoint, ChartSeries, ChartVariant } from './chart.types'
import { seriesColor, SURFACE } from './chart.variants'
import ChartLegend from './ChartLegend.vue'
import ChartTable from './ChartTable.vue'

/**
 * A chart for notes and docs, drawn in plain SVG: a line, bars over categories, or loose points,
 * for one series or a few, on real axes with round ticks, a linear or log scale, and the axes'
 * titles and units. Grey by default: one series stays grey and its name is the chart's; several
 * take the palette's hues in order, with a legend. Names given to points (`label`) are written by
 * them where they collide with nothing, and left to the tooltip where they would. Hovering, or the
 * arrow keys once focused, reads a position out (every series at that x, or the nearest point),
 * at once and without motion, as everything used all the time; a table holds every value for
 * screen readers. It comes into view once, as a group, and is as wide as its column, down to a
 * phone's.
 */
const props = withDefaults(
  defineProps<{
    series: ChartSeries[]
    variant?: ChartVariant
    /** The bars' categories in order; by default, in the order the data first names them. */
    categories?: string[]
    x?: ChartAxis
    y?: ChartAxis
    /** What it shows, for those who cannot see it, and the table's caption. */
    label: string
    caption?: string
    /** The drawing's height in pixels, axes included. */
    height?: number
    keysLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'line', height: 280, keysLabel: labelFor('chartKeys') },
)

const FONT = 12
const MARKER = 4
const RING = 2
const GAP = 2
const BAR = 24

// --- Size: the SVG is drawn at the column's own pixel width, so strokes and text never stretch.
const root = useTemplateRef<HTMLElement>('root')
const plot = useTemplateRef<HTMLElement>('plot')
const width = ref(560)
const family = ref<string>()
let canvas: CanvasRenderingContext2D | null | undefined
function textWidth(text: string) {
  if (family.value && canvas === undefined) canvas = document.createElement('canvas').getContext('2d')
  if (!canvas || !family.value) return text.length * FONT * 0.56
  canvas.font = `${FONT}px ${family.value}`
  return canvas.measureText(text).width
}

// Comes in once, as a group, when nearly all of it is in view (as Diagram).
const waiting = ref(false)
const shown = ref(false)
let resize: ResizeObserver | undefined
let intersection: IntersectionObserver | undefined
onMounted(() => {
  const el = plot.value!
  family.value = getComputedStyle(el).fontFamily
  width.value = el.getBoundingClientRect().width
  resize = new ResizeObserver(([entry]) => {
    if (entry && entry.contentRect.width !== width.value) width.value = entry.contentRect.width
  })
  resize.observe(el)
  waiting.value = true
  intersection = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      waiting.value = false
      shown.value = true
      intersection?.disconnect()
    },
    { threshold: 0.6 },
  )
  intersection.observe(root.value!)
})
onBeforeUnmount(() => {
  resize?.disconnect()
  intersection?.disconnect()
})

// --- Data.
const categorical = computed(() => props.variant === 'bars' || props.series.some((s) => s.points.some((p) => typeof p.x === 'string')))
const categories = computed(() => {
  if (!categorical.value) return []
  if (props.categories) return props.categories
  const seen = new Set<string>()
  for (const s of props.series) for (const p of s.points) seen.add(String(p.x))
  return [...seen]
})
const xLog = computed(() => !categorical.value && props.x?.scale === 'log')
const yLog = computed(() => props.y?.scale === 'log')
const valid = (p: ChartPoint) =>
  Number.isFinite(p.y) && (!yLog.value || p.y > 0) && (categorical.value ? categories.value.includes(String(p.x)) : Number.isFinite(Number(p.x)) && (!xLog.value || Number(p.x) > 0))
const colors = computed(() => props.series.map((s, i) => seriesColor(i, props.series.length, s.color)))

const withUnit = (text: string, unit?: string) => (unit ? `${text} ${unit}` : text)
const axisTitle = (axis?: ChartAxis) => (axis?.title && axis.unit ? `${axis.title} (${axis.unit})` : (axis?.title ?? (axis?.unit ? `(${axis.unit})` : '')))
const readX = (x: number | string) => (typeof x === 'string' ? x : withUnit(props.x?.format?.(x) ?? formatValue(x), props.x?.unit))
const readY = (y: number) => withUnit(props.y?.format?.(y) ?? formatValue(y), props.y?.unit)

// --- Layout, top to bottom: the y axis's title, the plot, the x ticks, the x axis's title.
const yTitle = computed(() => axisTitle(props.y))
const xTitle = computed(() => axisTitle(props.x))
const top = computed(() => (yTitle.value ? 28 : 10))
const bottom = computed(() => props.height - (xTitle.value ? 44 : 24))

const yScale = computed<NumericScale>(() => {
  const values = props.series.flatMap((s) => s.points.filter(valid).map((p) => p.y))
  return numericScale(values, [bottom.value, top.value], Math.max(2, Math.floor((bottom.value - top.value) / 44)), {
    type: props.y?.scale,
    min: props.y?.min,
    max: props.y?.max,
    zero: props.variant === 'bars',
  })
})
const yTickText = (v: number) => props.y?.format?.(v) ?? formatTick(v, yScale.value)
const left = computed(() => Math.ceil(Math.max(0, ...yScale.value.ticks.map((t) => textWidth(yTickText(t))))) + 10)

const xValues = computed(() => props.series.flatMap((s) => s.points.filter(valid).map((p) => Number(p.x))))
// First with a rough right edge, to count the ticks; then with room for half the last one's text.
const xScaleFor = (right: number) =>
  numericScale(xValues.value, [left.value, right], Math.max(2, Math.floor((right - left.value) / 88)), {
    type: props.x?.scale,
    min: props.x?.min,
    max: props.x?.max,
  })
const xTickText = (v: number, scale: NumericScale) => props.x?.format?.(v) ?? formatTick(v, scale)
const right = computed(() => {
  if (categorical.value) return width.value - 4
  const rough = xScaleFor(width.value - 8)
  const last = rough.ticks.at(-1)
  return width.value - Math.max(8, last === undefined ? 0 : Math.ceil(textWidth(xTickText(last, rough)) / 2))
})
const xScale = computed(() => (categorical.value ? undefined : xScaleFor(right.value)))
const band = computed(() => (right.value - left.value) / Math.max(1, categories.value.length))
const xOf = (x: number | string) =>
  categorical.value ? left.value + (categories.value.indexOf(String(x)) + 0.5) * band.value : xScale.value!(Number(x))

const baseline = computed(() => {
  const [lo, hi] = yScale.value.domain
  return yScale.value(yScale.value.type === 'log' ? lo : Math.min(hi, Math.max(lo, 0)))
})

// --- Marks.
interface Mark extends ChartPoint {
  px: number
  py: number
  series: number
}
const drawn = computed(() =>
  props.series.map((s, i) => {
    let points: Mark[] = s.points.filter(valid).map((p) => ({ ...p, px: xOf(p.x), py: yScale.value(p.y), series: i }))
    if (props.variant === 'line' && !categorical.value) points = points.sort((a, b) => a.px - b.px)
    return { name: s.name, color: colors.value[i]!, points }
  }),
)
const linePath = (points: Mark[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p.px.toFixed(2)},${p.py.toFixed(2)}`).join('')

// Dots on a line only while they have room; on a dense line, only the one being read.
const markers = computed(() => {
  if (props.variant === 'points') return true
  if (props.variant !== 'line') return false
  const most = Math.max(0, ...drawn.value.map((s) => s.points.length))
  return most <= 24 && (right.value - left.value) / Math.max(1, most) >= 14
})

// Bars side by side in each category, at most 24px thick and 2px apart, the band's rest air.
const bars = computed(() => {
  if (props.variant !== 'bars') return []
  const count = drawn.value.length
  const group = Math.min(band.value * 0.72, count * BAR + (count - 1) * GAP)
  const thick = Math.max(1, (group - (count - 1) * GAP) / count)
  return drawn.value.flatMap((s, j) =>
    s.points.map((p) => {
      const x = p.px - group / 2 + j * (thick + GAP)
      return { ...p, x, width: thick, color: s.color, d: barPath(x, thick, baseline.value, p.py) }
    }),
  )
})
// Rounded at the data's end, square on the baseline.
function barPath(x: number, w: number, y0: number, y1: number) {
  const r = Math.min(4, w / 2, Math.abs(y0 - y1))
  const up = y1 <= y0
  const s = up ? 1 : 0
  const edge = up ? y1 + r : y1 - r
  return `M${x},${y0}V${edge}A${r},${r} 0 0 ${s} ${x + r},${y1}H${x + w - r}A${r},${r} 0 0 ${s} ${x + w},${edge}V${y0}Z`
}

// --- Ticks.
const yTicks = computed(() => yScale.value.ticks.map((v) => ({ y: yScale.value(v), text: yTickText(v) })))
const xTicks = computed(() => {
  if (categorical.value) {
    const widest = Math.max(0, ...categories.value.map((c) => textWidth(c)))
    // Every other name (or fewer) when they would touch.
    const every = Math.max(1, Math.ceil(((widest + 12) * categories.value.length) / (right.value - left.value)))
    return categories.value.map((c, i) => ({ x: xOf(c), text: i % every ? '' : c, grid: false })).filter((t) => t.text)
  }
  const scale = xScale.value!
  return scale.ticks.map((v) => ({ x: scale(v), text: xTickText(v, scale), grid: true }))
})

// --- Names on the drawing, where they fit.
const placed = computed(() => {
  const radius = MARKER + RING
  const requests: LabelRequest[] = []
  const marks: Box[] = []
  if (props.variant === 'bars') {
    for (const b of bars.value) {
      marks.push({ x: b.x, y: Math.min(b.py, baseline.value), width: b.width, height: Math.abs(baseline.value - b.py) })
      if (b.label) requests.push({ x: b.x + b.width / 2, y: Math.min(b.py, baseline.value), r: 0, text: b.label, width: textWidth(b.label), height: 14, onlyAbove: true })
    }
  } else {
    for (const s of drawn.value)
      for (const p of s.points) {
        if (markers.value || p.label) marks.push({ x: p.px - radius, y: p.py - radius, width: radius * 2, height: radius * 2 })
        if (p.label) requests.push({ x: p.px, y: p.py, r: radius, text: p.label, width: textWidth(p.label), height: 14 })
      }
  }
  return placeLabels(requests, marks, { x: left.value, y: top.value - 8, width: width.value - left.value, height: bottom.value - top.value + 8 })
})

// --- Reading out: a position (every series at one x) for lines and bars, a point for points.
const positions = computed(() => {
  if (props.variant === 'points') return []
  if (categorical.value) return categories.value.map((c) => ({ key: c as number | string, px: xOf(c) }))
  const keys = [...new Set(drawn.value.flatMap((s) => s.points.map((p) => Number(p.x))))].sort((a, b) => a - b)
  return keys.map((k) => ({ key: k as number | string, px: xOf(k) }))
})
const loose = computed(() => (props.variant === 'points' ? drawn.value.flatMap((s) => s.points).sort((a, b) => a.px - b.px || a.py - b.py) : []))
const count = computed(() => (props.variant === 'points' ? loose.value.length : positions.value.length))
const active = ref<number | null>(null)

interface Readout {
  title: string
  rows: Array<{ color?: string; name: string; value: string }>
  x: number
  y: number
  points: Mark[]
}
const readout = computed<Readout | null>(() => {
  const index = active.value
  if (index === null || index >= count.value) return null
  if (props.variant === 'points') {
    const p = loose.value[index]!
    const several = drawn.value.length > 1
    return {
      title: p.label ?? props.series[p.series]!.name,
      rows: [
        ...(several && p.label ? [{ color: colors.value[p.series], name: '', value: props.series[p.series]!.name }] : []),
        { name: props.y?.title ?? 'y', value: readY(p.y) },
        { name: props.x?.title ?? 'x', value: readX(p.x) },
      ],
      x: p.px,
      y: p.py,
      points: [p],
    }
  }
  const { key, px } = positions.value[index]!
  const at = drawn.value.flatMap((s) => s.points.filter((p) => p.x === key))
  const several = drawn.value.length > 1
  return {
    title: readX(key),
    rows: at.map((p) => ({
      color: several ? colors.value[p.series] : undefined,
      name: [several ? props.series[p.series]!.name : props.y?.title, p.label].filter(Boolean).join(' · '),
      value: readY(p.y),
    })),
    x: px,
    y: Math.min(...at.map((p) => p.py), bottom.value),
    points: at,
  }
})
const spoken = computed(() => (readout.value ? [readout.value.title, ...readout.value.rows.map((r) => `${r.name} ${r.value}`.trim())].join(', ') : ''))

function pointAt(e: PointerEvent) {
  const rect = plot.value!.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  if (props.variant === 'points') {
    let best: number | null = null
    let distance = 32
    loose.value.forEach((p, i) => {
      const d = Math.hypot(p.px - mx, p.py - my)
      if (d < distance) [best, distance] = [i, d]
    })
    return best
  }
  if (!positions.value.length || mx < left.value - 12 || mx > right.value + 12) return null
  let best = 0
  positions.value.forEach((p, i) => {
    if (Math.abs(p.px - mx) < Math.abs(positions.value[best]!.px - mx)) best = i
  })
  return best
}
function onPointer(e: PointerEvent) {
  if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.buttons) return
  active.value = pointAt(e)
}
function onKeydown(e: KeyboardEvent) {
  const n = count.value
  if (!n) return
  const now = active.value
  const next: Record<string, number | null> = {
    ArrowRight: now === null ? 0 : Math.min(n - 1, now + 1),
    ArrowDown: now === null ? 0 : Math.min(n - 1, now + 1),
    ArrowLeft: now === null ? n - 1 : Math.max(0, now - 1),
    ArrowUp: now === null ? n - 1 : Math.max(0, now - 1),
    Home: 0,
    End: n - 1,
    Escape: null,
  }
  if (!(e.key in next)) return
  e.preventDefault()
  active.value = next[e.key]!
}

// Beside what it reads, on the side with more room, never over it.
const tooltipStyle = computed(() => {
  const r = readout.value
  if (!r) return undefined
  const toLeft = r.x > width.value / 2
  return {
    left: `${r.x}px`,
    top: `${Math.max(r.y, top.value + 24)}px`,
    transform: `translate(${toLeft ? 'calc(-100% - 14px)' : '14px'}, -50%)`,
  }
})

// --- For screen readers, every value in a table.
const labels = useLabels()
const table = computed(() => {
  const several = props.series.length > 1
  if (props.variant === 'points' || !categorical.value) {
    const named = props.series.some((s) => s.points.some((p) => p.label))
    const columns = [...(several ? [labels.series] : []), xTitle.value || 'x', yTitle.value || 'y', ...(named ? [labels.name] : [])]
    const rows = drawn.value.flatMap((s) =>
      s.points.map((p) => [...(several ? [s.name] : []), readX(p.x), readY(p.y), ...(named ? [p.label ?? ''] : [])]),
    )
    return { columns, rows }
  }
  const columns = [xTitle.value, ...drawn.value.map((s) => (several ? s.name : yTitle.value || s.name))]
  const rows = categories.value.map((c) => [
    c,
    ...drawn.value.map((s) => {
      const p = s.points.find((q) => String(q.x) === c)
      return p ? readY(p.y) + (p.label ? ` (${p.label})` : '') : ''
    }),
  ])
  return { columns, rows }
})

const readoutId = `chart-${useId()}`
</script>

<template>
  <figure
    ref="root"
    :aria-label="label"
    :data-waiting="waiting || undefined"
    :data-shown="shown || undefined"
    :class="cn('diagram-frame m-0 flex flex-col gap-3', props.class)"
  >
    <ChartLegend v-if="series.length > 1" class="diagram-in" :items="drawn" :variant="variant" />
    <div
      ref="plot"
      class="diagram-in relative w-full touch-pan-y rounded-[var(--radius-sm)] outline-none focus-ring"
      tabindex="0"
      :aria-label="`${label}. ${keysLabel}`"
      :aria-describedby="readoutId"
      @pointermove="onPointer"
      @pointerdown="onPointer"
      @pointerleave="active = null"
      @keydown="onKeydown"
      @blur="active = null"
    >
      <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" class="block w-full overflow-visible" aria-hidden="true">
        <text v-if="yTitle" x="0" :y="FONT" class="fill-fg-secondary" :font-size="FONT">{{ yTitle }}</text>

        <!-- Grid and axes: recessive, under everything. -->
        <g>
          <line v-for="t in yTicks" :key="`y${t.y}`" class="diagram-grid" :x1="left" :x2="right" :y1="t.y" :y2="t.y" />
          <template v-for="t in xTicks" :key="`x${t.x}`">
            <line v-if="t.grid" class="diagram-grid" :x1="t.x" :x2="t.x" :y1="top" :y2="bottom" />
          </template>
          <line class="diagram-line" :x1="left" :x2="right" :y1="baseline" :y2="baseline" />
        </g>
        <g class="fill-fg-muted tabular-nums" :font-size="FONT">
          <text v-for="t in yTicks" :key="`yt${t.y}`" :x="left - 8" :y="t.y" text-anchor="end" dominant-baseline="central">{{ t.text }}</text>
          <text v-for="t in xTicks" :key="`xt${t.x}`" :x="t.x" :y="bottom + 16" text-anchor="middle">{{ t.text }}</text>
        </g>
        <text v-if="xTitle" :x="(left + right) / 2" :y="height - 4" text-anchor="middle" class="fill-fg-secondary" :font-size="FONT">{{ xTitle }}</text>

        <!-- The position being read, as a hairline (lines) or a band (bars). -->
        <line
          v-if="readout && variant === 'line'"
          :x1="readout.x"
          :x2="readout.x"
          :y1="top"
          :y2="bottom"
          stroke="var(--color-border-strong)"
          stroke-width="1"
        />

        <g v-if="variant === 'bars'">
          <path
            v-for="(b, i) in bars"
            :key="i"
            :d="b.d"
            :style="{ fill: b.color, opacity: readout && !readout.points.some((p) => p.px === b.px) ? 0.4 : 1 }"
          />
        </g>
        <g v-else>
          <path
            v-for="s in variant === 'line' ? drawn : []"
            :key="s.name"
            :d="linePath(s.points)"
            fill="none"
            :style="{ stroke: s.color }"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <template v-for="s in drawn" :key="`m${s.name}`">
            <circle
              v-for="(p, i) in markers ? s.points : []"
              :key="i"
              :cx="p.px"
              :cy="p.py"
              :r="MARKER"
              :stroke-width="RING"
              :style="{ fill: s.color, stroke: SURFACE }"
            />
          </template>
          <!-- What is being read stands out: a larger dot. -->
          <circle
            v-for="(p, i) in readout?.points ?? []"
            :key="`a${i}`"
            :cx="p.px"
            :cy="p.py"
            :r="MARKER + 1.5"
            :stroke-width="RING"
            :style="{ fill: colors[p.series], stroke: SURFACE }"
          />
        </g>

        <g class="fill-fg-secondary" :font-size="FONT">
          <text v-for="l in placed" :key="`${l.text}${l.x}`" :x="l.x" :y="l.y" :text-anchor="l.anchor" dominant-baseline="central">{{ l.text }}</text>
        </g>
      </svg>

      <div
        v-if="readout"
        class="pointer-events-none absolute z-10 flex max-w-56 flex-col gap-0.5 rounded-[var(--radius-sm)] border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-surface-raised))] px-2.5 py-1.5 text-meta text-fg-secondary shadow-soft"
        :style="tooltipStyle"
        aria-hidden="true"
      >
        <span class="text-fg-muted">{{ readout.title }}</span>
        <span v-for="(row, i) in readout.rows" :key="i" class="flex items-center gap-1.5 whitespace-nowrap">
          <span v-if="row.color" class="h-0.5 w-2.5 shrink-0 rounded-full" :style="{ background: row.color }" />
          <span class="font-medium text-fg tabular-nums">{{ row.value }}</span>
          <span v-if="row.name">{{ row.name }}</span>
        </span>
      </div>
    </div>
    <p :id="readoutId" class="sr-only" aria-live="polite">{{ spoken }}</p>
    <figcaption v-if="caption" class="text-ui text-fg-muted">{{ caption }}</figcaption>
    <ChartTable :caption="label" :columns="table.columns" :rows="table.rows" />
  </figure>
</template>
