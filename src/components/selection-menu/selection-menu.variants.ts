/**
 * The band behind the selected text: one rounded piece per line, a little wider and taller
 * than the text, in a tint of the accent with presence (Curio's lesson: a pale wash is not
 * seen). Fades in as it appears, so snapping to whole words never pops.
 */
export const selectionBandClass = [
  'pointer-events-none fixed rounded-[var(--radius-sm)]',
  'bg-[color:var(--selection-bg,color-mix(in_srgb,var(--color-accent)_28%,transparent))]',
  'animate-[fade-in_150ms_var(--ease-out)] motion-reduce:animate-none',
]

/** The bar of actions: the Popover's surface, as a row, appearing from the selection. */
export const selectionBarClass = [
  'fixed z-50 flex items-center gap-0.5 p-1 text-ui text-fg',
  'rounded-[var(--popover-radius,var(--radius-lg))] shadow-soft',
  'border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-bg))]',
  'animate-popover-in motion-reduce:animate-none',
]

export const selectionItemClass = [
  'flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 whitespace-nowrap',
  'text-fg-secondary transition-colors duration-150 hover:bg-bg-muted hover:text-fg',
  'focus-ring-inset',
]
