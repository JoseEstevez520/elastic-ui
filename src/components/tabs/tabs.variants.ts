import { cva, type VariantProps } from 'class-variance-authority'

export const tabsListVariants = /* @__PURE__ */ cva(
  // Scrolls sideways instead of overflowing when the tabs don't fit, as on a phone. `isolate`
  // keeps the indicator's negative z-index above the list's own background.
  'relative isolate flex max-w-full items-center overflow-x-auto [scrollbar-width:none]',
  {
    variants: {
      variant: {
        pill: 'w-fit gap-1',
        underline: 'gap-5',
      },
    },
    defaultVariants: { variant: 'underline' },
  },
)

export const tabsTriggerVariants = /* @__PURE__ */ cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap text-label',
    'text-fg-muted transition-colors duration-150 hover:text-fg data-[state=active]:text-fg',
    'focus-ring-inset',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        pill: 'h-8 rounded-full px-3.5',
        underline: 'h-10',
      },
    },
    defaultVariants: { variant: 'underline' },
  },
)

/** Positioned from the list's left edge; its `x` and width are set by TabsList. */
export const tabsIndicatorVariants = /* @__PURE__ */ cva('pointer-events-none absolute left-0 -z-10', {
  variants: {
    variant: {
      pill: 'inset-y-0 rounded-full bg-[color:var(--tabs-indicator,var(--color-bg-muted))]',
      underline: 'bottom-0 h-0.5 bg-[color:var(--tabs-indicator,var(--color-fg))]',
    },
  },
  defaultVariants: { variant: 'underline' },
})

export type TabsVariants = VariantProps<typeof tabsListVariants>
export type TabsVariant = NonNullable<TabsVariants['variant']>
