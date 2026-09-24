import { cva } from 'class-variance-authority'

/** A section's link: quiet until it is the one being read, indented a step for a subsection. */
export const tocLinkVariants = /* @__PURE__ */ cva(
  [
    'block py-1 text-sm leading-snug transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  ],
  {
    variants: {
      level: { 2: 'pl-4', 3: 'pl-7' },
      active: { true: 'text-fg', false: 'text-fg-muted hover:text-fg-secondary' },
    },
  },
)

/** The track the indicator runs along: a hairline down the list's left edge. */
export const tocTrackClass = 'relative border-l border-[color:var(--toc-track,var(--color-border))]'

/** The mark on the track beside the section being read. */
export const tocIndicatorClass = [
  'pointer-events-none absolute top-0 -left-px w-0.5 rounded-full bg-[color:var(--toc-indicator,var(--color-fg))]',
]
