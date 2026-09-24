/**
 * The island is the page's text colour turned into a surface, so it stands out in either theme
 * without a colour of its own: dark on a light page, light on a dark one.
 */
export const dynamicIslandClass = [
  'relative overflow-hidden',
  'bg-[color:var(--island-bg,var(--color-fg))] text-[color:var(--island-fg,var(--color-bg))] shadow-overlay',
  'transition-[width,height,border-radius] ease-emphasized motion-reduce:transition-none',
]

/** Held at the top of the screen, in the middle. */
export const dynamicIslandFloatingClass = 'fixed top-3 left-1/2 z-50 -translate-x-1/2'

/** Each state's content, centred in the island while the shape travels to its size. */
export const dynamicIslandContentClass = 'col-start-1 row-start-1 w-max'
