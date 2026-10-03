import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Award, Medal, Trophy } from '@lucide/vue'
import Marquee from './Marquee.vue'
import MarqueeItem from './MarqueeItem.vue'

const RESULTS = [
  { icon: Trophy, outcome: 'Winner', event: 'Regional hackathon', year: '2026' },
  { icon: Medal, outcome: '2nd place', event: 'Science challenge', year: '2026' },
  { icon: Award, outcome: 'Selected', event: 'Research fellowship', year: '2025' },
  { icon: Trophy, outcome: 'Finalist', event: 'Startup weekend', year: '2025' },
  { icon: Medal, outcome: '3rd place', event: 'Open data contest', year: '2024' },
  { icon: Award, outcome: 'Mentioned', event: 'Student design awards', year: '2024' },
]

interface BandArgs {
  size: 'sm' | 'md' | 'lg'
  speed: number
  /** How many entries the band holds. */
  count: number
  icons: boolean
  /** Swaps in an entry far longer than the column. */
  longText: boolean
  /** Renders two bands, one after the other. */
  bands: number
}

// `args` stays reactive, so the Controls panel updates the band without remounting it.
const band = (args: BandArgs) => ({
  components: { Marquee, MarqueeItem },
  setup: () => ({
    args,
    results: () => RESULTS.slice(0, args.count),
    event: (result: (typeof RESULTS)[number]) =>
      args.longText ? `${result.event}, held over three days with teams from every school in the region` : result.event,
  }),
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-10 py-10">
      <Marquee v-for="n in args.bands" :key="n" label="Results" :size="args.size" :speed="args.speed">
        <MarqueeItem v-for="result in results()" :key="result.outcome + result.event" :icon="args.icons ? result.icon : undefined">
          {{ result.outcome }} · {{ event(result) }} {{ result.year }}
        </MarqueeItem>
      </Marquee>
    </div>`,
})

const meta = {
  title: 'Content/Marquee',
  args: { size: 'md', speed: 40, count: 3, icons: true, longText: false, bands: 1 },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    speed: { control: { type: 'range', min: 10, max: 120, step: 5 } },
    count: { control: { type: 'range', min: 1, max: RESULTS.length, step: 1 } },
    bands: { control: { type: 'range', min: 1, max: 2, step: 1 } },
  },
  render: (args) => band(args),
} satisfies Meta<BandArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The largest, for the few results a page leads with. */
export const Large: Story = {
  args: { size: 'lg' },
}

/** Words alone, for a list of names (clients, a stack) with no mark of their own. */
export const WithoutIcons: Story = {
  args: { icons: false, size: 'sm' },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const SingleItem: Story = {
  args: { count: 1 },
}

export const TwoItems: Story = {
  args: { count: 2 },
}

export const ManyItems: Story = {
  args: { count: RESULTS.length },
}

export const LongText: Story = {
  args: { longText: true },
}

export const TwoBands: Story = {
  args: { bands: 2 },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
