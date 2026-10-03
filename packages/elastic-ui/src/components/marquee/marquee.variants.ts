import { cva, type VariantProps } from 'class-variance-authority'

/**
 * An item's type and icon, by the band's size. One quiet style for the whole entry, in the icon's
 * grey and the reading weight: text passing by gives no time to read a hierarchy of colours and
 * sizes inside a line, so an entry is one thing (as Magic UI's and Aceternity's bands, a word or a
 * logo each), and a band that moves already draws the eye without shouting too.
 */
export const marqueeItemVariants = /* @__PURE__ */ cva(
  'flex shrink-0 items-center whitespace-nowrap pe-[var(--marquee-gap,3rem)] text-fg-muted',
  {
    variants: {
      size: {
        sm: 'gap-2 text-ui',
        md: 'gap-2.5 text-copy',
        lg: 'gap-3 text-title font-normal',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export const marqueeIconVariants = /* @__PURE__ */ cva('shrink-0', {
  variants: {
    size: { sm: 'size-4', md: 'size-4.5', lg: 'size-5' },
  },
  defaultVariants: { size: 'md' },
})

export type MarqueeSize = NonNullable<VariantProps<typeof marqueeItemVariants>['size']>
