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
 * A week of classes, shifts or meetings, laid out on real time: each block is as tall as it lasts,
 * a break runs across every day and today is marked. Each block is tinted in its own colour and can link to its page. On a
 * phone, where five columns do not fit, it shows one day, today first, with tabs for the others.
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
    /** Which day is today, from 0; by default the real one, Monday being 0. */
    today?: number
    /**
     * As an image would show it: the whole week, with no today, since a saved copy should not say
     * which day it was saved on.
     */
    still?: boolean
    /** Names the day tabs on a phone. */
    dayLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { breaks: () => [], dayLabel: labelFor('day') },
)

// Rows of ten minutes, eleven pixels each.
const STEP = 10
const minutes = (time: string) => {
  const [h = 0, m = 0] = time.split(':').map(Number)
  return h * 60 + m
}
const from = computed(() => minutes(props.start))
const rows = computed(() => Math.ceil((minutes(props.end) - from.value) / STEP))
const row = (time: string) => Math.round((minutes(time) - from.value) / STEP) + 2

// The times down the side: where each block and break starts, and where the day ends.
const marks = computed(() =>
  props.marks ??
  [...new Set([...props.events.map((e) => e.start), ...props.breaks.map((b) => b.start), props.end])].sort((a, b) => minutes(a) - minutes(b)),
)

const realToday = () => {
  const d = new Date().getDay()
  return d >= 1 && d <= props.days.length ? d - 1 : -1
}
const today = computed(() => (props.still ? -1 : (props.today ?? realToday())))

// One day on a phone, today first.
const narrow = ref(false)
let query: MediaQueryList | undefined
const onQuery = () => (narrow.value = !!query?.matches)
onMounted(() => {
  query = window.matchMedia('(max-width: 639px)')
  onQuery()
  query.addEventListener('change', onQuery)
})
onBeforeUnmount(() => query?.removeEventListener('change', onQuery))
const chosen = ref(String(Math.max(0, today.value)))
const shownDays = computed(() => (narrow.value && !props.still ? [Number(chosen.value)] : props.days.map((_, i) => i)))
const column = (day: number) => shownDays.value.indexOf(day) + 2
const shownEvents = computed(() => props.events.filter((e) => shownDays.value.includes(e.day)))
// A day chosen after the first render comes in as a wave; the first one just shows.
const switched = ref(false)
const choose = (value: string) => {
  chosen.value = value
  switched.value = true
}

</script>

<template>
  <div :class="cn('flex flex-col gap-3', props.class)">
    <Tabs v-if="!still" :model-value="chosen" class="gap-0 sm:hidden" @update:model-value="choose($event as string)">
      <TabsList :aria-label="dayLabel">
        <TabsTrigger v-for="(day, i) in days" :key="day" :value="String(i)">
          {{ day.slice(0, 3) }}<span v-if="i === today" class="ml-0.5 text-fg-faint">·</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div class="overflow-x-auto scrollbar-subtle">
      <div
        class="grid gap-x-1 py-2 sm:min-w-[640px]"
        :style="{ gridTemplateColumns: `44px repeat(${shownDays.length}, 1fr)`, gridTemplateRows: `28px repeat(${rows}, 11px)` }"
      >
        <div
          v-for="i in shownDays"
          :key="days[i]"
          :class="['text-center text-sm', i === today ? 'font-semibold text-fg' : 'text-fg-muted']"
          :style="{ gridColumn: column(i), gridRow: 1 }"
        >
          {{ days[i] }}
          <span v-if="i === today" aria-hidden="true" class="mx-auto mt-0.5 block size-1 rounded-full bg-fg" />
        </div>

        <span
          v-for="m in marks"
          :key="m"
          class="-translate-y-1.5 text-[11px] text-fg-faint tabular-nums"
          :style="{ gridColumn: 1, gridRow: row(m) }"
        >{{ m }}</span>

        <div
          v-for="b in breaks"
          :key="b.start"
          class="flex items-center justify-center gap-1.5 text-xs text-fg-faint"
          :style="{ gridColumn: `2 / ${shownDays.length + 2}`, gridRow: `${row(b.start)} / ${row(b.end)}` }"
        >
          <component :is="b.icon" v-if="b.icon" aria-hidden="true" class="size-3.5" />
          {{ b.label }}
        </div>

        <Tooltip
          v-for="(e, i) in shownEvents"
          :key="`${e.day}-${e.start}-${e.title}`"
          :content="[e.title, e.detail, `${e.start}–${e.end}`].filter(Boolean).join(' · ')"
          :disabled="still"
        >
          <TimetableBlock
            :event="e"
            :link="!still"
            :class="switched && 'animate-blur-in motion-reduce:animate-none'"
            :style="{
              gridColumn: column(e.day),
              gridRow: `${row(e.start)} / ${row(e.end)}`,
              animationDelay: switched ? `${Math.min(i, 7) * 40}ms` : undefined,
            }"
          />
        </Tooltip>

      </div>
    </div>
  </div>
</template>
