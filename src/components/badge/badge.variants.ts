import { cva, type VariantProps } from 'class-variance-authority'

/** A small label for a status or a tag. Colors read `--badge-*` first. */
export const badgeVariants = /* @__PURE__ */ cva(
  'group/badge inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap outline-none focus-ring',
  {
    variants: {
      variant: {
        soft: [
          'bg-[color:var(--badge-bg,var(--color-bg-muted))]',
          'text-[color:var(--badge-fg,var(--color-fg-secondary))]',
        ],
        outline: [
          'border border-[color:var(--badge-border,var(--color-border))]',
          'text-[color:var(--badge-fg,var(--color-fg-secondary))]',
        ],
        solid: [
          'bg-[color:var(--badge-bg,var(--color-accent))]',
          'text-[color:var(--badge-fg,var(--color-accent-fg))]',
        ],
      },
      size: {
        sm: 'h-5 gap-1 px-2 text-[11px]',
        md: 'h-6 gap-1.5 px-2.5 text-xs',
      },
      // Folded to its icon or dot, the badge closes up round it; the gap folds with the label.
      compact: { true: 'gap-0 cursor-default', false: '' },
    },
    // Folded, a circle just round a 14px icon; the label brings its own room when it unfolds.
    compoundVariants: [
      { compact: true, size: 'sm', class: 'px-[3px]' },
      { compact: true, size: 'md', class: 'px-[5px]' },
    ],
    defaultVariants: { variant: 'soft', size: 'md', compact: false },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>

/**
 * The label. Compact, it is folded to nothing beside the icon and unfolds on hover or focus, its
 * room opening while the text comes into focus, the way the Sidebar's labels come back; it folds
 * away faster than it opened.
 */
export const badgeLabelVariants = /* @__PURE__ */ cva('', {
  variants: {
    compact: {
      true: [
        'max-w-0 overflow-hidden opacity-0 blur-[2px]',
        '[transition:max-width_250ms_var(--ease-emphasized),margin_250ms_var(--ease-emphasized),opacity_120ms_linear,filter_120ms_linear]',
        'group-hover/badge:mr-1 group-hover/badge:ml-1.5 group-hover/badge:max-w-48 group-hover/badge:opacity-100 group-hover/badge:blur-0',
        'group-focus-visible/badge:mr-1 group-focus-visible/badge:ml-1.5 group-focus-visible/badge:max-w-48 group-focus-visible/badge:opacity-100 group-focus-visible/badge:blur-0',
        'group-hover/badge:[transition:max-width_350ms_var(--ease-emphasized),margin_350ms_var(--ease-emphasized),opacity_450ms_var(--ease-soft)_80ms,filter_450ms_var(--ease-soft)_80ms]',
        'group-focus-visible/badge:[transition:max-width_350ms_var(--ease-emphasized),margin_350ms_var(--ease-emphasized),opacity_450ms_var(--ease-soft)_80ms,filter_450ms_var(--ease-soft)_80ms]',
        'motion-reduce:transition-none',
      ],
      false: '',
    },
  },
})

/** A small round target, quiet until hovered. */
export const badgeRemoveClass = [
  '-mr-1 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-60',
  'transition-[opacity,background-color] duration-150 hover:bg-[color:color-mix(in_srgb,currentColor_12%,transparent)] hover:opacity-100',
  'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent',
]

/**
 * A count's digits, trimmed to the digits themselves (from the cap height to the baseline): a
 * font leaves more room above its glyphs than below, so an untrimmed number sits low in its box.
 */
export const badgeCountDigitsClass = 'leading-none tabular-nums [text-box:trim-both_cap_alphabetic]'

/** A single digit makes a circle; more widen it into a pill. */
export const badgeCountVariants = /* @__PURE__ */ cva('justify-center px-1.5', {
  variants: { size: { sm: 'min-w-5', md: 'min-w-6' } },
  defaultVariants: { size: 'md' },
})
