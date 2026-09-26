import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Code2, Rocket, Server } from '@lucide/vue'
import ActivityGrid, { type ActivitySource } from './ActivityGrid.vue'

/**
 * Lab: the library's identity, "objects that transform in place" (the delete that asks in its
 * place has become ConfirmButton). Tried here:
 * flat objects at rest whose parts move as parts, which lift into material when they open, grow
 * where they are rather than opening something over the page, and use colour only to mean.
 */
const meta = { title: 'Lab/Identity' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// A term, about twenty-six weeks, busier around the deadlines.
const days = Array.from({ length: 26 * 7 }, (_, i) => {
  const week = Math.floor(i / 7)
  const weekday = i % 7
  if (weekday > 4) return (i * 7) % 5 === 0 ? 1 : 0
  const busy = [3, 8, 13, 19, 24].some((d) => Math.abs(week - d) <= 1) ? 2 : 0
  return Math.min(4, ((i * 37) % 5 > 1 ? 1 : 0) + busy + ((i * 13) % 7 > 4 ? 1 : 0))
})
const sources: ActivitySource[] = [
  { name: 'Web client', count: 64, icon: Code2, color: '#2563eb' },
  { name: 'Web server', count: 41, icon: Server, color: '#7c3aed' },
  { name: 'Deployment', count: 23, icon: Rocket, color: '#ea580c' },
]

/** The bar grows up over the grid into the list; each icon travels from the stack to its row. */
export const Activity: Story = {
  render: () => ({
    components: { ActivityGrid },
    setup: () => ({ days, sources, start: new Date(2025, 8, 15) }),
    template: `<ActivityGrid title="128 submissions this term" :days="days" :start="start" :sources="sources" summary="Most submitted in" />`,
  }),
}
