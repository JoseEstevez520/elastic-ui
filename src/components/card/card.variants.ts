import { cva, type VariantProps } from 'class-variance-authority'

/**
 * The card pads vertically and spaces its children with `gap`; each part pads itself
 * horizontally. That keeps any order of parts, and any custom markup between them, aligned.
 */
export const cardVariants = cva(
  'flex flex-col overflow-hidden rounded-[var(--card-radius,var(--radius-xl))] text-fg',
  {
    variants: {
      variant: {
        default: [
          'border border-[color:var(--card-border,var(--color-border))]',
          'bg-[color:var(--card-bg,var(--color-bg))]',
        ],
        outline: 'border border-[color:var(--card-border,var(--color-border))] bg-transparent',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'gap-4 py-4',
        md: 'gap-6 py-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export const cardSectionVariants = cva('', {
  variants: {
    size: {
      sm: 'px-4',
      md: 'px-6',
    },
  },
})

/** An image at either end of the card cancels the card's vertical padding to sit flush. */
export const cardImageVariants = cva('block w-full object-cover', {
  variants: {
    size: {
      sm: 'first:-mt-4 last:-mb-4',
      md: 'first:-mt-6 last:-mb-6',
    },
  },
})

export const cardTitleVariants = cva('font-semibold leading-tight tracking-tight text-fg', {
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
    },
  },
})

export type CardVariants = VariantProps<typeof cardVariants>
export type CardSize = NonNullable<CardVariants['size']>
