export interface HeatmapRow {
  key: string
  label: string
  /** One value per column; `null` where nothing was measured. */
  values: (number | null)[]
}
