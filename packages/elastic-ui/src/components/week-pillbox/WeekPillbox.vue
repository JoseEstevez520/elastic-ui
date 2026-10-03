<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * The days of a week as a pillbox. Seven compartments, each with a lid; a day that is on has
 * its lid tipped open, a pill showing in the well, as the bin's lid tips. At rest it is flat and
 * still; only the lid you press moves. Under it a line says what that adds up to ("Weekdays",
 * "Mon, Wed, Fri"), so the lids never have to be read one by one. Days go in and out as numbers,
 * 1 (Monday) to 7 (Sunday).
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
const days = defineModel<number[]>({ default: () => [] })

// 2024-01-01 was a Monday: a fixed week to take the names from, in any language.
const names = computed(() => {
  const long = new Intl.DateTimeFormat(props.locale, { weekday: 'long' })
  const narrow = new Intl.DateTimeFormat(props.locale, { weekday: 'narrow' })
  const order = Array.from({ length: 7 }, (_, i) => ((props.weekStartsOn - 1 + i) % 7) + 1)
  return order.map((day) => {
    const date = new Date(2024, 0, day)
    return { day, long: long.format(date), narrow: narrow.format(date) }
  })
})

const short = computed(() => {
  const format = new Intl.DateTimeFormat(props.locale, { weekday: 'short' })
  return new Map(names.value.map((d) => [d.day, format.format(new Date(2024, 0, d.day)).replace('.', '')]))
})
const sameAs = (set: number[]) => days.value.length === set.length && set.every((d) => days.value.includes(d))
const labels = useLabels()
const summary = computed(() => {
  const words = props.words ?? {}
  if (!days.value.length) return words.none ?? labels.noDays
  if (sameAs([1, 2, 3, 4, 5, 6, 7])) return words.everyDay ?? labels.everyDay
  if (sameAs([1, 2, 3, 4, 5])) return words.weekdays ?? labels.weekdays
  if (sameAs([6, 7])) return words.weekends ?? labels.weekends
  return names.value.filter((d) => days.value.includes(d.day)).map((d) => short.value.get(d.day)).join(', ')
})

const toggle = (day: number) =>
  (days.value = days.value.includes(day) ? days.value.filter((d) => d !== day) : [...days.value, day].sort())
</script>

<template>
  <div class="inline-flex flex-col items-center gap-3">
  <!-- Headroom above the wells: an open lid swings up into it. -->
  <div role="group" :aria-label="label" :class="cn('inline-flex gap-1.5 rounded-xl bg-surface-sunk px-2.5 pb-2 pt-9', props.class)">
    <button
      v-for="d in names"
      :key="d.day"
      type="button"
      :aria-pressed="days.includes(d.day)"
      :aria-label="d.long"
      class="group relative z-0 flex flex-col items-center gap-1.5 rounded-md transition-[z-index] delay-[350ms] duration-0 aria-pressed:z-10 aria-pressed:delay-0"
      @click="toggle(d.day)"
    >
      <span class="relative block h-10 w-8">
        <!-- The well, a tone deeper than the tray, with its pill. -->
        <span class="absolute inset-0 rounded-md bg-bg-inset" />
        <span
          class="absolute inset-x-0 bottom-2.5 mx-auto h-4 w-2 rounded-full bg-fg-secondary opacity-0 transition-opacity duration-[350ms] ease-emphasized motion-reduce:transition-none group-aria-pressed:opacity-100"
        />
        <!-- The lid, hinged at its top left corner. Tipped, its far corner swings past its own column, so
             an open day stays above its neighbours until its lid has folded back (z-index above). -->
        <span
          class="absolute inset-0 origin-top-left rounded-md bg-surface-raised transition-transform duration-[350ms] ease-emphasized motion-reduce:transition-none group-aria-pressed:-rotate-[64deg]"
        />
      </span>
      <span class="text-meta text-fg-muted transition-colors duration-350 ease-emphasized group-aria-pressed:text-fg">{{ d.narrow }}</span>
    </button>
  </div>
  <TextMorph :text="summary" class="text-label text-fg-secondary" aria-live="polite" />
  </div>
</template>
