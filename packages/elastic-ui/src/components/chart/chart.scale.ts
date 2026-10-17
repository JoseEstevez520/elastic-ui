import type { ChartScaleType } from './chart.types'

/** A numeric axis: where a value lands in pixels, and the round values worth a tick and a line. */
export interface NumericScale {
  (value: number): number
  domain: [number, number]
  ticks: number[]
  /** The gap between two ticks on a linear scale, to choose how many decimals they show. */
  step: number
  type: ChartScaleType
}

// The step between ticks rounded to 1, 2 or 5 times a power of ten (d3's `tickIncrement`), so
// ticks read 0 / 20 / 40, never 0 / 17 / 34.
function niceStep(span: number, count: number): number {
  const raw = span / Math.max(1, count)
  const power = 10 ** Math.floor(Math.log10(raw))
  const error = raw / power
  return power * (error >= 7.07 ? 10 : error >= 3.16 ? 5 : error >= 1.41 ? 2 : 1)
}

// Floating point leaves 0.30000000000000004; ticks are rounded to the step's own decimals.
const roundTo = (value: number, step: number) => {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1)
  return Number(value.toFixed(Math.min(20, decimals)))
}

function linear(min: number, max: number, range: [number, number], count: number, fixed: { min?: number; max?: number }): NumericScale {
  if (min === max) {
    // A single value, or all the same: a span round it so it sits in the middle.
    const pad = min === 0 ? 1 : Math.abs(min) * 0.5
    min -= pad
    max += pad
  }
  const step = niceStep(max - min, count)
  const lo = fixed.min ?? Math.floor(min / step) * step
  const hi = fixed.max ?? Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let t = Math.ceil(lo / step) * step; t <= hi + step * 1e-9; t += step) ticks.push(roundTo(t, step))
  const [r0, r1] = range
  const scale = ((v: number) => r0 + ((v - lo) / (hi - lo || 1)) * (r1 - r0)) as NumericScale
  scale.domain = [lo, hi]
  scale.ticks = ticks
  scale.step = step
  scale.type = 'linear'
  return scale
}

function log(min: number, max: number, range: [number, number], count: number, fixed: { min?: number; max?: number }): NumericScale {
  const lo = fixed.min ?? 10 ** Math.floor(Math.log10(min))
  let hi = fixed.max ?? 10 ** Math.ceil(Math.log10(max))
  if (hi <= lo) hi = lo * 10
  const decades = Math.log10(hi) - Math.log10(lo)
  // Every decade while they fit; 2 and 5 between them when there are only a couple; every other
  // decade (or fewer) when there are too many for the room.
  const every = Math.max(1, Math.ceil(decades / Math.max(1, count)))
  const ticks: number[] = []
  for (let e = Math.ceil(Math.log10(lo) - 1e-9); e <= Math.log10(hi) + 1e-9; e += 1) {
    const decade = 10 ** e
    if (e % every === 0 || every === 1) ticks.push(decade)
    if (decades <= 2 && count >= decades * 3) for (const m of [2, 5]) if (decade * m < hi) ticks.push(decade * m)
  }
  const inDomain = ticks.filter((t) => t >= lo * (1 - 1e-9) && t <= hi * (1 + 1e-9)).sort((a, b) => a - b)
  const [r0, r1] = range
  const l0 = Math.log10(lo)
  const span = Math.log10(hi) - l0 || 1
  const scale = ((v: number) => r0 + ((Math.log10(v) - l0) / span) * (r1 - r0)) as NumericScale
  scale.domain = [lo, hi]
  scale.ticks = inDomain
  scale.step = 0
  scale.type = 'log'
  return scale
}

/**
 * A scale for `values` over `range` pixels with about `count` ticks. Linear extends its domain to
 * round values on each side (and to zero, with `zero`, as bars need); log to whole decades, and
 * only takes values above zero.
 */
export function numericScale(
  values: number[],
  range: [number, number],
  count: number,
  options: { type?: ChartScaleType; min?: number; max?: number; zero?: boolean } = {},
): NumericScale {
  const type = options.type ?? 'linear'
  const usable = type === 'log' ? values.filter((v) => v > 0) : values
  let min = Math.min(...usable)
  let max = Math.max(...usable)
  if (!usable.length) [min, max] = type === 'log' ? [1, 10] : [0, 1]
  if (options.min !== undefined) min = options.min
  if (options.max !== undefined) max = options.max
  if (type === 'log') return log(min, max, range, count, options)
  if (options.zero) {
    min = Math.min(0, min)
    max = Math.max(0, max)
  }
  return linear(min, max, range, count, options)
}

const formats = new Map<string, Intl.NumberFormat>()
function formatter(options: Intl.NumberFormatOptions) {
  const key = JSON.stringify(options)
  let format = formats.get(key)
  if (!format) formats.set(key, (format = new Intl.NumberFormat(undefined, options)))
  return format
}

/** A tick's text: as many decimals as its step needs, and large values compact (12K, 1.5M). */
export function formatTick(value: number, scale: NumericScale): string {
  if (Math.abs(value) >= 10_000) return formatter({ notation: 'compact', maximumFractionDigits: 1 }).format(value)
  if (scale.type === 'log') return formatter({ maximumSignificantDigits: 3 }).format(value)
  const decimals = Math.max(0, -Math.floor(Math.log10(scale.step)))
  return formatter({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

/** A value read out (tooltip, table): up to three significant decimals, never more. */
export function formatValue(value: number): string {
  if (Math.abs(value) >= 10_000) return formatter({ notation: 'compact', maximumFractionDigits: 2 }).format(value)
  return formatter({ maximumFractionDigits: Math.abs(value) < 1 ? 4 : 2 }).format(value)
}
