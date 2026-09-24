/** The easing behind every morph in the library. Mirrors `--ease-emphasized` in tokens.css. */
export const EASE_EMPHASIZED = [0.22, 1, 0.36, 1] as const

/** Mirrors `--ease-soft` in tokens.css: for content fading in. */
export const EASE_SOFT = [0.25, 0.1, 0.25, 1] as const

/** Mirrors `--ease-glide` in tokens.css. */
export const EASE_GLIDE = [0.38, 0.49, 0, 1] as const

/** An ease as a CSS `cubic-bezier()`, for the Web Animations API and inline styles. */
export const bezier = (ease: readonly number[]) => `cubic-bezier(${ease.join(',')})`

export const morphTransition = { type: 'tween', duration: 0.52, ease: EASE_EMPHASIZED } as const

/**
 * Closing is faster than opening: on the way in the eye follows where things come from, on the
 * way out it only wants them gone (Material: exits shorter than entrances).
 */
export const morphCloseTransition = { type: 'tween', duration: 0.3, ease: EASE_EMPHASIZED } as const

/** Content fading in once a morph is mostly done, and out before it starts back. */
export const contentIn = { duration: 0.22, delay: 0.3, ease: 'linear' } as const
export const contentOut = { duration: 0.16, ease: 'linear' } as const

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
