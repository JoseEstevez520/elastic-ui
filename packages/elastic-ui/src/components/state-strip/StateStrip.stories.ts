import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import StateStrip from './StateStrip.vue'
import type { StateStripItem } from './state-strip.types'

const clock = (i: number) => {
  const minutes = 8 * 60 + i * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}
const phases = ['full', 'full', 'full', 'full', 'half', 'half', 'empty', 'empty', 'empty', 'empty', 'empty', 'full', 'full', 'full', 'half', 'half', 'half', 'empty', 'empty', 'empty', 'empty', 'half', 'full', 'full', 'full', 'full'] as const
const look = {
  full: { label: 'Full', tone: 'success' },
  half: { label: 'Half full', tone: 'warning' },
  empty: { label: 'Empty', tone: 'danger' },
} as const
const items: StateStripItem[] = phases.map((p, i) => ({
  key: `t${i}`,
  time: clock(i),
  ...look[p],
  flag: i === 9 || i === 18 ? 'Something else on the shelf' : undefined,
}))

const meta = {
  title: 'Content/StateStrip',
  component: StateStrip,
  args: { items, label: 'The shelf through the day' },
  decorators: [() => ({ template: '<div class="w-[40rem] max-w-full"><story /></div>' })],
} satisfies Meta<typeof StateStrip>
export default meta
type Story = StoryObj<typeof meta>

/** One cell per photo of the day. Only the current cell is at full strength; the line above says
 * where you are in words. Press a cell, drag the slider, or press play. */
export const Default: Story = {}

/** Playing on its own, one moment every 650 ms, stopping at the end. Pressing a cell or moving
 * the slider takes over and stops it. */
export const Playing: Story = {
  render: (args) => ({
    components: { StateStrip },
    setup: () => ({ args, current: ref(0), playing: ref(true) }),
    template: '<StateStrip v-bind="args" v-model="current" v-model:playing="playing" />',
  }),
}

/** `loop` goes back to the start instead of stopping. */
export const Looping: Story = {
  render: (args) => ({
    components: { StateStrip },
    setup: () => ({ args, current: ref(0), playing: ref(true) }),
    template: '<StateStrip v-bind="args" v-model="current" v-model:playing="playing" loop :interval="400" />',
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A single moment: nothing to walk along. */
export const OneMoment: Story = { args: { items: [items[0]!] } }

/** Two moments. */
export const TwoMoments: Story = { args: { items: [items[0]!, items[6]!] } }

/** Many moments: the cells thin out but stay pressable. */
export const ManyMoments: Story = {
  args: { items: Array.from({ length: 96 }, (_, i) => ({ key: `m${i}`, time: clock(i % 26), ...look[phases[i % 26]!] })) },
}

/** No moments yet: no error. */
export const NoMoments: Story = { args: { items: [] } }

/** Moments without a time: the slider falls back to their number. */
export const WithoutTimes: Story = {
  args: { items: items.slice(0, 8).map(({ time: _time, ...rest }) => rest) },
}

/** A phone. */
export const PhoneWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [() => ({ template: '<div class="w-72"><story /></div>' })],
}

/** Two on one page play independently. */
export const TwoOnOnePage: Story = {
  render: (args) => ({
    components: { StateStrip },
    setup: () => ({ args, a: ref(0), b: ref(12) }),
    template: `
      <div class="flex flex-col gap-10">
        <StateStrip v-bind="args" v-model="a" label="Shelf one" />
        <StateStrip v-bind="args" v-model="b" label="Shelf two" />
      </div>`,
  }),
}
