import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Mail, Search } from '@lucide/vue'
import { ref } from 'vue'
import Input from './Input.vue'
import Textarea from './Textarea.vue'

// The library ships no icons; Lucide stands in for a project's own.
const icons = { Mail, Search }

const meta = {
  title: 'Forms/Input',
  component: Input,
  render: () => ({
    components: { Input },
    setup: () => ({ name: ref('') }),
    template: `
      <div class="flex w-72 flex-col gap-1.5">
        <label for="name" class="text-sm font-medium text-fg">Name</label>
        <Input id="name" v-model="name" placeholder="Ada Lovelace" />
      </div>`,
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ icons }),
    template: `
      <div class="flex w-72 flex-col gap-3">
        <Input :icon="icons.Search" placeholder="Search" aria-label="Search" />
        <Input :icon="icons.Mail" type="email" placeholder="you@example.com" aria-label="Email" size="sm" />
      </div>`,
  }),
}

/** A value that needs a fix: the line takes the danger color, and the message says why. */
export const Invalid: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div class="flex w-72 flex-col gap-1.5">
        <label for="email" class="text-sm font-medium text-fg">Email</label>
        <Input id="email" model-value="ada@" invalid aria-describedby="email-error" />
        <p id="email-error" class="text-xs text-[color:var(--color-danger)]">Add the part after the @.</p>
      </div>`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Input },
    template: `<Input class="w-72" model-value="Can't change this" disabled aria-label="Locked" />`,
  }),
}

/** Grows with its text up to a limit, then scrolls. */
export const TextareaStory: Story = {
  name: 'Textarea',
  render: () => ({
    components: { Textarea },
    setup: () => ({ notes: ref('') }),
    template: `
      <div class="flex w-80 flex-col gap-1.5">
        <label for="notes" class="text-sm font-medium text-fg">Notes</label>
        <Textarea id="notes" v-model="notes" placeholder="Type a few lines to see it grow" />
      </div>`,
  }),
}
