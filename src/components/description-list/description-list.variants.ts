import { cva, type VariantProps } from 'class-variance-authority'

/** Rows parted by space; `divided` adds a hairline between them for a denser record. */
export const descriptionListVariants = /* @__PURE__ */ cva('flex flex-col', {
  variants: {
    divided: {
      true: 'divide-y divide-[color:var(--description-list-border,var(--color-border))]',
      false: '',
    },
  },
  defaultVariants: { divided: false },
})

export type DescriptionListVariants = VariantProps<typeof descriptionListVariants>

/** Term fixed-width, value filling the rest, on wide screens; stacked on a phone. */
export const descriptionItemClass =
  'grid grid-cols-1 gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-y-0'
