import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RowCardList from './RowCardList.vue'

/** Lab: a row that opens into its own card, in its place; the other rows step back a tone. */
const meta = { title: 'Lab/Row to card', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const tasks = [
  { id: '1', title: 'Hand in practice 2', when: 'Today', notes: 'Zip the project without node_modules.' },
  { id: '2', title: 'Read the chapter on routing', when: 'Tomorrow' },
  { id: '3', title: 'Subnetting exercises, page 42', when: 'Fri', notes: 'Only the odd ones.' },
  { id: '4', title: 'Ask about the exam date', done: true },
  { id: '5', title: 'Back up the database', when: 'Sun' },
]

/** Press a row: it grows into a card where it is; press it again, or another, to fold it back. */
export const Tasks: Story = {
  render: () => ({
    components: { RowCardList },
    setup: () => ({ tasks }),
    template: `<div class="mx-auto max-w-md"><RowCardList :tasks="tasks" /></div>`,
  }),
}
