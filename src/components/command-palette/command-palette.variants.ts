/** At rest a quiet search button. */
export const commandTriggerClass = [
  'relative inline-flex h-10 cursor-pointer items-center gap-2 pr-4 pl-3 text-sm whitespace-nowrap text-fg-muted',
  'bg-[color:var(--command-bg,var(--color-bg))]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
]

/**
 * Held near the top rather than in the middle, as Raycast and Linear do: the list grows and
 * shrinks downwards while filtering, and the field never moves under the cursor.
 */
export const commandPositionerClass =
  'pointer-events-none fixed inset-0 z-50 flex items-start justify-center p-4 pt-[min(20dvh,8rem)]'

/** Clips instead of scrolling while it grows, as DialogMorph's box does; only the list scrolls. */
export const commandSurfaceClass = [
  'pointer-events-auto relative flex max-h-[min(32rem,80dvh)] w-[min(var(--command-width,36rem),100%)] flex-col overflow-hidden',
  'bg-[color:var(--command-bg,var(--color-bg))] text-fg outline-none',
]

export const commandInputRowClass = 'flex items-center gap-2.5 border-b border-border px-4'

export const commandInputClass =
  'h-12 min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint'

/**
 * Takes the height of its results with the ease of every change of size in the library, instead
 * of jumping, as cmdk does with `--cmdk-list-height`. Height is animated rather than scaled so
 * the items never stretch.
 */
export const commandListClass = [
  'max-h-[var(--command-list-max,min(24rem,60dvh))] overscroll-contain scrollbar-subtle',
  'transition-[height] duration-250 ease-emphasized motion-reduce:transition-none',
]

/**
 * The cap goes into the height itself: easing from a list taller than the cap, a height left
 * above it would spend most of the change out of sight and then shrink all at once.
 */
export const commandListMeasuredClass = 'h-[min(var(--command-list-height),var(--command-list-max,min(24rem,60dvh)))]'

export const commandGroupHeadingClass = 'px-2.5 pt-2 pb-1 text-xs font-medium text-fg-muted'

export const commandItemClass = [
  'relative flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm outline-none select-none',
  'data-[highlighted]:bg-bg-muted',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
]

/** An item coming back as the query changes comes into focus, quicker than the opening wave. */
export const commandItemInClass = 'animate-[blur-in_0.2s_var(--ease-soft)_both] motion-reduce:animate-none'

export const commandIconClass = 'size-4 shrink-0 text-fg-muted'

export const commandShortcutClass = 'ml-auto pl-4 text-xs tracking-widest text-fg-faint'

export const commandEmptyClass =
  'px-2.5 py-8 text-center text-sm text-fg-muted animate-[blur-in_0.2s_var(--ease-soft)_both] motion-reduce:animate-none'
