export type StateStripTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface StateStripItem {
  key: string
  /** When it was, written as the reader should see it: "10:30". */
  time?: string
  /** What state it was in, in words: the cell's name for screen readers and the line above the strip. */
  label: string
  tone: StateStripTone
  /** A thing worth noticing beyond the state itself, said in words. The cell carries a bar for it. */
  flag?: string
}
