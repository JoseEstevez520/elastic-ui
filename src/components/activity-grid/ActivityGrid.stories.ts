import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BookOpen, Code2, FlaskConical, Palette, Rocket, Server } from '@lucide/vue'
import ActivityGrid, { type ActivitySource } from './ActivityGrid.vue'

// Twenty-six weeks, busier around the deadlines, quiet at weekends.
const term = (weeks = 26) =>
  Array.from({ length: weeks * 7 }, (_, i) => {
    const week = Math.floor(i / 7)
    const weekday = i % 7
    if (weekday > 4) return (i * 7) % 5 === 0 ? 1 : 0
    const busy = [3, 8, 13, 19, 24].some((d) => Math.abs(week - d) <= 1) ? 2 : 0
    return Math.min(4, ((i * 37) % 5 > 1 ? 1 : 0) + busy + ((i * 13) % 7 > 4 ? 1 : 0))
  })
const start = new Date(2025, 8, 15)

const subjects: ActivitySource[] = [
  { name: 'Web client', count: 64, icon: Code2, color: '#2563eb' },
  { name: 'Web server', count: 41, icon: Server, color: '#7c3aed' },
  { name: 'Deployment', count: 23, icon: Rocket, color: '#ea580c' },
]

const meta = {
  title: 'Content/ActivityGrid',
  component: ActivityGrid,
  args: { title: '128 submissions this term', days: term(), start, sources: subjects, summary: 'Most submitted in' },
} satisfies Meta<typeof ActivityGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Press the tray: it grows up over the grid into the list, each icon travelling to its row. */
export const Default: Story = {}

/** In Spanish, with its own colour. */
export const Attendance: Story = {
  args: { title: 'Asistencia del curso', summary: 'Más horas en', locale: 'es-ES', sources: subjects.slice(0, 2) },
  render: (args) => ({
    components: { ActivityGrid },
    setup: () => ({ args }),
    template: `<ActivityGrid v-bind="args" style="--activity: var(--color-accent)" />`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** No sources: the grid alone. */
export const GridOnly: Story = { args: { sources: [] } }

/** Many sources: the card grows to hold the list once open. */
export const ManySources: Story = {
  args: {
    sources: [
      ...subjects,
      { name: 'Design', count: 17, icon: Palette, color: '#db2777' },
      { name: 'Testing', count: 12, icon: FlaskConical, color: '#0891b2' },
      { name: 'Company', count: 6, icon: BookOpen, color: '#16a34a' },
    ],
  },
}

/** A short span, as a month: the cells fill the width anyway. */
export const ShortSpan: Story = {
  args: { title: '31 submissions in March', days: term(5), start: new Date(2026, 2, 2) },
}
