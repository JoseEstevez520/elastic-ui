import { cva } from 'class-variance-authority'

/** A soft track holding the options side by side. */
export const segmentedControlClass = [
  'relative isolate inline-flex w-fit items-center gap-0.5 rounded-full p-1',
  'bg-[color:var(--segmented-bg,var(--color-bg-muted))]',
]

/** The selected option's surface, lifted a little off the track. */
export const segmentedControlIndicatorClass = [
  'pointer-events-none absolute inset-y-1 left-0 -z-10 rounded-full shadow-soft',
  'bg-[color:var(--segmented-indicator,var(--color-bg))]',
]

export const segmentedControlItemVariants = /* @__PURE__ */ cva(
  [
    'flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap outline-none',
    'transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      checked: { true: 'text-fg', false: 'text-fg-muted hover:text-fg-secondary' },
    },
  },
)
