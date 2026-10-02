/**
 * Tells the keyboard apart from the pointer, so a focus ring is drawn only for the keyboard.
 * `:focus-visible` already means that, but a browser may still draw its own ring after a click or a
 * tap (or treat the click as focus-visible). Marking `<html>` with `data-focus` lets the CSS keep
 * the ring for the keyboard and leave every part bare after a press of the mouse or a finger.
 */
let started = false

/** Called by the `ElasticUi` plugin; safe to call more than once, and in server rendering. */
export function startFocusModality() {
  if (started || typeof document === 'undefined') return
  started = true
  const root = document.documentElement
  const mark = (mode: 'pointer' | 'keyboard') => (root.dataset.focus = mode)
  // Capture, so the mark is set before the focus the press or the key is about to move.
  document.addEventListener('pointerdown', () => mark('pointer'), true)
  document.addEventListener('keydown', () => mark('keyboard'), true)
  // Before anything happens, no ring: the pointer is the quieter default.
  mark('pointer')
}
