import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Field from '../field/Field.vue'
import DatePicker from './DatePicker.vue'

const weekend = (iso: string) => [0, 6].includes(new Date(iso).getDay())

const meta = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  render: () => ({
    components: { DatePicker, Field },
    setup: () => ({ due: ref('2026-10-14'), weekend }),
    template: `
      <Field label="Due date" description="Weekdays only." class="max-w-xs">
        <DatePicker v-model="due" locale="en-GB" :is-date-disabled="weekend" />
      </Field>
      <p class="mt-4 text-sm text-fg-muted">Value: {{ due ?? '—' }}</p>`,
  }),
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Type the date into its parts, or press the calendar to pick it in a month that grows from the
 * field. The month's name morphs as you move; weekends cannot be picked here.
 */
export const Default: Story = {}

/** In Spanish: the parts in its order, the months and days in its names, Monday first. */
export const Spanish: Story = {
  render: () => ({
    components: { DatePicker, Field },
    setup: () => ({ day: ref<string>() }),
    template: `
      <Field label="Fecha de entrega" class="max-w-xs">
        <DatePicker v-model="day" locale="es-ES" pick-label="Elegir fecha" />
      </Field>`,
  }),
}
