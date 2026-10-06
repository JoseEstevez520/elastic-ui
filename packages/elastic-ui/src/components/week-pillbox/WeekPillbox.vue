<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import Liquid from '../liquid/Liquid.vue'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * The days of a week as pills: a day that is on is a drop of the accent, and days side by side melt
 * into one capsule (a Liquid), so a run reads as one shape: Monday to Friday is one long pill, the
 * weekend apart. A day that is off is an empty ring, the place its pill would take. Over it a line
 * says what that adds up to ("Weekdays", "Mon–Thu, Sat"), so the days never have to be read one by
 * one. Press a day to turn it on or off, or drag across several to set them all the same way. Days
 * go in and out as numbers, 1 (Monday) to 7 (Sunday).
 */
const props = withDefaults(
  defineProps<{
    locale?: string
    /** 1 for Monday, 7 for Sunday. */
    weekStartsOn?: 1 | 7
    /** Names the group for screen readers. */
    label?: string
    /** What the line says for the sets of days that have a name, and for none. */
    words?: Partial<{ everyDay: string; weekdays: string; weekends: string; none: string }>
    class?: HTMLAttributes['class']
  }>(),
  { locale: 'en', weekStartsOn: 1, label: labelFor('days') },
)
const model = defineModel<number[]>({ default: () => [] })
// While a drag paints across days they change here only, and the model once, as it ends: one change
// per gesture, so a project that saves each change saves a stroke once, not a day at a time.
const draft = ref<number[]>()
const days = computed(() => draft.value ?? model.value)

// 2024-01-01 was a Monday: a fixed week to take the names from, in any language.
const week = computed(() => {
  const long = new Intl.DateTimeFormat(props.locale, { weekday: 'long' })
  const short = new Intl.DateTimeFormat(props.locale, { weekday: 'short' })
  const narrow = new Intl.DateTimeFormat(props.locale, { weekday: 'narrow' })
  return Array.from({ length: 7 }, (_, i) => ((props.weekStartsOn - 1 + i) % 7) + 1).map((day) => {
    const date = new Date(2024, 0, day)
    return { day, long: long.format(date), short: short.format(date).replace('.', ''), narrow: narrow.format(date) }
  })
})
const on = (day: number) => days.value.includes(day)

// The line: a set of days with a name says it; otherwise the days, a run of three or more as one
// ("Mon–Thu"), so the line stays short however many are on.
const labels = useLabels()
const summary = computed(() => {
  const words = props.words ?? {}
  const count = days.value.length
  const only = (set: number[]) => count === set.length && set.every(on)
  if (!count) return words.none ?? labels.noDays
  if (count === 7) return words.everyDay ?? labels.everyDay
  if (only([1, 2, 3, 4, 5])) return words.weekdays ?? labels.weekdays
  if (only([6, 7])) return words.weekends ?? labels.weekends
  const parts: string[] = []
  let run: typeof week.value = []
  const close = () => {
    parts.push(...(run.length >= 3 ? [`${run[0]!.short}–${run.at(-1)!.short}`] : run.map((d) => d.short)))
    run = []
  }
  for (const d of week.value) on(d.day) ? run.push(d) : close()
  close()
  return parts.join(', ')
})
// Each pair of neighbours that are both on, by the index of the first: a bridge joins them.
const bridges = computed(() => week.value.slice(0, -1).map((d, i) => on(d.day) && on(week.value[i + 1]!.day)))

const toggled = (list: number[], day: number, value: boolean) =>
  value ? [...new Set([...list, day])].sort() : list.filter((d) => d !== day)
const set = (day: number, value: boolean) => {
  if (on(day) === value) return
  if (draft.value) draft.value = toggled(draft.value, day, value)
  else model.value = toggled(model.value, day, value)
}

