/** How the data is drawn: joined by a line, as bars over categories, or as loose points. */
export type ChartVariant = 'line' | 'bars' | 'points'

export type ChartScaleType = 'linear' | 'log'

/** One value. `x` is a number, or a category's name for bars (and for a line over categories). */
export interface ChartPoint {
  x: number | string
  y: number
  /** A name written by the point on the drawing, where it fits; it is always in the tooltip. */
  label?: string
}

export interface ChartSeries {
  name: string
  points: ChartPoint[]
  /** Any CSS colour, the same for the same concept on every page; otherwise its place in the palette. */
  color?: string
}

export interface ChartAxis {
  /** What the axis measures, written by it: "Cost", "Score". */
  title?: string
  /** Its unit, after the title in brackets and after every value read out: "USD", "%". */
  unit?: string
  /** `log` for values spanning several orders of magnitude; only values above zero are drawn. */
  scale?: ChartScaleType
  min?: number
  max?: number
  /** Writes a value of this axis, for ticks and readouts alike. */
  format?: (value: number) => string
}
