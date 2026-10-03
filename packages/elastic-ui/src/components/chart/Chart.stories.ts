import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Chart from './Chart.vue'
import type { ChartSeries } from './chart.types'

// Made-up figures, only to show the part working.
const RESPONSE: ChartSeries[] = [
  {
    name: 'Median response',
    points: [
      { x: 1, y: 120 },
      { x: 2, y: 128 },
      { x: 4, y: 141 },
      { x: 8, y: 167 },
      { x: 16, y: 230 },
      { x: 32, y: 410 },
      { x: 64, y: 905, label: 'Pool exhausted' },
    ],
  },
]

const GRADES: ChartSeries[] = [
  {
    name: 'Students',
    points: [
      { x: 'Fail', y: 3 },
      { x: 'Pass', y: 9 },
      { x: 'Good', y: 11 },
      { x: 'Very good', y: 6 },
      { x: 'Excellent', y: 2 },
    ],
  },
]

const BENCHMARK: ChartSeries[] = [
  {
    name: 'Models',
    points: [
      { x: 0.15, y: 41, label: 'Mini' },
      { x: 0.4, y: 52, label: 'Flash' },
      { x: 0.6, y: 55, label: 'Small' },
      { x: 1.1, y: 63, label: 'Medium' },
      { x: 2.5, y: 71, label: 'Pro' },
      { x: 3, y: 70.2, label: 'Pro (preview)' },
      { x: 9, y: 78, label: 'Large' },
      { x: 15, y: 79.5, label: 'Large reasoning' },
      { x: 60, y: 82, label: 'Ultra' },
    ],
  },
]

const USERS: ChartSeries[] = [
  {
    name: 'Singleton',
    points: [1, 2, 4, 8, 16, 32].map((x) => ({ x, y: 1 })),
  },
  {
    name: 'Prototype',
    points: [1, 2, 4, 8, 16, 32].map((x) => ({ x, y: x, label: x === 32 ? '32 objects' : undefined })),
  },
  {
    name: 'Pool of 8',
    points: [1, 2, 4, 8, 16, 32].map((x) => ({ x, y: Math.min(x, 8) })),
  },
]

const TERMS: ChartSeries[] = [
  { name: 'First term', points: [{ x: 'Java', y: 6.8 }, { x: 'SQL', y: 7.4 }, { x: 'Web', y: 6.1 }, { x: 'Systems', y: 5.6 }] },
  { name: 'Second term', points: [{ x: 'Java', y: 7.3 }, { x: 'SQL', y: 7.2 }, { x: 'Web', y: 7.0 }, { x: 'Systems', y: 6.2 }] },
]

const meta = {
  title: 'Content/Chart',
  component: Chart,
  args: {
    series: RESPONSE,
    variant: 'line',
    label: 'Median response time against concurrent users: it doubles past 16, and jumps once the pool runs out at 64',
    x: { title: 'Concurrent users', scale: 'log' },
    y: { title: 'Response', unit: 'ms' },
  },
  render: (args) => ({
    components: { Chart },
    setup: () => ({ args }),
    template: `<Chart v-bind="args" class="max-w-2xl" />`,
  }),
} satisfies Meta<typeof Chart>

export default meta
type Story = StoryObj<typeof meta>

/** One series, grey: its name is the chart's. The point the note is about carries its name. */
export const Line: Story = {}

/** Bars over categories, from zero, at most 24px thick; hover or the arrow keys read one. */
export const Bars: Story = {
  args: {
    series: GRADES,
    variant: 'bars',
    label: 'Students by final grade: most passed or did well, two were excellent',
    x: undefined,
    y: { title: 'Students' },
  },
}

/**
 * A model benchmark: cost against score, cost on a log axis since it spans three orders of
 * magnitude. Every point has a name; those that would collide are left to the tooltip.
 */
export const PointsOnALogAxis: Story = {
  args: {
    series: BENCHMARK,
    variant: 'points',
    label: 'Benchmark score against cost per million tokens: the score rises with cost, but flattens past about ten dollars',
    x: { title: 'Cost per million tokens', unit: 'USD', scale: 'log' },
    y: { title: 'Score', unit: '%', min: 30, max: 90 },
  },
}

/** Several series take the palette in order, with a legend; the readout lists every one at that x. */
export const SeveralSeries: Story = {
  args: {
    series: USERS,
    variant: 'line',
    label: 'Objects created against requests: a singleton stays at one, a prototype grows with every request, a pool stops at eight',
    x: { title: 'Requests' },
    y: { title: 'Objects in memory' },
  },
}

/** Grouped bars, two series side by side in each category, 2px apart. */
export const GroupedBars: Story = {
  args: {
    series: TERMS,
    variant: 'bars',
    label: 'Average mark by subject in each term: every subject but SQL went up',
    x: undefined,
    y: { title: 'Average mark', min: 0, max: 10 },
  },
}

/** On a phone: fewer ticks, names that no longer fit left to the tooltip, a legend that wraps. */
export const OnAPhone: Story = {
  ...PointsOnALogAxis,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => ({
    components: { Chart },
    setup: () => ({ benchmark: BENCHMARK, users: USERS }),
    template: `
      <div class="flex flex-col gap-10">
        <Chart
          :series="benchmark"
          variant="points"
          label="Benchmark score against cost per million tokens"
          :x="{ title: 'Cost per million tokens', unit: 'USD', scale: 'log' }"
          :y="{ title: 'Score', unit: '%', min: 30, max: 90 }"
          :height="260"
        />
        <Chart
          :series="users"
          label="Objects created against requests"
          :x="{ title: 'Requests' }"
          :y="{ title: 'Objects in memory' }"
          :height="240"
        />
      </div>`,
  }),
}

/** In the dark theme: the palette's own dark steps, the grid and text a tone off the ground. */
export const Dark: Story = {
  ...SeveralSeries,
  globals: { theme: 'dark' },
}

/** Two on a page, each reading its own values, and a series with a colour of its own. */
export const TwoOnAPage: Story = {
  render: () => ({
    components: { Chart },
    setup: () => ({
      grades: GRADES,
      response: [{ ...RESPONSE[0]!, color: 'var(--color-accent)' }],
    }),
    template: `
      <div class="flex max-w-2xl flex-col gap-10">
        <Chart :series="grades" variant="bars" label="Students by final grade" :y="{ title: 'Students' }" :height="220" />
        <Chart :series="response" label="Median response time against concurrent users" :x="{ title: 'Concurrent users', scale: 'log' }" :y="{ title: 'Response', unit: 'ms' }" caption="Measured on the class server, one run each." />
      </div>`,
  }),
}
