import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const DEFAULT_STORAGE_KEY = 'elastic-ui.theme'

// Module-level so every toggle on the page (the header mounts two) shares one theme.
const theme = ref<Theme>('light')
let initialized = false

function readInitial(storageKey: string): Theme {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(value: Theme, storageKey: string) {
  const root = document.documentElement
  // Suspends every transition for two frames, so the whole page swaps at once instead of each
  // element fading at its own speed. See `.theme-switching` in tokens.css.
  root.classList.add('theme-switching')
  root.dataset.theme = value
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
  try {
    localStorage.setItem(storageKey, value)
  } catch {}
}

/** Light/dark theme, applied as `data-theme` on <html> and remembered in localStorage. */
export function useTheme(storageKey = DEFAULT_STORAGE_KEY) {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    theme.value = readInitial(storageKey)
    document.documentElement.dataset.theme = theme.value
    watch(theme, (value) => apply(value, storageKey))
  }

  const toggle = () => (theme.value = theme.value === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
