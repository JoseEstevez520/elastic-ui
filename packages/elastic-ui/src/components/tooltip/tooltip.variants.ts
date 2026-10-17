/**
 * The Popover's surface, smaller. It grows in from its trigger the first time; moving on to the
 * next tooltip of a group only fades, since it is already expected there.
 */
export const tooltipContentClass = [
  'z-50 max-w-64 px-2.5 py-1.5 text-meta text-fg',
  'rounded-[var(--radius-sm)] border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-surface-raised))] shadow-soft',
  'origin-(--reka-popper-transform-origin)',
  'data-[state=delayed-open]:animate-popover-in data-[state=instant-open]:animate-[fade-in_0.1s_linear]',
  'data-[state=closed]:animate-popover-out motion-reduce:animate-none',
]
