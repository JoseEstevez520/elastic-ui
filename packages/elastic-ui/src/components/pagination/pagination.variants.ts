/**
 * Page numbers are quiet text; the current one is marked by a single surface a tone above the
 * page, which slides from page to page on the library's ease (as Tabs' pill), never re-appearing.
 */
export const paginationClass = 'relative isolate flex items-center gap-1'

export const paginationItemClass = [
  'relative inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-2',
  'text-label tabular-nums text-fg-muted transition-colors duration-150 hover:text-fg focus-ring',
  'data-[selected=true]:text-fg',
]

/** Positioned from the list's left edge; its `x` and width are set by Pagination. */
export const paginationMarkClass =
  'pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-[var(--radius-md)] bg-[color:var(--pagination-mark,var(--color-surface-raised))]'

export const paginationEllipsisClass =
  'inline-flex h-9 min-w-9 items-center justify-center text-label text-fg-faint animate-blur-in motion-reduce:animate-none'

/** Previous and next: quiet chevrons, gone quieter at the ends. */
export const paginationStepClass = [
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-fg-muted',
  'transition-colors duration-150 hover:bg-bg-muted hover:text-fg focus-ring',
  'disabled:pointer-events-none disabled:opacity-40',
]
