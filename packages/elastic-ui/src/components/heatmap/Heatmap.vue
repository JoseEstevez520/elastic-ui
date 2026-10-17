<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TruncatedText from '../truncated-text/TruncatedText.vue'
import type { HeatmapRow } from './heatmap.types'
import { heatColor, heatLevel, heatLevelClass, type HeatmapTone } from './heatmap.variants'

/**
 * Rows against columns, one hue in three steps for how much: which product was empty at which
 * hour, which day a student was late. Where a Chart's axes would say more than the question
 * needs, this answers "when, and where" at a glance. Nothing measured is a dashed cell, apart from
 * a cell that measured nothing (zero).
 *
 * Grey by default, since colour means something: `tone` gives it a meaning (`danger` for what was
 * empty, `success` for what was done). The steps are tones of that one hue over the tray, never
 * several hues. A cell is read on hover or focus into the line under the grid, not a tooltip;
 * arrow keys move between cells, Home and End to the ends of a row.
 *
 * It arrives as a wave across the columns, once, when it first comes into view.
 */
const props = withDefaults(
  defineProps<{
    rows: HeatmapRow[]
    /** One name per column. */
    columns: string[]
    /** The value a full cell stands for. Left out, the largest value does. */
    max?: number
    tone?: HeatmapTone
    /** Names every n-th column above the grid, so long names do not collide. */
    every?: number
    /** Writes a value in the line under the grid; by default `Intl.NumberFormat`. */
    format?: (value: number) => string
    locale?: string
    options?: Intl.NumberFormatOptions
    /** Writes the line under the grid for a cell. */
    describe?: (row: HeatmapRow, column: string, value: number | null) => string
    /** What the grid shows, for screen readers. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { tone: 'neutral', every: 2 },
)

const top = computed(() => props.max ?? Math.max(0, ...props.rows.flatMap((r) => r.values.map((v) => v ?? 0))))
const write = (v: number) => (props.format ? props.format(v) : new Intl.NumberFormat(props.locale, props.options).format(v))
const say = (row: HeatmapRow, column: string, value: number | null) =>
  props.describe ? props.describe(row, column, value) : `${row.label} · ${column} · ${value === null ? '—' : write(value)}`

const columnsStyle = computed(() => ({
  gridTemplateColumns: `minmax(5.5rem,8rem) repeat(${props.columns.length}, minmax(0, 1fr))`,
  '--heat': heatColor[props.tone],
}))

// The cell that is read: the one under the pointer or holding focus.
const active = ref<{ row: number; col: number } | null>(null)
const reading = computed(() => {
  if (!active.value) return ''
  const row = props.rows[active.value.row]
  const column = props.columns[active.value.col]
  return row && column !== undefined ? say(row, column, row.values[active.value.col] ?? null) : ''
})

// One cell takes Tab (roving), the arrow keys move it.
const cursor = ref({ row: 0, col: 0 })
const root = useTemplateRef<HTMLElement>('root')
function onKeydown(e: KeyboardEvent) {
  const { row, col } = cursor.value
  const lastRow = props.rows.length - 1
  const lastCol = props.columns.length - 1
  const to: Record<string, [number, number]> = {
    ArrowRight: [row, Math.min(lastCol, col + 1)],
    ArrowLeft: [row, Math.max(0, col - 1)],
    ArrowDown: [Math.min(lastRow, row + 1), col],
    ArrowUp: [Math.max(0, row - 1), col],
    Home: [row, 0],
    End: [row, lastCol],
  }
  const next = to[e.key]
  if (!next) return
  e.preventDefault()
  cursor.value = { row: next[0], col: next[1] }
  nextTick(() => root.value?.querySelector<HTMLElement>(`[data-cell="${next[0]}-${next[1]}"]`)?.focus())
}

// The wave plays once, when the grid first comes into view; before that its cells wait unseen.
const waiting = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined' || !root.value) return
  waiting.value = true
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      waiting.value = false
      observer?.disconnect()
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div :class="cn('flex flex-col', props.class)">
    <div ref="root" role="group" :aria-label="label" class="flex flex-col gap-[3px]" @keydown="onKeydown" @mouseleave="active = null">
      <div class="grid items-end gap-x-[3px]" :style="columnsStyle" aria-hidden="true">
        <span />
        <span v-for="(column, c) in columns" :key="c" class="min-w-0 text-meta tabular-nums text-fg-muted">
          <TruncatedText v-if="c % every === 0">{{ column }}</TruncatedText>
        </span>
      </div>
      <div
        v-for="(row, r) in rows"
        :key="row.key"
        class="grid items-center gap-x-[3px]"
        :style="columnsStyle"
        :data-hot="active?.row === r"
      >
        <TruncatedText class="pr-2 text-meta text-fg-secondary transition-colors [[data-hot=true]>&]:text-fg">{{ row.label }}</TruncatedText>
        <button
          v-for="(value, c) in row.values"
          :key="c"
          type="button"
          :data-cell="`${r}-${c}`"
          :tabindex="cursor.row === r && cursor.col === c ? 0 : -1"
          :aria-label="say(row, columns[c] ?? '', value)"
          :class="
            cn(
              'h-6 min-w-0 rounded-[4px] outline-offset-1 transition-colors focus-ring',
              heatLevel(value, top) === 'none'
                ? 'bg-transparent outline-dashed outline-1 -outline-offset-1 outline-border'
                : heatLevelClass[heatLevel(value, top) as 0 | 1 | 2 | 3],
              waiting ? 'opacity-0' : 'animate-blur-in motion-reduce:animate-none',
            )
          "
          :style="{ animationDelay: `calc(${c} * 40ms)` }"
          @mouseenter="active = { row: r, col: c }"
          @focus="((active = { row: r, col: c }), (cursor = { row: r, col: c }))"
          @blur="active = null"
        />
      </div>
    </div>
    <p class="mt-3 min-h-5 text-ui text-fg-secondary" aria-hidden="true">{{ reading }}</p>
  </div>
</template>
