<script setup lang="ts">
import { CalendarRoot } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { toDateValue, toIso } from '../../utils/date'
import CalendarBody from './CalendarBody.vue'

/**
 * A month to pick a day in, on the page. Dates go in and out as "YYYY-MM-DD". The month's name
 * morphs into the next as you move; today has a small dot; the chosen day takes the accent. Arrow
 * keys move by day, Page Up and Down by month. For a date in a form, DatePicker.
 */
const props = withDefaults(
  defineProps<{
    /** The earliest and latest days that can be picked, as "YYYY-MM-DD". */
    min?: string
    max?: string
    /** For the months' and days' names: "es-ES", "en-GB"… */
    locale?: string
    /** 0 for Sunday, 1 for Monday. */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    /** Days that cannot be picked, such as weekends. */
    isDateDisabled?: (date: string) => boolean
    class?: HTMLAttributes['class']
  }>(),
  { weekStartsOn: 1 },
)

const value = defineModel<string>()
const date = computed({ get: () => toDateValue(value.value), set: (v) => (value.value = toIso(v)) })
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays }"
    v-model="date"
    :min-value="toDateValue(min)"
    :max-value="toDateValue(max)"
    :locale="locale"
    :week-starts-on="weekStartsOn"
    :is-date-disabled="isDateDisabled ? (d) => isDateDisabled!(d.toString()) : undefined"
    fixed-weeks
    :class="cn('w-fit min-w-[16rem]', props.class)"
  >
    <CalendarBody :grid="grid" :week-days="weekDays" />
  </CalendarRoot>
</template>