// Pressing a day turns it on or off; dragging on across others sets each the same way, so a run is
// one stroke. Vertical drags are left to the page (`touch-pan-y`).
const row = ref<HTMLElement>()
let painting: boolean | undefined
const dayAt = (x: number) => {
  const box = row.value?.getBoundingClientRect()
  if (!box) return undefined
  return week.value[Math.min(6, Math.max(0, Math.floor(((x - box.left) / box.width) * 7)))]?.day
}
function down(e: PointerEvent) {
  const day = dayAt(e.clientX)
  if (e.button !== 0 || day === undefined) return
  painting = !on(day)
  draft.value = [...model.value]
  set(day, painting)
  row.value?.setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (painting === undefined) return
  const day = dayAt(e.clientX)
  if (day !== undefined) set(day, painting)
}
function up() {
  painting = undefined
  if (!draft.value) return
  const next = draft.value
  draft.value = undefined
  if (next.length !== model.value.length || next.some((d) => !model.value.includes(d))) model.value = next
}
// A press already set its day on pointerdown; only a click from the keyboard (Enter, Space) toggles.
const click = (e: MouseEvent, day: number) => e.detail === 0 && set(day, !on(day))

// One stop in the tab order for the group, the arrows moving between the days (a toolbar's roving
// focus): Home and End go to the ends.
const focused = ref(0)
const buttons = ref<HTMLButtonElement[]>([])
function key(e: KeyboardEvent, i: number) {
  const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: 6 }[e.key]
  if (to === undefined) return
  e.preventDefault()
  focused.value = (to + 7) % 7
  buttons.value[focused.value]?.focus()
}

const column = (i: number) => ({ left: `calc(${i} * 100% / 7)`, width: 'calc(100% / 7)' })
const grow = 'transition-[scale] duration-500 ease-emphasized motion-reduce:transition-none'
</script>

<template>
  <div :class="cn('flex w-full max-w-md flex-col', props.class)">
    <!-- The same height DayStrip keeps over its bar for the time, so a row of both lines up. -->
    <div class="flex h-7 items-start">
      <TextMorph :text="summary" class="text-label text-fg-secondary" aria-live="polite" />
    </div>
    <div ref="row" class="relative h-11 touch-pan-y select-none" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up">
      <!-- The empty places: a faint ring where each day's pill would sit. -->
      <div v-for="(d, i) in week" :key="`ring-${d.day}`" aria-hidden="true" class="absolute inset-y-0 p-0.5" :style="column(i)">
        <div class="size-full rounded-full border border-dashed border-border-strong" />
      </div>

      <Liquid fill="var(--color-accent)" :reach="5" class="absolute inset-0">
        <template #shapes>
          <div v-for="(d, i) in week" :key="`pill-${d.day}`" :class="['absolute inset-y-0 p-0.5', grow]" :style="{ ...column(i), scale: on(d.day) ? 1 : 0 }">
            <div class="size-full rounded-full bg-black" />
          </div>
          <!-- From one day's middle to the next's: grown once both are on, it melts them into one
               capsule; shrunk at once when one goes, so the capsule thins and lets go. -->
          <div
            v-for="(joined, i) in bridges"
            :key="`bridge-${i}`"
            :class="['absolute inset-y-0.5 bg-black', grow, joined && 'delay-150']"
            :style="{ left: `calc(${i + 0.5} * 100% / 7)`, width: 'calc(100% / 7)', scale: joined ? '1 1' : '0 1' }"
          />
        </template>
      </Liquid>

      <div role="group" :aria-label="label" class="absolute inset-0 flex">
        <button
          v-for="(d, i) in week"
          :key="d.day"
          ref="buttons"
          type="button"
          :aria-pressed="on(d.day)"
          :aria-label="d.long"
          :tabindex="i === focused ? 0 : -1"
          :class="[
            'relative flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full text-label transition-colors duration-300 focus-ring motion-reduce:transition-none',
            on(d.day) ? 'text-[color:var(--color-accent-fg)]' : 'text-fg-muted hover:text-fg',
          ]"
          @click="click($event, d.day)"
          @keydown="key($event, i)"
          @focus="focused = i"
        >
          {{ d.narrow }}
        </button>
      </div>
    </div>
  </div>
</template>
