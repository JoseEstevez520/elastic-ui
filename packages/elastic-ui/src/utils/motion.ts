import { computed, shallowRef } from 'vue'

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

/**
 * How the library treats motion. `auto` follows the system's reduced-motion setting; `full` always
 * animates, whatever the system says; `none` never does, as reduced motion everywhere. `full` and
 * `none` are for an app that lets its people turn animations on or off themselves.
 */
export type MotionPreference = 'auto' | 'full' | 'none'

// A ref, so the parts' MotionConfig follows a change made from a settings toggle.
const motionPreference = shallowRef<MotionPreference>('auto')

const systemReduces = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * What the page should do, on `<html data-motion="…">` for the CSS: `full`, `none`, or nothing
 * when it animates by default. `none` also when the preference is `auto` and the system asks for
 * reduced motion, so the `motion-reduce:` variant (redefined in tokens.css on this attribute
 * alone: Tailwind takes one rule per variant) needs no media query.
 */
function mirror() {
  if (typeof document === 'undefined') return
  const preference = motionPreference.value
  const effective = preference === 'auto' ? (systemReduces() ? 'none' : undefined) : preference
  if (effective) document.documentElement.dataset.motion = effective
  else delete document.documentElement.dataset.motion
}

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', mirror)
}

/**
 * Sets the motion preference app-wide. `app.use(ElasticUi, { motion: 'full' })` does it at install,
 * and it can be changed later (a settings toggle). The CSS follows it through `<html data-motion>`.
 */
export function setMotionPreference(preference: MotionPreference) {
  motionPreference.value = preference
  mirror()
}

export function getMotionPreference() {
  return motionPreference.value
}

export function prefersReducedMotion() {
  if (motionPreference.value === 'full') return false
  if (motionPreference.value === 'none') return true
  return systemReduces()
}

/** The preference as motion-v's `MotionConfig` reads it: `<MotionConfig :reduced-motion="…">`. */
const REDUCED_MOTION = { full: 'never', none: 'always', auto: 'user' } as const

export function useReducedMotion() {
  return computed(() => REDUCED_MOTION[motionPreference.value])
}

/**
 * Runs after the browser has painted the current state: for a change that should animate from
 * what just appeared, since a change in the same frame would simply land.
 */
export function afterPaint(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback))
}
