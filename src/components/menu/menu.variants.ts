/**
 * Menus share the Popover's surface (`floatingPanelClass`) and its soft shadow. The items come in
 * as one wave from the trigger outwards, as Select's options do; a menu long enough to scroll
 * skips it, since it may open anywhere down its list.
 */
export const menuContentClass = [
  'shadow-soft min-w-[max(11rem,var(--reka-dropdown-menu-trigger-width,0px))] max-w-[var(--reka-dropdown-menu-content-available-width)]',
  'max-h-[var(--reka-dropdown-menu-content-available-height)] overflow-y-auto overscroll-contain scrollbar-subtle',
]

export const menuListClass = 'p-1 stagger-items [--stagger-delay:0.05s] [&:has(>:nth-child(9))>*]:animate-none'

const item = [
  'relative flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] py-1.5 text-ui outline-none select-none',
  'data-[highlighted]:bg-bg-muted',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
]

export const menuItemClass = [item, 'px-2.5']

/** Room on the left for the check or dot, so items line up whether chosen or not. */
export const menuChoiceItemClass = [item, 'pr-2.5 pl-8']

export const menuIndicatorClass = 'absolute left-2.5 flex items-center'

export const menuIconClass = 'size-4 shrink-0 text-fg-muted'

export const menuShortcutClass = 'ml-auto pl-4 text-meta tracking-widest text-fg-faint'

export const menuLabelClass = 'px-2.5 pt-2 pb-1 text-meta text-fg-muted'

export const menuSeparatorClass = '-mx-1 my-1 h-px bg-border'
