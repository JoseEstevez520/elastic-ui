<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
} from 'reka-ui'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons/internal'
import TextMorph from '../text-morph/TextMorph.vue'
import { calendarDayVariants, calendarNavClass } from './calendar.variants'

// Internal: a month's grid with its heading and arrows, inside Calendar or DatePicker's panel.
defineProps<{
  grid: { value: DateValue; rows: DateValue[][] }[]
  weekDays: string[]
}>()
</script>

<template>
  <CalendarHeader class="mb-2 flex items-center justify-between">
    <CalendarPrev :class="calendarNavClass"><ChevronLeftIcon class="size-4" aria-hidden="true" /></CalendarPrev>
    <!-- The month turns into the next, as any value that changes in place. -->
    <CalendarHeading v-slot="{ headingValue }" class="text-sm font-medium text-fg">
      <TextMorph :text="headingValue" />
    </CalendarHeading>
    <CalendarNext :class="calendarNavClass"><ChevronRightIcon class="size-4" aria-hidden="true" /></CalendarNext>
  </CalendarHeader>
  <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse select-none">
    <CalendarGridHead>
      <CalendarGridRow class="flex">
        <CalendarHeadCell v-for="day in weekDays" :key="day" class="w-9 pb-1 text-xs font-normal text-fg-muted">{{ day }}</CalendarHeadCell>
      </CalendarGridRow>
    </CalendarGridHead>
    <CalendarGridBody>
      <CalendarGridRow v-for="(week, i) in month.rows" :key="i" class="flex">
        <CalendarCell v-for="date in week" :key="date.toString()" :date="date" class="p-0">
          <CalendarCellTrigger :day="date" :month="month.value" :class="calendarDayVariants()" />
        </CalendarCell>
      </CalendarGridRow>
    </CalendarGridBody>
  </CalendarGrid>
</template>
