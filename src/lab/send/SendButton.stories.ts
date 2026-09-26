import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SendButton from './SendButton.vue'

const meta = { title: 'Lab/Send', component: SendButton } satisfies Meta<typeof SendButton>
export default meta
type Story = StoryObj<typeof meta>

/** Press it: it gathers into a round button while it sends, and widens into "Sent" with a check. */
export const Default: Story = {}

/** When sending fails, it widens into "Not sent", tinted with the danger colour. */
export const Failing: Story = {
  args: { action: () => new Promise<void>((_, reject) => setTimeout(() => reject(new Error()), 1000)) },
}
