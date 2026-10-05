import type { Meta, StoryObj } from '@storybook/vue3-vite'
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
