import { cva } from 'class-variance-authority'

/** Pinned to a corner or the middle of an edge, with the page's gutter around it. */
// Never taller than the screen, even with a low `max` and long toasts. Packed against its edge, a
// stack too tall runs off the far side, so the oldest are the ones cut and the newest shows.
export const toasterVariants = /* @__PURE__ */ cva(
  'pointer-events-none fixed z-[100] flex max-h-dvh w-full max-w-sm flex-col overflow-hidden p-4',
  {
    variants: {
      position: {
        'bottom-right': 'right-0 bottom-0 justify-end',
        'bottom-left': 'bottom-0 left-0 justify-end',
        'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 justify-end',
        'top-right': 'top-0 right-0 justify-start',
        'top-left': 'top-0 left-0 justify-start',
        'top-center': 'top-0 left-1/2 -translate-x-1/2 justify-start',
      },
    },
    defaultVariants: { position: 'bottom-right' },
  },
)

export type ToasterPosition = NonNullable<Parameters<typeof toasterVariants>[0]>['position']

/**
 * The page's background and a border, like a Popover, with a lighter shadow: a toast sits over
 * the page for a while, and a deep one would weigh on it.
 */
export const toastClass = [
  'pointer-events-auto relative flex w-full items-start gap-3 p-4 text-ui text-fg',
  'rounded-[var(--toast-radius,var(--radius-lg))]',
  'shadow-[var(--toast-shadow,var(--shadow-soft))]',
  'border border-[color:var(--toast-border,var(--color-border))] bg-[color:var(--toast-bg,var(--color-surface-raised))]',
]
