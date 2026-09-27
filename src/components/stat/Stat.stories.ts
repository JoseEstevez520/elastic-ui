import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Button from '../button/Button.vue'
import Card from '../card/Card.vue'
import CardContent from '../card/CardContent.vue'
import Stat from './Stat.vue'
import StatGroup from './StatGroup.vue'

const meta = {
  title: 'Content/Stat',
  component: Stat,
  args: { label: 'Attendance', value: 0.94, options: { style: 'percent' } },
} satisfies Meta<typeof Stat>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const weeks = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`)

/** A class tools page's summary, each figure a Card of its own: attendance comes one week at a
 * time, so it reads as bars; the average mark is read as one running number, so its weeks draw as
 * a smooth curve. Both sit at the Card's own foot, edge to edge (`foot`), so the chart is the
 * card's ground rather than a line squeezed under the number. Hover a card, or tab to it and use
 * the arrow keys, to read a single week: the figure and the caption roll into that week's own. */
export const AClassToolsPage: Story = {
  render: () => ({
    components: { Card, Stat, StatGroup },
    setup: () => ({
      weeks,
      attendance: [0.97, 0.96, 0.95, 0.93, 0.92, 0.94, 0.93, 0.91],
      averageGrade: [6.9, 7.0, 7.1, 7.3, 7.2, 7.4, 7.5, 7.6],
    }),
    template: `
      <StatGroup>
        <Card class="w-72">
          <Stat
            label="Attendance"
            :value="0.91"
            :options="{ style: 'percent' }"
            :trend="-4"
            trend-tone="negative"
            :series="attendance"
            :labels="weeks"
            variant="bars"
            foot
          />
        </Card>
        <Card class="w-72">
          <Stat
            label="Average grade"
            :value="7.6"
            :trend="6"
            trend-tone="positive"
            :series="averageGrade"
            :labels="weeks"
            description="Out of ten"
            foot
          />
        </Card>
        <Card class="w-72">
          <Stat label="Enrolled" :value="128" description="Across three groups" />
        </Card>
      </StatGroup>`,
  }),
}

/** Hovering or dragging the pointer across the chart, or focusing it and pressing the arrow keys,
 * moves a fine mark to the nearest week; the figure and the caption morph into that week's own
 * value and name, and morph back once the pointer leaves or the chart loses focus. */
export const ScrubADot: Story = {
  render: () => ({
    components: { Card, Stat },
    setup: () => ({ weeks, averageGrade: [6.9, 7.0, 7.1, 7.3, 7.2, 7.4, 7.5, 7.6] }),
    template: `
      <Card class="w-80">
        <Stat
          label="Average grade"
          :value="7.6"
          :trend="6"
          trend-tone="positive"
          :series="averageGrade"
          :labels="weeks"
          description="Out of ten"
          foot
        />
      </Card>`,
  }),
}

/** A student's record: a smaller figure sits beside others in a card. */
export const InAStudentRecord: Story = {
  render: () => ({
    components: { Card, CardContent, Stat, StatGroup },
    template: `
      <Card class="max-w-md">
        <CardContent>
          <StatGroup>
            <Stat size="sm" label="Attendance" :value="0.88" :options="{ style: 'percent' }" :trend="-9" trend-tone="negative" />
            <Stat size="sm" label="Final grade" :value="8.4" :trend="3" trend-tone="positive" />
          </StatGroup>
        </CardContent>
      </Card>`,
  }),
}

/** The value's digits roll to their new place, and the trend turns rather than swaps its arrow. */
export const LiveCount: Story = {
  render: () => ({
    components: { Button, Stat },
    setup: () => ({ present: ref(24), delta: ref(3) }),
    template: `
      <div class="flex flex-col items-start gap-4">
        <Stat label="Present today" :value="present" :trend="delta" trend-tone="neutral" />
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="present++; delta++">+1</Button>
          <Button size="sm" variant="ghost" @click="present = Math.max(0, present - 1); delta -= 2">−1</Button>
        </div>
      </div>`,
  }),
}

/** The sparkline's points move to their new places on a spring as the series changes, instead of
 * jumping (see "Progress moves in jerks" in DECISIONS.md); a new reading arrives every second. */
export const LiveUpdatingSeries: Story = {
  render: () => ({
    components: { Stat },
    setup() {
      const series = ref([0.88, 0.9, 0.89, 0.93, 0.91])
      const value = ref(series.value[series.value.length - 1])
      let timer: ReturnType<typeof setInterval>
      onMounted(() => {
        timer = setInterval(() => {
          const next = Math.min(1, Math.max(0.7, series.value[series.value.length - 1] + (Math.random() - 0.5) * 0.08))
          series.value = [...series.value.slice(1), next]
          value.value = next
        }, 1000)
      })
      onBeforeUnmount(() => clearInterval(timer))
      return { series, value }
    },
    template: `
      <Stat label="Attendance right now" :value="value" :options="{ style: 'percent' }" :series="series" trend-tone="neutral" description="Updates every second" />`,
  }),
}

/** Weekly attendance read one bar at a time, inline rather than at a Card's foot: the last bar
 * carries the tone, the rest sit quieter, and it still keeps the library's own spring and scrub. */
export const BarsVariant: Story = {
  args: {
    label: 'Attendance',
    value: 0.91,
    options: { style: 'percent' },
    trend: -4,
    trendTone: 'negative',
    series: [0.97, 0.96, 0.95, 0.93, 0.92, 0.94, 0.93, 0.91],
    labels: weeks,
    variant: 'bars',
    description: 'Last eight weeks',
  },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A large number keeps its digits lined up, formatted for the locale. */
export const LongValue: Story = {
  args: { label: 'Total minutes studied', value: 1284932, options: {}, trend: undefined },
}

/** Nothing known yet: no trend, and a description says why. */
export const EmptyValue: Story = {
  args: { label: 'Attendance', value: '—', trend: undefined, description: 'No sessions logged yet' },
}

/** A series with one reading: a dot, no line to draw. */
export const SinglePointSeries: Story = {
  args: { label: 'Attendance', value: 0.94, series: [0.94], trend: undefined },
}

/** A series that never moved: a flat line down the middle, not a division by zero. */
export const FlatSeries: Story = {
  args: {
    label: 'Attendance',
    value: 0.9,
    series: [0.9, 0.9, 0.9, 0.9, 0.9],
    trend: 0,
    trendTone: 'neutral',
  },
}

/** On a phone, StatGroup wraps to the next line instead of squeezing; a Card with a `foot` chart
 * keeps bleeding to its own edges rather than the row's. */
export const PhoneWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => ({
    components: { Card, Stat, StatGroup },
    setup: () => ({ attendance: [0.97, 0.95, 0.93, 0.92, 0.91] }),
    template: `
      <StatGroup class="max-w-xs">
        <Card class="w-full">
          <Stat label="Attendance" :value="0.91" :options="{ style: 'percent' }" :trend="-4" trend-tone="negative" :series="attendance" variant="bars" foot />
        </Card>
        <Stat label="Average grade" :value="7.6" :trend="6" trend-tone="positive" />
        <Stat label="Enrolled" :value="128" />
      </StatGroup>`,
  }),
}
