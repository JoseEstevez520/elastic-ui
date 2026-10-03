import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Timeline from './Timeline.vue'
import TimelineItem from './TimelineItem.vue'

const WORK = [
  { date: '2026', title: 'Research fellowship', detail: 'Research and development in machine learning', current: true },
  { date: '2025–26', title: 'Industry challenge', detail: 'A student competition with a project for a real client' },
  { date: 'Apr 2026', title: 'Science hackathon', detail: 'Two days of AI applied to biomedical research' },
  { date: '2025', title: 'Open-source contributor', detail: 'Fixes and docs for a charting library' },
  { date: '2024', title: 'Teaching assistant', detail: 'Lab sessions for a first-year web course' },
]

const STUDIES = [
  { date: 'In progress', title: 'Web application development', detail: 'Vocational degree', current: true },
  { date: '2023–25', title: 'Computer systems and networks', detail: 'Vocational degree' },
  { date: '2025', title: 'Erasmus+ exchange', detail: 'Three months abroad' },
]

interface TimelineArgs {
  /** How many entries it holds. */
  count: number
  /** Shows the line under each title. */
  details: boolean
  /** Swaps in a title and a detail far longer than the column. */
  longText: boolean
}

// `args` stays reactive, so the Controls panel updates the timeline without remounting it.
const timeline = (args: TimelineArgs) => ({
  components: { Timeline, TimelineItem },
  setup: () => ({
    args,
    entries: () => WORK.slice(0, args.count),
    title: (entry: (typeof WORK)[number]) =>
      args.longText ? `${entry.title}, with a name long enough to run onto a second line` : entry.title,
    detail: (entry: (typeof WORK)[number]) =>
      args.longText ? `${entry.detail}, told at length so it wraps across several lines in a narrow column` : entry.detail,
  }),
  template: `
    <div class="mx-auto max-w-md py-10">
      <Timeline label="Experience">
        <TimelineItem v-for="entry in entries()" :key="entry.title" :date="entry.date" :title="title(entry)" :current="entry.current">
          <template v-if="args.details">{{ detail(entry) }}</template>
        </TimelineItem>
      </Timeline>
    </div>`,
})

const meta = {
  title: 'Content/Timeline',
  args: { count: 3, details: true, longText: false },
  argTypes: {
    count: { control: { type: 'range', min: 1, max: WORK.length, step: 1 } },
  },
  render: (args) => timeline(args),
} satisfies Meta<TimelineArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Dates and titles alone, for a denser record. */
export const TitlesOnly: Story = {
  args: { details: false, count: 5 },
}

/** Two that ran at the same time, each under its heading; they stack where they do not fit. */
export const SideBySide: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    setup: () => ({ WORK: WORK.slice(0, 3), STUDIES }),
    template: `
      <div class="side-by-side mx-auto max-w-2xl py-10">
        <section v-for="lane in [{ name: 'Experience', entries: WORK }, { name: 'Education', entries: STUDIES }]" :key="lane.name">
          <h3 class="mb-4 text-label text-fg-muted">{{ lane.name }}</h3>
          <Timeline>
            <TimelineItem v-for="entry in lane.entries" :key="entry.title" :date="entry.date" :title="entry.title" :current="entry.current">
              {{ entry.detail }}
            </TimelineItem>
          </Timeline>
        </section>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const SingleItem: Story = {
  args: { count: 1 },
}

export const TwoItems: Story = {
  args: { count: 2 },
}

export const ManyItems: Story = {
  args: { count: WORK.length },
}

export const LongText: Story = {
  args: { longText: true },
}

export const Mobile: Story = {
  ...SideBySide,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
