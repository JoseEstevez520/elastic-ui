import { cva, type VariantProps } from 'class-variance-authority'

/** The node's column, then the text, as Steps lays out its numbers and its steps. */
export const timelineItemClass = 'group/timeline grid grid-cols-[0.75rem_1fr] gap-x-4'

/**
 * A hollow node, filled with the page so the line cannot show through it; the text's colour for
 * what is still going on.
 */
export const timelineNodeVariants = /* @__PURE__ */ cva('relative z-10 size-3 shrink-0 rounded-full border', {
  variants: {
    current: {
      true: 'border-fg bg-fg',
      false: 'border-border-strong bg-[color:var(--timeline-bg,var(--color-bg))]',
    },
  },
  defaultVariants: { current: false },
})

export type TimelineNodeVariants = VariantProps<typeof timelineNodeVariants>

/**
 * One unbroken line from this node's centre into the next one's, where that node's fill hides the
 * overlap: a segment stopping short of each node would read as a dashed line. The last draws none.
 */
export const timelineLineClass =
  'absolute left-1/2 top-[0.5lh] -bottom-[0.5lh] w-px -translate-x-1/2 bg-border group-last/timeline:hidden'
