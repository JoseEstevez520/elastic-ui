<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { DateFieldInput, DateFieldRoot } from 'reka-ui'
import { computed, nextTick, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { toDateValue, toIso } from '../../utils/date'
import { useFieldGroup } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import Calendar from '../calendar/Calendar.vue'
import FieldMorph from '../field-morph/FieldMorph.vue'

/**
 * A date in a form. Typed straight into its parts (day, month, year, in the order of `locale`),
 * or picked in a month that the field grows into: its outline stretches down to hold the month and
 * folds back once a day is picked. Dates go in and out as "YYYY-MM-DD". In a Field, it is linked to
 * the label, the help and the error.
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

const open = ref(false)
const morph = useTemplateRef<InstanceType<typeof FieldMorph>>('morph')
const button = useTemplateRef<HTMLButtonElement>('button')

// Opening puts the focus on the chosen day, or today, so the arrow keys work at once; picking a
// day closes it and gives the focus back to the button.
watch(open, async (isOpen) => {
  await nextTick()
  if (isOpen) {
    const panel = morph.value?.panel
    ;(panel?.querySelector<HTMLElement>('[data-selected]') ?? panel?.querySelector<HTMLElement>('[data-today]'))?.focus({ preventScroll: true })
  }
})
function pick(next: string | undefined) {
  value.value = next
  open.value = false
  button.value?.focus({ preventScroll: true })
}
</script>

<template>
  <FieldMorph ref="morph" v-model:open="open" :class="props.class">
    <DateFieldRoot
      v-slot="{ segments }"
      v-model="date"
      v-bind="fieldAttrs"
      :aria-invalid="invalid || fieldAttrs['aria-invalid']"
      :min-value="toDateValue(min)"
      :max-value="toDateValue(max)"
      :locale="locale"
      :is-date-unavailable="isDateDisabled ? (d) => isDateDisabled!(d.toString()) : undefined"
      :disabled="disabled"
      :name="name"
      class="flex h-10 w-full items-center px-3 text-ui"
    >
      <!-- The date's parts, each typed or moved with the arrow keys; the separators between them. -->
      <template v-for="segment in segments" :key="segment.part">
        <DateFieldInput v-if="segment.part === 'literal'" :part="segment.part" class="text-fg-faint">{{ segment.value }}</DateFieldInput>
        <DateFieldInput
          v-else
          :part="segment.part"
          class="rounded-[4px] px-0.5 tabular-nums text-fg outline-none focus:bg-surface-raised data-[placeholder]:text-fg-faint"
        >{{ segment.value }}</DateFieldInput>
      </template>
      <button
        ref="button"
        type="button"
        :aria-label="pickLabel"
        :aria-expanded="open"
        :disabled="disabled"
        class="-mr-1.5 ml-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:text-fg focus-ring"
        @click="open = !open"
      >
        <CalendarDays class="size-4" aria-hidden="true" />
      </button>
    </DateFieldRoot>
    <template #panel>
      <Calendar
        :model-value="value"
        :min="min"
        :max="max"
        :locale="locale"
        :week-starts-on="weekStartsOn"
        :is-date-disabled="isDateDisabled"
        class="w-full px-3 pt-1 pb-3 [--calendar-hover:var(--color-surface-raised)]"
        @update:model-value="pick"
      />
    </template>
  </FieldMorph>
</template>
