import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import DayStrip from './DayStrip.vue'

const meta = { title: 'Forms/DayStrip', component: DayStrip, parameters: { layout: 'centered' } } satisfies Meta<typeof DayStrip>
export default meta
type Story = StoryObj<typeof meta>

/** Drag a knob to its hour; press the strip to add one; Delete or a double press takes one away. */
export const Default: Story = {
  render: () => ({
    components: { DayStrip },
    setup: () => ({ times: ref(['03:00', '14:30']) }),
    template: `<div class="w-96"><DayStrip v-model="times" /><p class="mt-2 text-meta tabular-nums text-fg-muted">{{ times.join(' · ') || 'none' }}</p></div>`,
  }),
}

/** Situation, count: none, one, and the most it holds. */
export const Counts: Story = {
  render: () => ({
    components: { DayStrip },
    setup: () => ({ none: ref<string[]>([]), one: ref(['03:00']), full: ref(['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']) }),
    template: `<div class="flex w-96 flex-col gap-10"><DayStrip v-model="none" /><DayStrip v-model="one" /><DayStrip v-model="full" /></div>`,
  }),
}

/** Situation, content: times close together keep a quarter of an hour apart and never cross. */
export const Close: Story = {
  render: () => ({
    components: { DayStrip },
    setup: () => ({ times: ref(['09:00', '09:15', '09:30']) }),
    template: `<div class="w-96"><DayStrip v-model="times" /></div>`,
  }),
}

/** Situation, languages: its texts in the app's own words. */
export const Spanish: Story = {
  render: () => ({
    components: { DayStrip },
    setup: () => ({ times: ref(['03:00']) }),
    template: `<div class="w-96"><DayStrip v-model="times" label="Horas" add-label="Añadir una hora" /></div>`,
  }),
}

/** Situation, size: on a phone's width. */
export const Phone: Story = {
  render: () => ({
    components: { DayStrip },
    setup: () => ({ times: ref(['03:00', '15:00']) }),
    template: `<div class="w-[320px]"><DayStrip v-model="times" /></div>`,
  }),
}

/** Situation, coexistence: two on one page. */
export const Two: Story = {
  render: () => ({
    components: { DayStrip },
    setup: () => ({ a: ref(['03:00']), b: ref(['12:00', '22:00']) }),
    template: `<div class="flex w-96 flex-col gap-10"><DayStrip v-model="a" /><DayStrip v-model="b" /></div>`,
  }),
}
