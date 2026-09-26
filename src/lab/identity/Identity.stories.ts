import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Code2, Rocket, Server } from '@lucide/vue'
import FileIcon from '../../components/file-icon/FileIcon.vue'
import ActivityGrid, { type ActivitySource } from './ActivityGrid.vue'
import ConfirmInPlace from './ConfirmInPlace.vue'

/**
 * Lab: the library's identity, "objects that transform in place", tried on two pieces: small,
 * flat objects at rest whose parts move as parts, which lift into material when they open, grow
 * where they are rather than opening something over the page, and use colour only to mean.
 */
const meta = { title: 'Lab/Identity' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const files = ['unit-3-networks.pdf', 'docker-lab.docx', 'marks-term-1.xlsx']

/** Delete asks in its own place: the bin opens its lid and the square widens into the question. */
export const ConfirmInPlaceStory: Story = {
  name: 'Confirm in place',
  render: () => ({
    components: { ConfirmInPlace, FileIcon },
    setup: () => ({ files }),
    template: `
      <ul class="flex w-96 flex-col">
        <li v-for="f in files" :key="f" class="flex h-14 items-center gap-3 border-b border-[color:var(--color-border)] last:border-0">
          <FileIcon :name="f" />
          <span class="min-w-0 flex-1 truncate text-sm text-fg">{{ f }}</span>
          <ConfirmInPlace />
        </li>
      </ul>`,
  }),
}

// A term, about eighteen weeks, busier around the deadlines.
const days = Array.from({ length: 18 * 7 }, (_, i) => {
  const week = Math.floor(i / 7)
  const weekday = i % 7
  if (weekday > 4) return (i * 7) % 5 === 0 ? 1 : 0
  const busy = [3, 7, 11, 16].some((d) => Math.abs(week - d) <= 1) ? 2 : 0
  return Math.min(4, ((i * 37) % 5 > 1 ? 1 : 0) + busy + ((i * 13) % 7 > 4 ? 1 : 0))
})
const sources: ActivitySource[] = [
  { name: 'Web client', count: 64, icon: Code2, color: 'var(--color-accent)' },
  { name: 'Web server', count: 41, icon: Server, color: 'light-dark(#7c3aed, #a78bfa)' },
  { name: 'Deployment', count: 23, icon: Rocket, color: 'var(--color-success)' },
]

/** The bar grows up over the grid into the list; each icon travels from the stack to its row. */
export const Activity: Story = {
  render: () => ({
    components: { ActivityGrid },
    setup: () => ({ days, sources }),
    template: `<ActivityGrid title="128 submissions this term" :days="days" :sources="sources" summary="Most submitted in" />`,
  }),
}
