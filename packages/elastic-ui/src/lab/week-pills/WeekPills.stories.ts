import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import WeekPillboxLids from './WeekPillboxLids.vue'
import WeekPillsLiquid from './WeekPillsLiquid.vue'

/** Lab: two ways for WeekPillbox to say more than a row of boxes. */
const meta = { title: 'Lab/Week pills', parameters: { layout: 'centered' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** Days as pills of colour: days side by side melt into one capsule, so a week's shape reads at a glance. */
export const Liquid: Story = {
  render: () => ({
    components: { WeekPillsLiquid },
    setup: () => ({ days: ref([1, 2, 3, 5]) }),
    template: `<div class="w-96"><WeekPillsLiquid v-model="days" /></div>`,
  }),
}

/** A pill organiser: a day's lid tips open and its pill drops in. */
export const Pillbox: Story = {
  render: () => ({
    components: { WeekPillboxLids },
    setup: () => ({ days: ref([1, 3, 5]) }),
    template: `<div class="w-96"><WeekPillboxLids v-model="days" /></div>`,
  }),
}

/** The two side by side, on the same days, to compare. */
export const SideBySide: Story = {
  render: () => ({
    components: { WeekPillsLiquid, WeekPillboxLids },
    setup: () => ({ days: ref([1, 2, 3, 4, 5]) }),
    template: `
      <div class="flex w-96 flex-col gap-10">
        <WeekPillsLiquid v-model="days" />
        <WeekPillboxLids v-model="days" />
      </div>`,
  }),
}
