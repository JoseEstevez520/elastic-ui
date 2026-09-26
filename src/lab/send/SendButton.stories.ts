import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SendButton from './SendButton.vue'

const meta = { title: 'Lab/Send', component: SendButton } satisfies Meta<typeof SendButton>
export default meta
type Story = StoryObj<typeof meta>

/** Press it: it gathers into a round button while it works, and widens into "Sent" with a check. */
export const Default: Story = {}

/** The same for any action that takes a moment: saving, publishing, handing in. */
export const OtherActions: Story = {
  render: () => ({
    components: { SendButton },
    template: `
      <div class="flex flex-wrap gap-3">
        <SendButton label="Save" done-label="Saved" failed-label="Not saved" icon="plus" />
        <SendButton label="Publish" done-label="Published" failed-label="Not published" icon="arrowUp" />
        <SendButton label="Hand in" done-label="Handed in" failed-label="Not handed in" />
      </div>`,
  }),
}

/** When it fails, it widens into what went wrong, tinted with the danger colour. */
export const Failing: Story = {
  args: { action: () => new Promise<void>((_, reject) => setTimeout(() => reject(new Error()), 1000)) },
}
