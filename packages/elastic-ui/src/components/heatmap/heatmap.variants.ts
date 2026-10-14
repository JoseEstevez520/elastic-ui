export type HeatmapTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export const heatColor: Record<HeatmapTone, string> = {
  neutral: 'var(--color-fg)',
  accent: 'var(--color-accent)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
}

/**
 * Nothing, then three steps of one hue. The steps start at 55%: on the tray tone a lighter first
 * step reads as the empty one (about 2.3:1 against it, rising to 3.8:1 for the last, in light).
 */
export const heatLevelClass = [
  'bg-surface',
  'bg-[color-mix(in_oklab,var(--heat)_55%,var(--color-surface))]',
  'bg-[color-mix(in_oklab,var(--heat)_75%,var(--color-surface))]',
  'bg-[color-mix(in_oklab,var(--heat)_95%,var(--color-surface))]',
]

/** Where a value falls: `none` for a cell nothing measured, 0 for none of it, 1 to 3 by thirds of `max`. */
export function heatLevel(value: number | null, max: number): 'none' | 0 | 1 | 2 | 3 {
  if (value === null) return 'none'
  if (value <= 0 || max <= 0) return 0
  const share = value / max
  return share <= 1 / 3 ? 1 : share <= 2 / 3 ? 2 : 3
}
