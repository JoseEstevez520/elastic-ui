import { shallowRef } from 'vue'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title: string
  description?: string
  action?: ToastAction
  /** Milliseconds on screen. `Infinity` keeps it until dismissed. Defaults to the Toaster's. */
  duration?: number
  /**
   * What it comes from, usually the button that did what it tells: the toast then comes out of
   * it, growing from its box to its own place, rather than in from the screen's edge.
   */
  from?: Element | null
}

/** Where a toast comes out from: a box on the screen and its corners' radius. */
export interface ToastOrigin {
  top: number
  left: number
  width: number
  height: number
  radius: string
  /** Its colour, which the box starts in and turns from into the toast's. */
  background: string
}

export interface Toast extends Omit<ToastOptions, 'from'> {
  id: number
  origin?: ToastOrigin
}

// One queue for the whole app, read by the one <Toaster>. Replaced, never mutated, so a watcher
// on it sees every change.
const toasts = shallowRef<Toast[]>([])
let nextId = 1

/** Shows a toast and returns its id, to dismiss it early. */
export function toast({ from, ...options }: ToastOptions): number {
  const id = nextId++
  // Read at once: the element may change or go by the time the toast reaches the screen.
  const r = from?.getBoundingClientRect()
  const style = from && getComputedStyle(from)
  const origin =
    r && style
      ? {
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          radius: style.borderRadius,
          background: style.backgroundColor,
        }
      : undefined
  toasts.value = [...toasts.value, { ...options, id, origin }]
  return id
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function useToasts() {
  return { toasts, toast, dismiss: dismissToast }
}
