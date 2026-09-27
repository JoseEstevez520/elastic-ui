import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, ref } from 'vue'
import Button from '../button/Button.vue'
import Progress from './Progress.vue'

const meta = {
  title: 'Content/Progress',
  component: Progress,
  args: { value: 40, label: 'Uploading notes', showValue: true },
  parameters: { layout: 'padded' },
  decorators: [() => ({ template: '<div class="max-w-sm"><story /></div>' })],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Press start: the fill glides from step to step, then the track steps aside and a check is drawn at its end. */
export const Running: Story = {
  render: () => ({
    components: { Progress, Button },
    setup() {
      const value = ref(0)
      let timer: ReturnType<typeof setInterval> | undefined
      function start() {
        clearInterval(timer)
        value.value = 0
        timer = setInterval(() => {
          value.value = Math.min(100, value.value + 6 + Math.random() * 12)
          if (value.value >= 100) clearInterval(timer)
        }, 400)
      }
      onBeforeUnmount(() => clearInterval(timer))
      return { value, start }
    },
    template: `
      <div class="flex flex-col gap-4">
        <Progress :value="value" label="Uploading practice-2.zip" show-value />
        <Button variant="outline" class="self-start" @click="start">Start</Button>
      </div>`,
  }),
}

/** While the amount is not known, a short length travels along the track. */
export const Indeterminate: Story = { args: { value: null, label: 'Preparing the export', showValue: false } }

export const Complete: Story = { args: { value: 100, label: 'Backup' } }

/** With no label, a bare track; name it for screen readers. */
export const Bare: Story = {
  render: () => ({ components: { Progress }, template: '<Progress :value="64" aria-label="Course progress" />' }),
}

/** The accent, where the amount is the point of the screen (a course's progress). */
export const Accent: Story = { args: { value: 72, label: 'Unit 3', tone: 'accent' } }

/** Several at once: each is quiet enough to sit in a list. */
export const InAList: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <ul class="flex flex-col gap-5">
        <li><Progress :value="100" label="Unit 1, the web" show-value /></li>
        <li><Progress :value="58" label="Unit 2, networks" show-value /></li>
        <li><Progress :value="12" label="Unit 3, servers" show-value /></li>
      </ul>`,
  }),
}
