import { cva } from 'class-variance-authority'

/** Shared by items and group headers, so both line up and read as one list. */
export const navTreeRowClass = [
  'relative flex w-full cursor-pointer items-center rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-sm',
  'text-fg-secondary transition-colors duration-150 hover:text-fg',
  'focus-ring-inset',
]

export const navTreeIconClass = 'size-4 shrink-0'

/**
 * The label beside its icon. In a sidebar it keeps to one line and folds away to the left as in
 * SkillNet: folding, its letters are erased (SidebarTypewriter), then 180ms later its width and
 * margin close up while the sidebar narrows, leaving the icon centred in the rail. Unfolding, the
 * room opens at once and the letters are written back in. The space before the label is its own
 * margin, which folds with it; a gap would stay and push the icon off centre. A label that is not
 * plain text fades instead.
 */
export const navTreeLabelVariants = /* @__PURE__ */ cva('min-w-0 flex-1', {
  variants: {
    placement: {
      standalone: '[&:not(:first-child)]:ml-2',
      sidebar: [
        'max-w-60 overflow-hidden whitespace-nowrap [&:not(:first-child)]:ml-2.5',
        'transition-[max-width,margin,opacity] duration-300 ease-glide motion-reduce:transition-none',
      ],
      // The room closes 180ms in, once the letters are gone; a label that fades goes at once.
      rail: [
        'max-w-0 overflow-hidden whitespace-nowrap',
        '[transition:max-width_300ms_var(--ease-glide)_180ms,margin_300ms_var(--ease-glide)_180ms,opacity_120ms_linear]',
        'motion-reduce:transition-none',
      ],
    },
    /** For a label that is not plain text and cannot be erased letter by letter. */
    fade: { true: '', false: '' },
    /**
     * A label too long for the row fades out at its end rather than being cut. Off for a group,
     * whose label holds the chevron too: the group fades its text alone.
     */
    edge: { true: '', false: '' },
  },
  compoundVariants: [
    { placement: 'rail', fade: true, class: 'opacity-0' },
    // Kept while folding too, so the edge narrows with the label instead of turning into a cut.
    { placement: ['sidebar', 'rail'], edge: true, class: 'mask-fade-r' },
  ],
  defaultVariants: { edge: true },
})

export type NavTreeLabelPlacement = 'standalone' | 'sidebar' | 'rail'

/**
 * The active item's background; NavTree places and sizes it over the active item. In a
 * `connected` sidebar it runs on to the sidebar's edge as a tab of the page.
 */
export const navTreeIndicatorVariants = /* @__PURE__ */ cva(
  [
    'pointer-events-none absolute top-0 left-0 -z-10',
    '[--tab-color:var(--nav-tree-indicator,var(--color-bg-muted))] bg-[color:var(--tab-color)]',
  ],
  {
    variants: {
      shape: {
        pill: 'rounded-[var(--radius-sm)]',
        tab: 'tab-connected',
      },
    },
  },
)

/** A group's children, indented behind a hairline that shows the level without boxing it. */
export const navTreeChildrenVariants = /* @__PURE__ */ cva(
  'ml-3.5 flex flex-col gap-0.5 border-l border-[color:var(--nav-tree-guide,var(--color-border))] py-0.5 pl-2',
  {
    variants: {
      /**
       * Opened or closed from its header: the children come into focus one by one (see
       * `stagger-items`), following this group's own state only (see `disclosureInnerClass`).
       * Moved by a sidebar folding instead, they are written and erased with the labels, so they
       * take no wave of their own.
       */
      wave: {
        true: [
          '[[data-state=open]>&]:stagger-items',
          '[[data-state=closed]>&]:animate-content-out',
          'motion-reduce:animate-none',
        ],
        false: '',
      },
    },
    defaultVariants: { wave: true },
  },
)

/**
 * A group folded or unfolded by the sidebar rather than from its header: its height moves with
 * the sidebar's width, on the same curve and after the same wait for the letters to go, so the
 * column changes as one sideways movement instead of a disclosure opening downwards.
 */
export const navTreeRailContentClass = [
  'overflow-hidden motion-reduce:animate-none',
  'data-[state=open]:animate-[disclosure-open_320ms_var(--ease-glide)]',
  'data-[state=closed]:animate-[disclosure-close_320ms_var(--ease-glide)_180ms_both]',
]
