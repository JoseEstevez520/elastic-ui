/** Sized like a Button, with the same outline; the chevron turns while the list is open. */
export const selectTriggerClass = [
  'group/trigger inline-flex h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 px-3 text-left text-sm text-fg',
  'rounded-[var(--button-radius,var(--radius-md))] border border-[color:var(--button-border,var(--color-border-strong))]',
  'bg-transparent transition-colors duration-150 hover:bg-bg-muted',
  'data-[placeholder]:text-fg-muted',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  'disabled:pointer-events-none disabled:opacity-50',
]

/** At least as wide as its trigger; scrolls inside when taller than the room left. */
export const selectContentClass = [
  'min-w-(--reka-select-trigger-width) max-w-(--reka-select-content-available-width)',
  'max-h-[min(24rem,var(--reka-select-content-available-height))] overflow-hidden',
]

/** Room on the left for the check, so options line up whether chosen or not. */
export const selectItemClass = [
  'relative flex cursor-pointer items-center rounded-[var(--radius-sm)] py-2 pr-3 pl-8 outline-none select-none',
  'data-[highlighted]:bg-bg-muted',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
]
