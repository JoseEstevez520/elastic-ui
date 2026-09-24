import { cva, type VariantProps } from 'class-variance-authority'

/**
 * The surface is the trigger's box at rest and the panel when open. It is pinned to the corner
 * the panel opens from, so it grows away from the trigger, and clips the panel while it grows.
 */
export const popoverMorphSurfaceVariants = cva(
  [
    'absolute overflow-hidden',
    'border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-bg))]',
    'transition-[width,height,border-radius,box-shadow] ease-emphasized motion-reduce:transition-none',
  ],
  {
    variants: {
      align: { start: 'left-0', end: 'right-0' },
      side: { bottom: 'top-0', top: 'bottom-0' },
      open: {
        // Opening lets the eye follow the shape; closing only wants it gone.
        true: 'rounded-[var(--popover-radius,var(--radius-lg))] shadow-overlay duration-[350ms]',
        false: 'rounded-[var(--button-radius,var(--radius-md))] duration-[250ms]',
      },
    },
  },
)

/** Pinned to the same corner as the surface, at its own full size, so growing never reflows it. */
export const popoverMorphPanelVariants = cva(
  'absolute w-[var(--popover-width,18rem)] max-h-[70dvh] overflow-y-auto p-4 text-sm text-fg outline-none',
  {
    variants: {
      align: { start: 'left-0', end: 'right-0' },
      side: { bottom: 'top-0', top: 'bottom-0' },
      open: {
        // Comes into focus as one wave once the shape is on its way; leaves at once. Once faded it
        // turns invisible, so find-in-page skips it, yet keeps its box to be measured.
        true: 'stagger-children [--stagger-delay:0.1s]',
        false: 'invisible opacity-0 transition-[opacity,visibility] duration-150',
      },
    },
  },
)

export const popoverMorphTriggerClass = [
  'relative z-10 inline-flex h-10 cursor-pointer items-center justify-center gap-2 px-4 text-sm font-medium whitespace-nowrap text-fg',
  'rounded-[var(--button-radius,var(--radius-md))]',
  'transition-[opacity,filter] ease-soft motion-reduce:transition-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
]

/**
 * The label blurs out at once as the box opens, and comes back into focus only once the box has
 * nearly folded back around it, so it never shows inside a box still shrinking.
 */
export const popoverMorphLabelState = {
  open: 'pointer-events-none opacity-0 blur-[2px] duration-150',
  closed: 'duration-300 delay-150',
}

export type PopoverMorphVariants = VariantProps<typeof popoverMorphSurfaceVariants>
