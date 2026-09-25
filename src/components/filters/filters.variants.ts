import type { Component } from 'vue'

export interface FilterOption {
  value: string
  label: string
  /** How many results it would leave, shown faint beside it. */
  count?: number
}

export interface FilterCategory {
  key: string
  label: string
  icon?: Component
  options: FilterOption[]
}

/** What is chosen, per category: the values of its options. */
export type FilterValue = Record<string, string[]>

export const filtersClass = 'flex flex-wrap items-center gap-2'

/** A page's rows, with the room the command palette's list has. */
export const filtersListClass = 'p-1.5'

/** "Filter by" over the categories, as a menu's group label. */
export const filtersHeadingClass = 'px-2.5 pt-1.5 pb-1 text-xs font-medium text-fg-muted'

/** The way back and the search field, set apart above a hairline. */
export const filtersHeaderClass = 'border-b border-border p-1.5'

/** A category, or the way back from one: a row that leads somewhere. */
export const filtersRowClass = [
  'flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-fg',
  'transition-colors duration-150 hover:bg-bg-muted',
  'focus-ring',
]

export const filtersRowIconClass = 'size-4 shrink-0 text-fg-muted'

/** How many of a category's options are chosen, on its row. */
export const filtersRowCountClass = 'ml-auto text-xs text-fg-muted tabular-nums'

export const filtersOptionClass = 'flex w-full items-center rounded-[var(--radius-sm)] px-2.5 py-2 hover:bg-bg-muted'

export const filtersOptionCountClass = 'ml-auto pl-3 text-xs text-fg-faint tabular-nums'

/**
 * A filter in use, standing beside the button and shaped as it is at rest (PopoverMorph's height,
 * edge, fill and radius), so the row reads as one: the category quiet, the values in the text's
 * colour. Pressing it opens the panel at its category; its cross takes it away.
 */
export const filtersPillClass = [
  'flex h-10 max-w-full min-w-0 items-center text-sm',
  'rounded-[var(--button-radius,var(--radius-md))] border border-[color:var(--popover-border,var(--color-border))]',
  'bg-[color:var(--popover-bg,var(--color-bg))] transition-colors duration-150 hover:border-border-strong',
]

export const filtersPillLabelClass =
  'flex min-w-0 cursor-pointer items-center gap-1.5 self-stretch rounded-[var(--radius-sm)] pr-0.5 pl-3.5 focus-ring'

/**
 * Just the cross, no box of its own: a boxed cross reads as a gap on the right, heavier than the
 * padding on the left. Its drawn edge sits as far in from the pill's as the text does on the other
 * side (the icon draws its cross a quarter in from each side); padding pulled back by the same
 * keeps it easy to press.
 */
export const filtersPillRemoveClass = [
  '-my-1 mr-2 shrink-0 cursor-pointer rounded-[var(--radius-sm)] p-1 text-fg-muted',
  'transition-colors duration-150 hover:text-fg',
  'focus-ring',
]

export const filtersSummaryClass = 'ml-auto flex items-center gap-3 text-sm text-fg-muted'
