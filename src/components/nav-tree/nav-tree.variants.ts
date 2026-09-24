/** Shared by items and group headers, so both line up and read as one list. */
export const navTreeRowClass = [
  'relative flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-sm',
  'text-fg-secondary transition-colors duration-150 hover:text-fg',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent',
]

/** The active item's background; NavTree places and sizes it over the active item. */
export const navTreeIndicatorClass = [
  'pointer-events-none absolute top-0 left-0 -z-10 rounded-[var(--radius-sm)]',
  'bg-[color:var(--nav-tree-indicator,var(--color-bg-muted))]',
]

/** A group's children, indented behind a hairline that shows the level without boxing it. */
export const navTreeChildrenClass = [
  'ml-3.5 flex flex-col gap-0.5 border-l border-[color:var(--nav-tree-guide,var(--color-border))] py-0.5 pl-2',
  // Come into focus one by one as the group opens (see `stagger-items` in tokens.css).
  // Follows its own group's state only (see `disclosureInnerClass`).
  '[[data-state=open]>&]:stagger-items',
  '[[data-state=closed]>&]:animate-content-out',
  'motion-reduce:animate-none',
]
