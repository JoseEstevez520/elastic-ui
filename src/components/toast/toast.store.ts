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
}

export interface Toast extends ToastOptions {
  id: number
}

// One queue for the whole app, read by the one <Toaster>. Replaced, never mutated, so a watcher
// on it sees every change.
const toasts = shallowRef<Toast[]>([])
let nextId = 1

/** Shows a toast and returns its id, to dismiss it early. */
export function toast(options: ToastOptions): number {
  const id = nextId++
  toasts.value = [...toasts.value, { ...options, id }]
  return id
}

export function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function useToasts() {
  return { toasts, toast, dismiss: dismissToast }
}
