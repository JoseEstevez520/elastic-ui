import { CheckIcon, ExclamationIcon, MinusIcon } from '../../icons/internal'
import type { ImageRegionTone } from './image-regions.types'

export const regionColor: Record<ImageRegionTone, string> = {
  neutral: 'var(--color-fg-muted)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
}

export const regionIcon = {
  neutral: MinusIcon,
  success: CheckIcon,
  warning: ExclamationIcon,
  danger: ExclamationIcon,
} as const
