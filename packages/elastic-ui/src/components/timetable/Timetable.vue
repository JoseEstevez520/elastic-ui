<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import Tabs from '../tabs/Tabs.vue'
import TabsList from '../tabs/TabsList.vue'
import TabsTrigger from '../tabs/TabsTrigger.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import TimetableBlock from './TimetableBlock.vue'
import type { TimetableBreak, TimetableEvent } from './timetable.types'

/**
 * A week of classes, shifts or meetings, laid out on real time: each block is as tall as it lasts
 * and a break runs across every day. Nothing marks the day it is: the week reads the same any day.
 * Each block is tinted in its own colour and can link to its page. On a
 * phone, where five columns do not fit, it shows one day, today first, with tabs for the others.
 *
 * With `editable`, it becomes the editor too, the usual calendar gestures: drag an empty cell
 * to lay down a new block, drag a block to move it to another time or day, drag the handle at
 * its top or bottom edge to lengthen or shorten it, click one to select it (Delete removes it).
 * It stays a controlled view: a gesture only emits what it would change (`create`, `move`,
 * `resize`, `remove`, `select`); the caller decides, saves it and hands back new `events`.
 */
const props = withDefaults(
  defineProps<{
    /** The days' names, Monday first. */
    days: string[]
    /** When the day starts and ends, as "HH:MM". */
    start: string
    end: string
    events: TimetableEvent[]
    breaks?: TimetableBreak[]
    /** The times down the side; by default where each block and break starts, and the day's end. */
    marks?: string[]
    /** The day shown first on a phone, from 0; by default today's, Monday being 0. */
    startDay?: number
    /** The whole week even on a phone, as an image of it would show; no links or tooltips. */
    still?: boolean
    /** Names the day tabs on a phone. */
    dayLabel?: string
    /** The usual calendar gestures: drag to create, move or resize a block; click to select. */
    editable?: boolean
    /**
     * A real session's length in minutes (a 50-minute class, say). While editable, creating or
     * resizing a block snaps its length to a multiple of this instead of the grid's own step, so
     * a drag that is a little short or a little long still lands on a real session length (one,
     * or two back to back), never on an odd length such as 1h20. Moving a block keeps its length.
     */
    sessionMinutes?: number
    class?: HTMLAttributes['class']
  }>(),
  { breaks: () => [], dayLabel: labelFor('day'), editable: false },
)

const emit = defineEmits<{
  /** An empty cell was dragged into a new block, not yet a real one until the caller makes it so. */
  create: [slot: { day: number; start: string; end: string }]
  /** A block was dragged to a new day and time, its duration kept. */
  move: [id: TimetableEvent['id'], day: number, start: string, end: string]
  /** A block's top or bottom edge was dragged to a new start or end. */
  resize: [id: TimetableEvent['id'], start: string, end: string]
  /** The selected block's Delete or Backspace was pressed. */
  remove: [id: TimetableEvent['id']]
  /** A block was clicked, or the background was, to select none. */
  select: [id: TimetableEvent['id'] | null]
}>()

