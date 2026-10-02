/**
 * The list a SuggestionMenu holds: as wide as its longest item within limits, scrolling past a
 * dozen. Its items are the Menu's own (`menuItemClass`), so a menu and a suggestion read as one
 * family. No wave: the list changes with every key, and it would replay each time.
 */
export const suggestionMenuContentClass =
  'shadow-soft w-max min-w-[13rem] max-w-[min(20rem,var(--reka-popover-content-available-width))] overflow-hidden'

/** The list itself is what scrolls, so keeping the highlighted item in view moves only it. */
export const suggestionMenuListClass =
  'max-h-[min(20rem,var(--reka-popover-content-available-height))] overflow-y-auto overscroll-contain scrollbar-subtle p-1'

export const suggestionMenuEmptyClass = 'px-2.5 py-1.5 text-ui text-fg-muted'
