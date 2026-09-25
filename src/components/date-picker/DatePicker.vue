<script setup lang="ts">
import { DatePickerAnchor, DatePickerCalendar, DatePickerContent, DatePickerField, DatePickerInput, DatePickerRoot, DatePickerTrigger } from 'reka-ui'
import { CalendarDays } from '@lucide/vue'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { toDateValue, toIso } from '../../utils/date'
import { useFieldGroup } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import CalendarBody from '../calendar/CalendarBody.vue'
import { comboboxAnchorClass } from '../combobox/combobox.variants'
import { floatingPanelClass } from '../popover/popover.variants'

/**
 * A date in a form. Typed straight into its parts (day, month, year, in the order of `locale`),
 * or picked in a month that grows from the field, as a Popover does. Dates go in and out as
 * "YYYY-MM-DD". In a Field, it is linked to the label, the help and the error.
 */
const props = withDefaults(
  defineProps<{
    min?: string
    max?: string
    /** For the order of the parts and the names of months and days: "es-ES", "en-GB"… */
    locale?: string
    /** 0 for Sunday, 1 for Monday. */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    isDateDisabled?: (date: string) => boolean
    invalid?: boolean
    disabled?: boolean
    name?: string
    /** Names the button that opens the month. */
    pickLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { weekStartsOn: 1, pickLabel: labelFor('pickDate') },
)

const value = defineModel<string>()
const date = computed({ get: () => toDateValue(value.value), set: (v) => (value.value = toIso(v)) })
// Its parts are a group, named after a Field's label.
const fieldAttrs = useFieldGroup()
</script>

<template>
  <DatePickerRoot
    v-model="date"
    :min-value="toDateValue(min)"
    :max-value="toDateValue(max)"
    :locale="locale"
    :week-starts-on="weekStartsOn"
    :is-date-disabled="isDateDisabled ? (d) => isDateDisabled!(d.toString()) : undefined"
    :disabled="disabled"
    :name="name"
    fixed-weeks
  >
    <!-- The whole field is what the month grows from, lined up with its start. -->
    <DatePickerAnchor as-child>
    <DatePickerField
      v-slot="{ segments }"
      v-bind="fieldAttrs"
      :aria-invalid="invalid || fieldAttrs['aria-invalid']"
      :class="cn(comboboxAnchorClass, 'h-10 w-full px-3 text-sm', props.class)"
    >
      <!-- The date's parts, each typed or moved with the arrow keys; the separators between them. -->
      <template v-for="segment in segments" :key="segment.part">
        <DatePickerInput
          v-if="segment.part === 'literal'"
          :part="segment.part"
          class="text-fg-faint"
        >{{ segment.value }}</DatePickerInput>
        <DatePickerInput
          v-else
          :part="segment.part"
          class="rounded-[4px] px-0.5 tabular-nums text-fg outline-none focus:bg-bg-muted data-[placeholder]:text-fg-faint"
        >{{ segment.value }}</DatePickerInput>
      </template>
      <DatePickerTrigger
        :aria-label="pickLabel"
        class="-mr-1.5 ml-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:text-fg focus-ring"
      >
        <CalendarDays class="size-4" aria-hidden="true" />
      </DatePickerTrigger>
    </DatePickerField>
    </DatePickerAnchor>
    <!-- The month grows from the field, as a Popover's panel does, and as wide as it, as a Select's
         list is; never narrower than a month needs. -->
    <DatePickerContent :side-offset="6" :collision-padding="16" align="start" :class="cn(floatingPanelClass, 'shadow-overlay w-(--reka-popover-trigger-width) min-w-[17.5rem] p-3')">
      <DatePickerCalendar v-slot="{ grid, weekDays }">
        <CalendarBody :grid="grid" :week-days="weekDays" />
      </DatePickerCalendar>
    </DatePickerContent>
  </DatePickerRoot>
</template>
