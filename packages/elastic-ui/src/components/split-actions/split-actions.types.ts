import type { Component } from 'vue'

/** One of SplitActions' actions: its name, its icon, and what it does. */
export interface SplitAction {
  label: string
  icon: Component
  onSelect?: () => void
}

/**
 * How the button splits (SplitActions): `row`, drops beside it; `fan`, drops fanned over a round
 * button; `ring`, a ring of segments round it; `column`, a split pill grown up out of it.
 */
export type SplitActionsLayout = 'row' | 'fan' | 'ring' | 'column'
