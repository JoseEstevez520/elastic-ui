import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Heatmap from './Heatmap.vue'
import type { HeatmapRow } from './heatmap.types'

const hours = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`)

// Deterministic, so the story looks the same every time: each product has its bad stretch.
const wave = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}
const shape = (base: number, peak: number, seed: number): number[] =>
  hours.map((_, h) => Math.min(1, base * (0.4 + Math.exp(-((h - peak) ** 2) / 6) * 1.1) + wave(seed * 17 + h) * 0.08))

const rows: HeatmapRow[] = [
  { key: 'dairy', label: 'Dairy', values: shape(0.7, 3, 1) },
  { key: 'fruit', label: 'Fruit', values: shape(0.5, 9, 2) },
  { key: 'bread', label: 'Bread', values: shape(0.3, 3, 3) },
  { key: 'drinks', label: 'Drinks', values: shape(0.2, 9, 4) },
  { key: 'canned', label: 'Canned goods', values: shape(0.08, 3, 5) },
  { key: 'frozen', label: 'Frozen', values: shape(0.25, 9, 6).map((v, h) => (h < 3 ? null : v)) },
]

const meta = {
  title: 'Content/Heatmap',
  component: Heatmap,
  args: {
    rows,
    columns: hours,
    max: 1,
    tone: 'danger',
    label: 'Share of each product that was empty, by hour',
    options: { style: 'percent' },
    describe: (row, column, value) =>
      value === null ? `${row.label} · ${column} · no camera was looking` : `${row.label} · ${column} · ${Math.round(value * 100)}% empty`,
  },
  decorators: [() => ({ template: '<div class="w-[40rem] max-w-full"><story /></div>' })],
} satisfies Meta<typeof Heatmap>
export default meta
type Story = StoryObj<typeof meta>

/** One hue in three steps, for how empty each product was at each hour. A dashed cell is an hour
 * nothing measured. Point at a cell, or Tab into the grid and use the arrow keys, to read it in
 * the line below. The grid arrives as a wave across the hours once it comes into view. */
export const Default: Story = {}

/** Grey until colour means something: with no `tone` the same grid reads as "how much". */
export const Neutral: Story = { args: { tone: 'neutral', describe: undefined, options: { style: 'percent' } } }

/** `success` for what was done rather than what went wrong. */
export const Success: Story = { args: { tone: 'success' } }

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A single row. */
export const OneRow: Story = { args: { rows: [rows[0]!] } }

/** Many rows. */
export const ManyRows: Story = {
  args: { rows: Array.from({ length: 16 }, (_, i) => ({ key: `r${i}`, label: `Product ${i + 1}`, values: shape(0.1 + (i % 6) * 0.12, (i * 3) % 13, i + 7) })) },
}

/** Few columns: the names are all written. */
export const FewColumns: Story = {
  args: { columns: ['Mon', 'Tue', 'Wed', 'Thu'], every: 1, rows: rows.map((r) => ({ ...r, values: r.values.slice(0, 4) })) },
}

/** Nothing to show yet. */
export const NoRows: Story = { args: { rows: [] } }

/** Every value zero: empty cells, not a division by zero. */
export const AllZero: Story = {
  args: { max: undefined, rows: rows.map((r) => ({ ...r, values: r.values.map(() => 0) })) },
}

/** A long row name ends in a fading edge, and a short one keeps every letter. */
export const LongRowNames: Story = {
  args: { rows: [{ key: 'a', label: 'Fresh fruit and vegetables, aisle three', values: shape(0.6, 3, 1) }, rows[2]!] },
}

/** A phone: the cells narrow, the names shrink. */
export const PhoneWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [() => ({ template: '<div class="w-72"><story /></div>' })],
}
