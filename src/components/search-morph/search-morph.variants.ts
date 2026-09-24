import { cva } from 'class-variance-authority'

/**
 * An icon button at rest and a field when open: its width grows from the button's to the
 * field's. The icon never moves, it stays where the field's icon sits, so the button reads as
 * opening into the field around it.
 *
 *   plain  as Apple's: no box at all once open, just the icon and the text.
 *   soft   as Vercel's: a faint fill and no border, for a search that needs to read as a field.
 */
export const searchMorphVariants = /* @__PURE__ */ cva(
  [
    'group/search relative h-10 overflow-hidden rounded-[var(--input-radius,var(--radius-md))]',
    'transition-[width,background-color] ease-emphasized motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: { plain: '', soft: '' },
      open: {
        // Opening lets the eye follow; closing only wants it gone.
        true: 'w-[var(--search-width,16rem)] duration-[350ms]',
        // No fill on hover: the icon darkens instead, so nothing box-shaped appears only to widen.
        false: 'w-10 duration-[250ms]',
      },
    },
    compoundVariants: [
      { variant: 'soft', open: true, class: 'bg-[color:var(--search-bg,color-mix(in_srgb,var(--color-bg-muted)_60%,transparent))]' },
    ],
    defaultVariants: { variant: 'plain' },
  },
)

/** Where the field's icon sits, and so where the button's icon is too. */
export const searchMorphIconClass = [
  'pointer-events-none absolute top-1/2 left-[11px] size-4 -translate-y-1/2',
  'text-fg-muted transition-colors duration-150 group-hover/search:text-fg group-focus-within/search:text-fg',
]

/** Comes into focus once the box has grown enough to hold it; leaves at once. */
export const searchMorphInputVariants = /* @__PURE__ */ cva(
  // The browser's own clear button is hidden: the field has its own.
  'h-full w-full bg-transparent pr-9 pl-9 text-sm text-fg outline-none placeholder:text-fg-faint [&::-webkit-search-cancel-button]:appearance-none',
  {
    variants: {
      open: {
        true: 'opacity-100 blur-0 [transition:opacity_300ms_var(--ease-soft)_120ms,filter_300ms_var(--ease-soft)_120ms]',
        false: 'opacity-0 blur-[2px] [transition:opacity_100ms_linear,filter_100ms_linear]',
      },
    },
  },
)

export const searchMorphClearClass = [
  'absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full',
  'text-fg-faint transition-[color,opacity] duration-150 hover:text-fg',
  'focus-visible:outline-2 focus-visible:outline-accent',
]
