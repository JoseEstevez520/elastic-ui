import { cva, type VariantProps } from 'class-variance-authority'

/**
 * The card pads vertically and spaces its children with `gap`; each part pads itself
 * horizontally. That keeps any order of parts, and any custom markup between them, aligned.
 */
export const cardVariants = /* @__PURE__ */ cva(
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

export const cardSectionVariants = /* @__PURE__ */ cva('', {
  variants: {
    size: {
      sm: 'px-4',
      md: 'px-6',
    },
  },
})

/** An image at either end of the card cancels the card's vertical padding to sit flush. */
export const cardImageVariants = /* @__PURE__ */ cva('block w-full object-cover', {
  variants: {
    size: {
      sm: 'first:-mt-4 last:-mb-4',
      md: 'first:-mt-6 last:-mb-6',
    },
  },
})

/** A bottom edge that melts into whatever is below, in the same spirit as fading text edges. */
export const imageFade = 'mask-fade-b'

export const cardTitleVariants = /* @__PURE__ */ cva('text-fg', {
  variants: {
    size: {
      sm: 'text-label',
      md: 'text-title',
    },
  },
})

export type CardVariants = VariantProps<typeof cardVariants>
export type CardSize = NonNullable<CardVariants['size']>
