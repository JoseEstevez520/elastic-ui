import { cva } from 'class-variance-authority'

/**
 * Clips its content while it narrows. Everything in it keeps to one line (labels fold away rather
 * than wrap), so heights never change as the width does. No line sets it apart from the page:
 * its tone does.
 */
export const sidebarVariants = /* @__PURE__ */ cva('shrink-0 overflow-hidden text-fg', {
  variants: {
    variant: {
      plain: 'bg-[color:var(--sidebar-bg,var(--color-bg-subtle))] [--nav-tree-indicator:var(--color-bg-inset)]',
      // The page's own colour for the active tab, so it reads as the page reaching into the column.
      connected: [
        'bg-[color:var(--sidebar-bg,color-mix(in_srgb,var(--color-accent)_7%,var(--color-bg)))]',
        '[--nav-tree-indicator:var(--color-bg)]',
      ],
    },
    mobile: {
      false: 'sticky top-0 h-dvh transition-[width] ease-glide motion-reduce:transition-none',
      // On a phone: a panel over the page, slid in from the left edge and out through it.
      true: [
        'fixed inset-y-0 left-0 z-50 w-[min(var(--sidebar-width,16rem),85vw)] shadow-overlay',
        'transition-transform ease-emphasized motion-reduce:transition-none',
      ],
    },
  },
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
