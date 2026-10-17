import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from '../button/Button.vue'
import Separator from './Separator.vue'

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  render: (args) => ({
    components: { Separator },
    setup: () => ({ args }),
    template: `
      <div class="w-80">
        <p class="text-label text-fg">Unit 3</p>
        <p class="text-ui text-fg-muted">Networks and routing</p>
        <Separator v-bind="args" class="my-4" />
        <p class="text-label text-fg">Unit 4</p>
        <p class="text-ui text-fg-muted">Deployment</p>
      </div>`,
  }),
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A word in its middle, as between two ways of signing in. */
export const WithLabel: Story = {
  render: () => ({
    components: { Separator, Button },
    template: `
      <div class="flex w-72 flex-col gap-4">
        <Button variant="outline">Continue with the school account</Button>
        <Separator label="or" />
        <Button variant="ghost">Use an email</Button>
      </div>`,
  }),
}

/** Upright, between items in a row. */
export const Vertical: Story = {
  render: () => ({
    components: { Separator },
    template: `
      <div class="flex h-5 items-center gap-3 text-ui text-fg-secondary">
        <span>Notes</span>
        <Separator orientation="vertical" />
        <span>Practices</span>
        <Separator orientation="vertical" />
        <span>Exams</span>
      </div>`,
  }),
}
