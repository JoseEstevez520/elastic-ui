import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Ellipsis, Pencil } from '@lucide/vue'
import Button from '../button/Button.vue'
import ActionButton from './ActionButton.vue'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const meta = {
  title: 'Actions/ActionButton',
  component: ActionButton,
  args: { action: () => wait(1200) },
} satisfies Meta<typeof ActionButton>

export default meta
type Story = StoryObj<typeof meta>

/** Press it: it gathers into a round button while it works, and widens into "Sent" with a check. */
export const Send: Story = {}

/** The same for any action that takes a moment: saving, publishing, handing in. */
export const OtherActions: Story = {
  render: (args) => ({
    components: { ActionButton },
    setup: () => ({ args }),
    template: `
      <div class="flex flex-wrap gap-3">
        <ActionButton v-bind="args" label="Save" done-label="Saved" error-label="Not saved" icon="plus" />
        <ActionButton v-bind="args" label="Publish" done-label="Published" error-label="Not published" icon="arrowUp" />
        <ActionButton v-bind="args" label="Download" done-label="Downloaded" error-label="Not downloaded" icon="arrowDown" />
        <ActionButton v-bind="args" label="Hand in" done-label="Handed in" error-label="Not handed in" />
      </div>`,
  }),
}

/** Without a fill at rest, for a page's header or a row of quiet actions; it still gathers and widens. */
export const Ghost: Story = {
  render: (args) => ({
    components: { ActionButton },
    setup: () => ({ args }),
    template: `<ActionButton v-bind="args" variant="ghost" label="Download" done-label="Downloaded" error-label="Not downloaded" icon="arrowDown" />`,
  }),
}

/**
 * The icon alone, among a section's quiet actions: it looks like the Buttons beside it until it is
 * pressed. Its word shows as a tooltip on hover and keyboard focus, and is its name in every state:
 * "Download" at rest, "Downloading" as the square turns round, "Downloaded" as the arrow turns into
 * the check; the one on the right fails, tinted with the danger colour, "Not downloaded".
 */
export const IconOnly: Story = {
  render: (args) => ({
    components: { ActionButton, Button },
    setup: () => ({
      args,
      icons: { Ellipsis, Pencil },
      fail: async () => {
        await wait(1000)
        throw new Error('Offline')
      },
    }),
    template: `
      <div class="flex flex-col gap-6">
        <div class="flex w-80 max-w-full items-center gap-1">
          <span class="flex-1 text-label text-fg">Unit 1 · HTML</span>
          <Button variant="ghost" size="icon" :icon="icons.Pencil" aria-label="Rename" />
          <ActionButton v-bind="args" variant="ghost" size="icon" icon="arrowDown" label="Download" working-label="Downloading" done-label="Downloaded" error-label="Not downloaded" />
          <Button variant="ghost" size="icon" :icon="icons.Ellipsis" aria-label="More" />
        </div>
        <div class="flex items-center gap-3">
          <ActionButton v-bind="args" variant="ghost" size="icon" icon="arrowDown" label="Download" working-label="Downloading" done-label="Downloaded" error-label="Not downloaded" />
          <ActionButton v-bind="args" :action="fail" variant="ghost" size="icon" icon="arrowDown" label="Download" working-label="Downloading" done-label="Downloaded" error-label="Not downloaded" />
          <ActionButton v-bind="args" size="icon" icon="arrowUp" label="Publish" working-label="Publishing" done-label="Published" error-label="Not published" />
        </div>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** It fails: it widens into what went wrong, tinted with the danger colour, then is itself again. */
export const Failing: Story = {
  args: {
    action: async () => {
      await wait(1000)
      throw new Error('Offline')
    },
  },
}

/** Words of very different lengths: its width follows each, never jumping. */
export const LongWords: Story = {
  args: { label: 'Send to the whole class', doneLabel: 'Sent', errorLabel: 'Could not reach the class' },
}

export const Disabled: Story = { args: { disabled: true } }
