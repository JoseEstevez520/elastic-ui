import { inject, provide, shallowRef, type InjectionKey, type ShallowRef } from 'vue'

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

/** A queue of toasts, read by the one Toaster that shows them. */
export interface ToastStore {
  toasts: ShallowRef<Toast[]>
  /** Shows a toast and returns its id, to dismiss it early. */
  toast: (options: ToastOptions) => number
  dismiss: (id: number) => void
}

let nextId = 1

/**
 * A queue of its own, for a Toaster given it as `store`. An app needs none: its one Toaster reads
 * the app's queue, which `toast()` fills from anywhere. Several Toasters on one page (examples side
 * by side) each take their own, or every one of them would show every toast.
 */
export function createToastStore(): ToastStore {
  // Replaced, never mutated, so a watcher on it sees every change.
  const toasts = shallowRef<Toast[]>([])
  return {
    toasts,
    toast(options) {
      const id = nextId++
      toasts.value = [...toasts.value, { ...options, id }]
      return id
    },
    dismiss(id) {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    },
  }
}

/** The app's queue, read by a Toaster given no `store`. */
const appStore = createToastStore()

/** Shows a toast on the app's Toaster and returns its id, to dismiss it early. */
export const toast = appStore.toast
export const dismissToast = appStore.dismiss

const toastStoreKey: InjectionKey<ToastStore> = Symbol('toast-store')

/** Makes `store` the one `useToasts()` returns below this component. */
export function provideToasts(store: ToastStore) {
  provide(toastStoreKey, store)
}

/** The nearest provided queue (`provideToasts`), or the app's. */
export function useToasts(): ToastStore {
  return inject(toastStoreKey, appStore)
}
