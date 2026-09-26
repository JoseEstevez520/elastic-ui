import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Pagination from './Pagination.vue'

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: { total: 200 },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

const withPage = (start: number, extra = '') => ({
  render: (args: Record<string, unknown>) => ({
    components: { Pagination },
    setup: () => ({ args, page: ref(start) }),
    template: `<div class="grid justify-items-center gap-4">
      <Pagination v-bind="args" v-model:page="page" ${extra} />
      <p class="text-meta text-fg-muted tabular-nums">Showing page {{ page }}</p>
    </div>`,
  }),
})

/** Twenty pages: moving on in the middle, the mark stays and the numbers roll to their new values. */
export const Default: Story = withPage(5)

/** A few pages: every number shows, and the mark slides from one to the next. */
export const FewPages: Story = { ...withPage(1), args: { total: 50 } }

/** Many pages, from the first: the ellipsis comes into focus as the window moves away from an end. */
export const ManyPages: Story = { ...withPage(1), args: { total: 2000 } }

/** At the last page: the next chevron goes quieter and cannot be pressed. */
export const AtTheEnd: Story = withPage(20)

/** For a phone: "Page 3 of 20" between the chevrons, the number rolling. */
export const Compact: Story = { ...withPage(3), args: { total: 200, compact: true } }

/** Two sibling pages on each side of the current one. */
export const WiderWindow: Story = { ...withPage(10), args: { total: 400, siblingCount: 2 } }
