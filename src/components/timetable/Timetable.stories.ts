import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Coffee } from '@lucide/vue'
import Timetable from './Timetable.vue'
import type { TimetableEvent } from './timetable.types'

// A second-year web development timetable: 50-minute sessions from 8:10, a break at 11:30.
const SUBJECTS: Record<string, { detail: string; color: string }> = {
  Server: { detail: 'Web server', color: '#e11d48' },
  Client: { detail: 'Web client', color: '#4f46e5' },
  Design: { detail: 'Interface design', color: '#0d9488' },
  Deploy: { detail: 'Deployment', color: '#ca8a04' },
  English: { detail: 'Technical English', color: '#2563eb' },
  Project: { detail: 'Final project', color: '#65a30d' },
}
const SESSIONS = ['08:10', '09:00', '09:50', '10:40', '12:00', '12:50', '13:40', '14:30', '15:20']
// [day, subject, first session, sessions]
const WEEK: [number, string, number, number][] = [
  [0, 'Deploy', 0, 2], [0, 'Design', 2, 2], [0, 'Project', 4, 2], [0, 'English', 6, 1],
  [1, 'Client', 0, 3], [1, 'Design', 3, 1], [1, 'Server', 4, 2],
  [2, 'Design', 0, 2], [2, 'Server', 2, 2], [2, 'Deploy', 5, 2],
  [3, 'Client', 0, 2], [3, 'Design', 2, 2], [3, 'English', 5, 1], [3, 'Server', 6, 2],
  [4, 'Server', 0, 3], [4, 'English', 3, 1], [4, 'Client', 4, 3],
]
// A session's end is the next's start, save across the break.
const endOf = (i: number) => (i === 3 ? '11:30' : SESSIONS[i + 1]!)
const events: TimetableEvent[] = WEEK.map(([day, subject, first, n]) => ({
  day,
  start: SESSIONS[first]!,
  end: endOf(first + n - 1),
  title: subject,
  ...SUBJECTS[subject]!,
}))

const meta = {
  title: 'Content/Timetable',
  component: Timetable,
  args: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    start: '08:10',
    end: '15:20',
    events,
    breaks: [{ start: '11:30', end: '12:00', label: 'Break', icon: Coffee }],
    today: 2,
    // Every session's start, and the break's.
    marks: [...SESSIONS.slice(0, 4), '11:30', ...SESSIONS.slice(4)],
  },
  render: (args) => ({
    components: { Timetable },
    setup: () => ({ args }),
    template: `<Timetable v-bind="args" class="max-w-3xl" />`,
  }),
} satisfies Meta<typeof Timetable>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A week on real time: each block as tall as it lasts, the break across every day, Wednesday marked
 * as today. Narrow the window: one day shows, today first, with tabs for the rest.
 */
export const Default: Story = {}

/** As an image would show it: the whole week, with no today. */
export const Still: Story = { args: { still: true } }
