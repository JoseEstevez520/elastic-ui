/**
 * The panel fades in while growing from the corner facing its trigger (the transform origin Reka
 * UI computes from the side and alignment). Colors read `--popover-*` first.
 */
export const popoverContentClass = [
  'z-50 w-[var(--popover-width,18rem)] max-w-[var(--reka-popover-content-available-width)]',
  'max-h-[var(--reka-popover-content-available-height)] overflow-y-auto',
  'p-4 text-sm text-fg outline-none',
  'rounded-[var(--popover-radius,var(--radius-lg))] shadow-overlay',
  'border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-bg))]',
  'origin-(--reka-popover-content-transform-origin)',
  'data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out motion-reduce:animate-none',
]
