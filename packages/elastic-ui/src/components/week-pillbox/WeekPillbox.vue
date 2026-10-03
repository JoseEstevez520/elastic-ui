<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * The days of a week as a row of tiles, each with its letter: a day that is on is filled, one that
 * is off is empty. Under it a line says what that adds up to ("Weekdays", "Mon, Wed, Fri"), so the
 * tiles never have to be read one by one. Days go in and out as numbers, 1 (Monday) to 7 (Sunday).
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
  <div :class="cn('flex w-full max-w-md flex-col gap-3', props.class)">
    <div role="group" :aria-label="label" class="flex gap-1.5">
      <button
        v-for="d in names"
        :key="d.day"
        type="button"
        :aria-pressed="days.includes(d.day)"
        :aria-label="d.long"
        class="flex h-12 min-w-0 flex-1 items-center justify-center rounded-md bg-bg-inset text-label text-fg-muted transition-colors duration-350 ease-emphasized hover:bg-surface-sunk motion-reduce:transition-none aria-pressed:bg-fg aria-pressed:text-bg aria-pressed:hover:bg-fg"
        @click="toggle(d.day)"
      >
        {{ d.narrow }}
      </button>
    </div>
    <TextMorph :text="summary" class="text-label text-fg-secondary" aria-live="polite" />
  </div>
</template>
