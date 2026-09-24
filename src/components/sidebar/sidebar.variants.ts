import { cva } from 'class-variance-authority'

/**
 * Clips its content while it narrows. Everything in it keeps to one line (labels fold away rather
 * than wrap), so heights never change as the width does. No line sets it apart from the page:
 * its tone does, or its own floating surface.
 */
export const sidebarVariants = cva('shrink-0 overflow-hidden text-fg', {
  variants: {
    variant: {
      plain: 'bg-[color:var(--sidebar-bg,var(--color-bg-subtle))] [--nav-tree-indicator:var(--color-bg-inset)]',
      // The page's own colour for the active tab, so it reads as the page reaching into the column.
      connected: [
        'bg-[color:var(--sidebar-bg,color-mix(in_srgb,var(--color-accent)_7%,var(--color-bg)))]',
        '[--nav-tree-indicator:var(--color-bg)]',
      ],
      floating: [
        'rounded-[var(--sidebar-radius,var(--radius-xl))] shadow-soft',
        'border border-[color:var(--sidebar-border,var(--color-border))] bg-[color:var(--sidebar-bg,var(--color-bg))]',
      ],
    },
    mobile: {
      false: 'sticky transition-[width] ease-glide motion-reduce:transition-none',
      // On a phone: a panel over the page, slid in from the left edge and out through it.
      true: 'fixed z-50 w-[min(var(--sidebar-width,16rem),85vw)] transition-transform ease-emphasized motion-reduce:transition-none',
    },
  },
  compoundVariants: [
    { variant: ['plain', 'connected'], mobile: false, class: 'top-0 h-dvh' },
    { variant: ['plain', 'connected'], mobile: true, class: 'inset-y-0 left-0 shadow-overlay' },
    // Held off the edges by the page's gutter, on a phone too.
    { variant: 'floating', mobile: false, class: 'top-2 m-2 h-[calc(100dvh-1rem)]' },
    { variant: 'floating', mobile: true, class: 'inset-y-2 left-2' },
  ],
})

/** Barely there, as in SkillNet: a light veil and a blur, enough to set the panel apart. */
export const sidebarBackdropClass = [
  'fixed inset-0 z-40 bg-[color:var(--sidebar-overlay,rgb(0_0_0/0.1))] backdrop-blur-sm transition-opacity duration-200',
  'motion-reduce:transition-none',
]

/**
 * The header's own content (a logo, a name). As in SkillNet it goes at once when folding starts,
 * its room closing after, and comes back as the sidebar widens.
 */
export const sidebarHeaderClass = [
  'min-w-0 flex-1 overflow-hidden whitespace-nowrap',
  'transition-[max-width,opacity] duration-300 ease-glide motion-reduce:transition-none',
]
export const sidebarHeaderShown = 'max-w-60'
export const sidebarHeaderFolded =
  'max-w-0 opacity-0 [transition:max-width_300ms_var(--ease-glide)_180ms,opacity_100ms_linear]'