// Rows of ten minutes, eleven pixels each: the grid's own unit, and the snap a drag rounds to.
const STEP = 10
const ROW_PX = 11
const minutes = (time: string) => {
  const [h = 0, m = 0] = time.split(':').map(Number)
  return h * 60 + m
}
const pad = (n: number) => String(n).padStart(2, '0')
const toTime = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`
const from = computed(() => minutes(props.start))
const to = computed(() => minutes(props.end))
const rows = computed(() => Math.ceil((to.value - from.value) / STEP))
const row = (time: string) => Math.round((minutes(time) - from.value) / STEP) + 2
const snapClamp = (m: number) => Math.min(Math.max(Math.round(m / STEP) * STEP, from.value), to.value)
// A length rounds to a whole session (or two, back to back), never to an odd number of minutes.
const snapDuration = (raw: number) => {
  const unit = props.sessionMinutes ?? STEP
  return Math.max(unit, Math.round(raw / unit) * unit)
}

// The times down the side: where each block and break starts, and where the day ends.
const marks = computed(() =>
  props.marks ??
  [...new Set([...props.events.map((e) => e.start), ...props.breaks.map((b) => b.start), props.end])].sort((a, b) => minutes(a) - minutes(b)),
)

const realToday = () => {
  const d = new Date().getDay()
  return d >= 1 && d <= props.days.length ? d - 1 : -1
}
const firstDay = props.startDay ?? Math.max(0, realToday())

// One day on a phone, today's first.
const narrow = ref(false)
let query: MediaQueryList | undefined
const onQuery = () => (narrow.value = !!query?.matches)
onMounted(() => {
  query = window.matchMedia('(max-width: 639px)')
  onQuery()
  query.addEventListener('change', onQuery)
})
onBeforeUnmount(() => query?.removeEventListener('change', onQuery))
const chosen = ref(String(firstDay))
const shownDays = computed(() => (narrow.value && !props.still ? [Number(chosen.value)] : props.days.map((_, i) => i)))
const column = (day: number) => shownDays.value.indexOf(day) + 2
// A day chosen after the first render comes in as a wave; the first one just shows.
const switched = ref(false)
const choose = (value: string) => {
  chosen.value = value
  switched.value = true
}

// -- editing: a day column's own surface takes the pointer, so which day a gesture is on is
// never in question; its own rect turns the pointer's y into a time. -----------------------

const surfaces = new Map<number, HTMLElement>()
function surfaceRef(day: number) {
  return (el: unknown) => {
    if (el) surfaces.set(day, el as HTMLElement)
    else surfaces.delete(day)
  }
}
function dayAt(x: number): number {
  let closest = shownDays.value[0] ?? 0
  let closestDist = Infinity
  for (const [day, el] of surfaces) {
    const box = el.getBoundingClientRect()
    if (x >= box.left && x <= box.right) return day
    const dist = x < box.left ? box.left - x : x - box.right
    if (dist < closestDist) {
      closestDist = dist
      closest = day
    }
  }
  return closest
}
function timeAt(y: number, day: number): number {
  const el = surfaces.get(day)
  const box = el?.getBoundingClientRect()
  if (!box) return from.value
  return snapClamp(from.value + ((y - box.top) / ROW_PX) * STEP)
}

type Draft = { day: number; anchor: number; start: number; end: number }
const draft = ref<Draft | null>(null)

type Drag = { id: TimetableEvent['id']; kind: 'move' | 'resize-top' | 'resize-bottom'; day: number; start: number; end: number; grabY: number; grabStart: number; grabEnd: number }
const dragging = ref<Drag | null>(null)
const selected = ref<TimetableEvent['id'] | null>(null)

function startCreate(event: PointerEvent, day: number) {
  if (!props.editable || event.button !== 0) return
  const at = timeAt(event.clientY, day)
  draft.value = { day, anchor: at, start: at, end: at + STEP }
  selected.value = null
  emit('select', null)
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function startMove(event: PointerEvent, e: TimetableEvent) {
  if (!props.editable || event.button !== 0) return
  event.stopPropagation()
  const id = e.id ?? `${e.day}-${e.start}-${e.title}`
  dragging.value = { id, kind: 'move', day: e.day, start: minutes(e.start), end: minutes(e.end), grabY: event.clientY, grabStart: minutes(e.start), grabEnd: minutes(e.end) }
  selected.value = id
  emit('select', id)
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function startResize(event: PointerEvent, e: TimetableEvent, edge: 'top' | 'bottom') {
  if (!props.editable || event.button !== 0) return
  event.stopPropagation()
  const id = e.id ?? `${e.day}-${e.start}-${e.title}`
  dragging.value = { id, kind: edge === 'top' ? 'resize-top' : 'resize-bottom', day: e.day, start: minutes(e.start), end: minutes(e.end), grabY: event.clientY, grabStart: minutes(e.start), grabEnd: minutes(e.end) }
  selected.value = id
  emit('select', id)
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onMove(event: PointerEvent) {
  if (draft.value) {
    const d = draft.value
    const at = timeAt(event.clientY, dayAt(event.clientX))
    if (at >= d.anchor) {
      d.start = d.anchor
      d.end = d.anchor + Math.min(snapDuration(at - d.anchor), to.value - d.anchor)
    } else {
      d.end = d.anchor
      d.start = d.anchor - Math.min(snapDuration(d.anchor - at), d.anchor - from.value)
    }
    return
  }
  if (!dragging.value) return
  const d = dragging.value
  if (d.kind === 'move') {
    const day = dayAt(event.clientX)
    const deltaRows = Math.round((event.clientY - d.grabY) / ROW_PX) * STEP
    const duration = d.grabEnd - d.grabStart
    const start = Math.min(Math.max(d.grabStart + deltaRows, from.value), to.value - duration)
    d.day = day
    d.start = start
    d.end = start + duration
  } else if (d.kind === 'resize-bottom') {
    const duration = Math.min(snapDuration(timeAt(event.clientY, d.day) - d.start), to.value - d.start)
    d.end = d.start + duration
  } else {
    const duration = Math.min(snapDuration(d.end - timeAt(event.clientY, d.day)), d.end - from.value)
    d.start = d.end - duration
  }
}

function onUp() {
  if (draft.value) {
    const d = draft.value
    if (d.end - d.start >= STEP) emit('create', { day: d.day, start: toTime(d.start), end: toTime(d.end) })
    draft.value = null
    return
  }
  if (!dragging.value) return
  const d = dragging.value
  if (d.kind === 'move') emit('move', d.id, d.day, toTime(d.start), toTime(d.end))
  else emit('resize', d.id, toTime(d.start), toTime(d.end))
  dragging.value = null
}

function onKey(event: KeyboardEvent) {
  if (!props.editable || selected.value == null) return
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    emit('remove', selected.value)
  }
}

function select(e: TimetableEvent) {
  const id = e.id ?? `${e.day}-${e.start}-${e.title}`
  selected.value = id
  emit('select', id)
}

onMounted(() => {
  if (!props.editable) return
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('keydown', onKey)
})

// What actually draws: the real events, but a dragged one takes its preview's place and position
// instead of its own, so the grid never looks like it jumped back before the save lands.
const shownEvents = computed(() => {
  const base = props.events.filter((e) => shownDays.value.includes(e.day))
  if (!dragging.value) return base
  const d = dragging.value
  return base.map((e) => {
    const id = e.id ?? `${e.day}-${e.start}-${e.title}`
    return id === d.id ? { ...e, day: d.day, start: toTime(d.start), end: toTime(d.end) } : e
  })
})
const draftEvent = computed<TimetableEvent | null>(() =>
  draft.value ? { day: draft.value.day, start: toTime(draft.value.start), end: toTime(draft.value.end), title: '' } : null,
)
</script>

<template>
  <div :class="cn('flex flex-col gap-3', props.class)">
    <Tabs v-if="!still" :model-value="chosen" class="gap-0 sm:hidden" @update:model-value="choose($event as string)">
      <TabsList :aria-label="dayLabel">
        <TabsTrigger v-for="(day, i) in days" :key="day" :value="String(i)">
          {{ day.slice(0, 3) }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="overflow-x-auto scrollbar-subtle">
      <div
        class="grid gap-x-1 py-2 sm:min-w-[640px]"
        :style="{ gridTemplateColumns: `44px repeat(${shownDays.length}, 1fr)`, gridTemplateRows: `28px repeat(${rows}, ${ROW_PX}px)` }"
      >
        <div
          v-for="i in shownDays"
          :key="days[i]"
          class="text-center text-ui text-fg-muted"
          :style="{ gridColumn: column(i), gridRow: 1 }"
        >
          {{ days[i] }}
        </div>

        <span
          v-for="m in marks"
          :key="m"
          class="-translate-y-1.5 text-meta text-fg-faint tabular-nums"
          :style="{ gridColumn: 1, gridRow: row(m) }"
        >{{ m }}</span>

        <div
          v-for="b in breaks"
          :key="b.start"
          class="flex items-center justify-center gap-1.5 text-meta text-fg-faint"
          :style="{ gridColumn: `2 / ${shownDays.length + 2}`, gridRow: `${row(b.start)} / ${row(b.end)}` }"
        >
          <component :is="b.icon" v-if="b.icon" aria-hidden="true" class="size-3.5" />
          {{ b.label }}
        </div>

        <!-- Takes the pointer for "drag an empty cell to create"; under everything else. -->
        <template v-if="editable">
          <div
            v-for="i in shownDays"
            :key="`surface-${i}`"
            :ref="surfaceRef(i)"
            class="touch-none"
            :style="{ gridColumn: column(i), gridRow: '2 / -1' }"
            @pointerdown="startCreate($event, i)"
            @click="emit('select', null)"
          />
        </template>

        <Tooltip
          v-for="(e, i) in shownEvents"
          :key="`${e.day}-${e.start}-${e.title}`"
          :content="[e.title, e.detail, `${e.start}–${e.end}`].filter(Boolean).join(' · ')"
          :disabled="still || editable"
        >
          <TimetableBlock
            :event="e"
            :link="!still && !editable"
            :editable="editable"
            :selected="editable && selected === (e.id ?? `${e.day}-${e.start}-${e.title}`)"
            :class="switched && 'animate-blur-in motion-reduce:animate-none'"
            :style="{
              gridColumn: column(e.day),
              gridRow: `${row(e.start)} / ${row(e.end)}`,
              animationDelay: switched ? `${Math.min(i, 7) * 40}ms` : undefined,
            }"
            @pointerdown="startMove($event, e)"
            @click="select(e)"
            @resize-top="(ev: PointerEvent) => startResize(ev, e, 'top')"
            @resize-bottom="(ev: PointerEvent) => startResize(ev, e, 'bottom')"
          />
        </Tooltip>

        <!-- The block being dragged into existence, before it is real. -->
        <TimetableBlock
          v-if="draftEvent"
          :event="draftEvent"
          class="opacity-70"
          :style="{ gridColumn: column(draftEvent.day), gridRow: `${row(draftEvent.start)} / ${row(draftEvent.end)}` }"
        />
      </div>
    </div>
  </div>
</template>
