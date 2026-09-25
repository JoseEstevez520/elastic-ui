import type { LinkTo } from '../../utils/link'

/** A page a crumb or a sibling goes to: the router's `to`, or a plain `href`. */
export interface BreadcrumbsPage {
  label: string
  to?: LinkTo
  href?: string
}

/** One level of the path. Its siblings are the other pages at the same level, to jump across. */
export interface BreadcrumbsItem extends BreadcrumbsPage {
  siblings?: BreadcrumbsPage[]
}

/**
 * A row that never wraps: when it runs short it scrolls, held at its end so the current page
 * always shows, the crumbs above it sliding out of sight behind a fading edge. Padded and pulled
 * back by the same, so the focus ring around a crumb is not clipped by the scrolling.
 */
export const breadcrumbsListClass =
  '-m-1 flex min-w-0 items-center gap-1 overflow-x-auto p-1 text-sm [scrollbar-width:none]'

export const breadcrumbsItemClass = 'flex shrink-0 items-center gap-1'

/** A crumb above the current page: quiet until pointed at. */
export const breadcrumbsLinkClass = [
  'shrink-0 rounded-[var(--radius-sm)] whitespace-nowrap text-fg-muted transition-colors duration-150 hover:text-fg',
  'focus-ring',
]

/** The page you are on: not a link. */
export const breadcrumbsCurrentClass = 'font-medium whitespace-nowrap text-fg'

export const breadcrumbsSeparatorClass = 'size-3.5 shrink-0 text-fg-faint'

/**
 * A separator that opens the pages at the next level, as the path bar in macOS's Finder does: it
 * turns down while its menu is open.
 */
export const breadcrumbsSiblingsTriggerClass = [
  'group/siblings flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-fg-faint',
  'transition-colors duration-150 hover:bg-bg-muted hover:text-fg data-[state=open]:text-fg',
  'focus-ring',
]

export const breadcrumbsSiblingsIconClass =
  'size-3.5 transition-[rotate] duration-300 ease-emphasized group-data-[state=open]/siblings:rotate-90 motion-reduce:transition-none'
