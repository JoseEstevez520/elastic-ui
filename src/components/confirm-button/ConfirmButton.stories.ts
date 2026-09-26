import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LogOut } from '@lucide/vue'
import FileIcon from '../file-icon/FileIcon.vue'
import ConfirmButton from './ConfirmButton.vue'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const meta = {
  title: 'Actions/ConfirmButton',
  component: ConfirmButton,
  args: { action: () => wait(900) },
} satisfies Meta<typeof ConfirmButton>

export default meta
type Story = StoryObj<typeof meta>

/** Press the bin: it opens its lid and asks, in its own place. Confirm, and it tints red while it works. */
export const Default: Story = {}

/** Where it lives: at the end of each row, asking there rather than over the page. */
export const InAList: Story = {
  render: (args) => ({
    components: { ConfirmButton, FileIcon },
    setup: () => ({ args, files: ['unit-3-networks.pdf', 'docker-lab.docx', 'marks-term-1.xlsx'] }),
    template: `
      <ul class="flex w-96 flex-col">
        <li v-for="f in files" :key="f" class="flex h-14 items-center gap-3 border-b border-[color:var(--color-border)] last:border-0">
          <FileIcon :name="f" />
          <span class="min-w-0 flex-1 truncate text-sm text-fg">{{ f }}</span>
          <ConfirmButton v-bind="args" :label="'Delete ' + f" />
        </li>
      </ul>`,
  }),
}

/** Any action that should be confirmed, with its own icon. */
export const SignOut: Story = { args: { icon: LogOut, label: 'Sign out' } }

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** The action fails: the square says so in the danger colour, then is itself again. */
export const Failing: Story = {
  args: {
    action: async () => {
      await wait(800)
      throw new Error('Not allowed')
    },
  },
}

export const Disabled: Story = { args: { disabled: true } }
