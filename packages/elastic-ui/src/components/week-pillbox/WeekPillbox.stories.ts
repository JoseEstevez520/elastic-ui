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

/**
 * Press a day to turn it on or off, or drag across several. Days side by side melt into one pill; the
 * line over them says what they add up to.
 */
export const Default: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ days: ref([1, 2, 3, 5]) }),
    template: `<div class="flex flex-col items-center gap-3"><WeekPillbox v-model="days" /><p class="text-meta tabular-nums text-fg-muted">{{ days.join(', ') || 'none' }}</p></div>`,
  }),
}

/** Runs: three days or more in a row are one stretch, on the line ("Mon–Thu, Sat") as in the pills. */
export const Runs: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ days: ref([1, 2, 3, 4, 6]) }),
    template: `<WeekPillbox v-model="days" />`,
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

/** Situation, size: on a phone's width the seven days still fit, each a finger wide. */
export const Phone: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => ({ days: ref([2, 4]) }),
    template: `<div class="w-[320px]"><WeekPillbox v-model="days" /></div>`,
  }),
}

/**
 * Situation, content that changes: a project that writes the days back only once it has saved them.
 * The pills keep what was pressed or painted while the save takes, instead of going back to the old
 * days and then on again.
 */
export const Saving: Story = {
  render: () => ({
    components: { WeekPillbox },
    setup: () => {
      const saved = ref([1, 2, 3, 4, 5])
      const save = (days: number[]) => setTimeout(() => (saved.value = [...days]), 400)
      return { saved, save }
    },
    template: `<div class="flex flex-col items-center gap-3"><WeekPillbox :model-value="saved" @update:model-value="save" /><p class="text-meta tabular-nums text-fg-muted">Saved: {{ saved.join(', ') || 'none' }}</p></div>`,
  }),
}
