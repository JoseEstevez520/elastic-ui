/**
 * The surface every floating panel shares (Popover, Select): it fades in while growing from the
 * corner facing its trigger, the transform origin Reka UI computes from the side and alignment.
 * Colors read `--popover-*` first, so one setting restyles every floating panel.
 */
export const floatingPanelClass = [
  'z-50 text-ui text-fg outline-none',
  'rounded-[var(--popover-radius,var(--radius-lg))]',
  'border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-surface-raised))]',
  'origin-(--reka-popper-transform-origin)',
  'data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out motion-reduce:animate-none',
]

export const popoverContentClass = [
  'shadow-soft',
  'w-[var(--popover-width,18rem)] max-w-[var(--reka-popover-content-available-width)]',
  'max-h-[var(--reka-popover-content-available-height)] overflow-y-auto overscroll-contain scrollbar-subtle p-4',
]

/**
 * `fluid`: on a phone the panel fills the screen's width less the margin Reka UI keeps it off the
 * edges with (`collisionPadding`), so a panel a little narrower than the screen does not float
 * beside a sliver of page.
 */
export const popoverFluidClass = 'max-sm:w-[calc(100vw_-_2rem)]'
