import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Joins class values and lets later Tailwind classes override conflicting earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
