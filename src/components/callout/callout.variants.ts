import { cva } from 'class-variance-authority'

/**
 * A soft tint of its colour, no border: set apart by tone, as GitHub's alerts are by a bar. The
 * colour only says what kind of note it is, on the icon and the tint.
 */
export const calloutVariants = cva(
  [
    'grid grid-cols-[auto_1fr] gap-x-3 rounded-[var(--callout-radius,var(--radius-lg))] px-4 py-3 text-sm',
    'bg-[color-mix(in_oklab,var(--callout-color)_var(--callout-tint,7%),transparent)]',
  ],
  {
    variants: {
      type: {
        note: '[--callout-color:var(--callout-note,var(--color-fg))] [--callout-tint:5%]',
        tip: '[--callout-color:var(--callout-tip,var(--color-success))]',
        important: '[--callout-color:var(--callout-important,var(--color-accent))]',
        warning: '[--callout-color:var(--callout-warning,var(--color-warning))]',
        caution: '[--callout-color:var(--callout-caution,var(--color-danger))]',
      },
    },
    defaultVariants: { type: 'note' },
  },
)
