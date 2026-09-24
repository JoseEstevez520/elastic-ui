import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import Button from './Button.vue'

const ArrowIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }, [
    h('path', { d: 'M7 17L17 7M7 7h10v10' }),
  ])

const meta = {
  title: 'Base/Button',
  component: Button,
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost', 'link'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'icon'] },
  },
  args: { variant: 'solid', size: 'md', loading: false, disabled: false },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Save changes</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-3">
        <Button>Solid</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ ArrowIcon }),
    template: `
      <div class="flex items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" :icon="ArrowIcon" aria-label="Open" />
      </div>`,
  }),
}

export const WithIconAndLoading: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ ArrowIcon }),
    template: `
      <div class="flex items-center gap-3">
        <Button :icon="ArrowIcon" href="#">Visit site</Button>
        <Button loading>Saving</Button>
        <Button variant="outline" disabled>Disabled</Button>
      </div>`,
  }),
}

/** The three customization levels: component tokens, per-instance tokens and classes. */
export const Customized: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-3">
        <Button :style="{ '--button-bg': '#16a34a', '--button-bg-hover': '#15803d', '--button-radius': '999px' }">
          Token override
        </Button>
        <Button variant="outline" class="rounded-none border-2">Class override</Button>
      </div>`,
  }),
}
