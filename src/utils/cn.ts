import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The type scale's sizes (tokens.css), so `text-title` is read as a size, not a colour that
// `text-fg` would override.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ['display', 'title', 'copy', 'label', 'ui', 'meta'] } },
})

/** Joins class values and lets later Tailwind classes override conflicting earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
