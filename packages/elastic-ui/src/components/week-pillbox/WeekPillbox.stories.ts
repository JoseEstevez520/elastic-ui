import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import WeekPillbox from './WeekPillbox.vue'

const meta = {
  title: 'Forms/WeekPillbox',
  component: WeekPillbox,
  parameters: { layout: 'centered' },
  // It fills the width it is given, up to a limit.
  decorators: [() => ({ template: '<div class="w-96"><story /></div>' })],
} satisfies Meta<typeof WeekPillbox>
export default meta
type Story = StoryObj<typeof meta>

const es = { everyDay: 'Todos los días', weekdays: 'Entre semana', weekends: 'Fines de semana', none: 'Ningún día' }

/** Press a lid to tip it open (that day is on) or shut; the line under it says what it adds up to. */
export const Default: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ days: ref([1, 2, 3, 4, 5]) }),
    template: `<div class="flex flex-col items-center gap-3"><WeekPillbox v-model="days" /><p class="text-meta tabular-nums text-fg-muted">{{ days.join(', ') || 'none' }}</p></div>`,
  }),
}

/** Situation, count: none, one, an odd few, and every day. */
export const Counts: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ none: ref<number[]>([]), one: ref([3]), odd: ref([1, 3, 5]), all: ref([1, 2, 3, 4, 5, 6, 7]) }),
    template: `<div class="flex flex-col gap-6"><WeekPillbox v-model="none" /><WeekPillbox v-model="one" /><WeekPillbox v-model="odd" /><WeekPillbox v-model="all" /></div>`,
  }),
}

/** Situation, languages: names and letters from the locale, the week starting on Sunday, the line in the app's words. */
export const Spanish: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ days: ref([6, 7]), es }),
    template: `<WeekPillbox v-model="days" locale="es" :week-starts-on="7" label="Días" :words="es" />`,
  }),
}

/** Situation, coexistence: two on one page, each on its own. */
export const Two: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ a: ref([1, 2]), b: ref([6, 7]) }),
    template: `<div class="flex flex-col gap-6"><WeekPillbox v-model="a" /><WeekPillbox v-model="b" /></div>`,
  }),
}

/** Situation, size: on a phone's width the seven compartments still fit. */
export const Phone: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ days: ref([2, 4]) }),
    template: `<div class="w-[320px]"><WeekPillbox v-model="days" /></div>`,
  }),
}
