import { cva, type VariantProps } from 'class-variance-authority'

const surfacePaint =
  'border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-surface-raised))]'

/**
 * The surface is the trigger's box at rest and the panel when open. It is pinned to the corner
 * the panel opens from, so it grows away from the trigger, and clips the panel while it grows.
 * Near a screen's edge it also moves sideways as it grows, onto the panel's place. A ghost
 * trigger's surface is bare at rest and takes on the panel's tone and edge as it grows.
 */
export const popoverMorphSurfaceVariants = /* @__PURE__ */ cva(
  [
    'absolute overflow-hidden border',
    'transition-[width,height,translate,border-radius,box-shadow,background-color,border-color] ease-emphasized motion-reduce:transition-none',
  ],
  {
    variants: {
      variant: { outline: surfacePaint, ghost: '' },
      align: { start: 'left-0', end: 'right-0' },
      side: { bottom: 'top-0', top: 'bottom-0' },
      open: {
        // Opening lets the eye follow the shape; closing only wants it gone.
        true: 'rounded-[var(--popover-radius,var(--radius-lg))] shadow-overlay duration-[350ms]',
        false: 'rounded-[var(--button-radius,var(--radius-md))] duration-300',
      },
    },
    compoundVariants: [
      { variant: 'ghost', open: true, class: surfacePaint },
      { variant: 'ghost', open: false, class: 'border-transparent' },
    ],
    defaultVariants: { variant: 'outline' },
  },
)

/**
 * Pinned to the same corner as the surface, at its own full size, so growing never reflows it. It
 * never leaves its place on the screen: when the surface moves sideways, the panel moves back by
 * as much, on the same curve, so it is uncovered where it stands. It keeps the screen's margin
 * on both sides, and `fluid` fills the width between them on a phone.
 */
export const popoverMorphPanelVariants = /* @__PURE__ */ cva(
  [
    'absolute w-[min(var(--popover-width,18rem),100vw_-_2rem)] max-h-[70dvh] overflow-y-auto overscroll-contain scrollbar-subtle',
    'text-ui text-fg outline-none motion-reduce:transition-none',
  ],
  {
    variants: {
      align: { start: 'left-0', end: 'right-0' },
      side: { bottom: 'top-0', top: 'bottom-0' },
      open: {
        true: 'transition-[translate] duration-[350ms] ease-emphasized',
        // Leaves at once. Once faded it turns invisible, so find-in-page skips it, yet keeps its
        // box to be measured.
        false: [
          'invisible opacity-0',
          '[transition:opacity_150ms,visibility_150ms,translate_300ms_var(--ease-emphasized)]',
        ],
      },
      fluid: { true: 'max-sm:w-[calc(100vw_-_2rem)]', false: '' },
      /** A menu's items come in one by one (see `popoverMorphListClass`); other content by block. */
      menu: { true: 'p-1', false: 'p-4' },
    },
    compoundVariants: [
      // Comes into focus as one wave once the shape is on its way.
      { open: true, menu: false, class: 'stagger-children [--stagger-delay:0.1s]' },
    ],
  },
)

/** A menu's items, coming into focus one by one as the shape grows (see `stagger-items`). */
export const popoverMorphListClass = 'stagger-items [--stagger-delay:0.1s]'

/**
 * Looks like a Button at rest: an outline one by default, or a ghost one for a quiet bar, which
 * only takes on its box as it grows into the panel (as DialogMorph's).
 */
export const popoverMorphTriggerVariants = /* @__PURE__ */ cva(
  [
    'relative z-10 inline-flex cursor-pointer items-center justify-center gap-2 text-label whitespace-nowrap',
    'rounded-[var(--button-radius,var(--radius-md))] motion-reduce:transition-none',
    '[&_svg]:size-4 [&_svg]:shrink-0',
    'focus-ring',
  ],
  {
    variants: {
      variant: {
        outline: 'text-fg',
        ghost: 'text-fg-secondary hover:bg-bg-muted hover:text-fg',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  },
)

export type PopoverMorphTriggerVariants = VariantProps<typeof popoverMorphTriggerVariants>

/**
 * The label blurs out at once as the box opens, and comes back into focus only once the box has
 * nearly folded back around it, so it never shows inside a box still shrinking. A ghost
 * trigger's hover keeps a Button's quick pace, whatever the label is doing.
 */
export const popoverMorphLabelState = {
  open: 'pointer-events-none opacity-0 blur-[2px] [transition:opacity_150ms_var(--ease-soft),filter_150ms_var(--ease-soft)]',
  closed: [
    '[transition:opacity_300ms_var(--ease-soft)_180ms,filter_300ms_var(--ease-soft)_180ms,background-color_150ms,color_150ms]',
  ],
}

/**
 * A menu item, as a MenuItem looks. Highlighted on hover and on focus, since the arrow keys move
 * the focus from item to item.
 */
export const popoverMorphItemClass = [
  'flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-ui outline-none select-none',
  'hover:bg-bg-muted focus-visible:bg-bg-muted',
  'aria-disabled:pointer-events-none aria-disabled:opacity-50',
]

export type PopoverMorphVariants = VariantProps<typeof popoverMorphSurfaceVariants>
