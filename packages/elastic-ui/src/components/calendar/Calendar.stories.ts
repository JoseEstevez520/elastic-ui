import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Calendar from './Calendar.vue'

const weekend = (iso: string) => [0, 6].includes(new Date(iso).getDay())

const meta = {
  title: 'Forms/Calendar',
  component: Calendar,
  render: () => ({
    components: { Calendar },
    setup: () => ({ day: ref('2026-10-14') }),
    template: `
      <Calendar v-model="day" locale="en-GB" />
      <p class="mt-4 text-sm text-fg-muted">Value: {{ day ?? '—' }}</p>`,
  }),
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

/** A month on the page, to pick a day in. For a date in a form, DatePicker. */
export const Default: Story = {}

/** Days that cannot be picked, here the weekends, are drawn faint and skipped by the arrow keys. */
export const WeekdaysOnly: Story = {
  render: () => ({
    components: { Calendar },
    setup: () => ({ day: ref('2026-10-14'), weekend }),
    template: `<Calendar v-model="day" locale="en-GB" :is-date-disabled="weekend" />`,
  }),
}

/** Only the days between `min` and `max` can be picked, and the months outside them cannot be reached. */
export const WithinARange: Story = {
  render: () => ({
    components: { Calendar },
    setup: () => ({ day: ref('2026-10-14') }),
    template: `<Calendar v-model="day" locale="en-GB" min="2026-10-05" max="2026-10-30" />`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** In another language the month and the days take its names, and the week starts on its own day. */
export const Spanish: Story = {
  render: () => ({
    components: { Calendar },
    setup: () => ({ day: ref('2026-10-14') }),
    template: `<Calendar v-model="day" locale="es-ES" />`,
  }),
}
