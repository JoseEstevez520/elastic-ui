/**
 * The series' colours, in a fixed order, never cycled: blue, orange, aqua, yellow, each a step for
 * light and one for dark (the data-viz reference palette; blue is the accent in light). Checked
 * against the page's ground, `#f5f5f5` and `#0a0a0a`, for colour-blind readers: every neighbour
 * apart (ΔE ≥ 8.4 under deuteranopia and protanopia), and the first three apart from each other,
 * which is what loose points need. Three of them are under 3:1 on the light ground, so a chart is
 * never read by colour alone: the legend, the names on the drawing and the table say it too.
 * Override with `--chart-1` to `--chart-4`, all together.
 */
const PALETTE = [
  'var(--chart-1, light-dark(#2563eb, #3987e5))',
  'var(--chart-2, light-dark(#eb6834, #d95926))',
  'var(--chart-3, light-dark(#1baf7a, #199e70))',
  'var(--chart-4, light-dark(#eda100, #c98500))',
]

/** One series means nothing by its colour: it stays grey, and the chart's name says what it is. */
const ALONE = 'var(--chart-mono, var(--color-fg-secondary))'

/** Past the palette a series is not given a new hue: it folds into a quiet grey, as "the rest". */
const REST = 'var(--chart-rest, var(--color-fg-faint))'

export function seriesColor(index: number, count: number, own?: string): string {
  if (own) return own
  if (count === 1) return ALONE
  return PALETTE[index] ?? REST
}

/** What sits under the marks, for the ring that keeps overlapping points apart. */
export const SURFACE = 'var(--chart-surface, var(--color-bg))'
