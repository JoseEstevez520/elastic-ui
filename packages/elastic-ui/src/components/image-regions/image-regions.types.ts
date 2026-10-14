import type { Component } from 'vue'

export type ImageRegionTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface ImageRegion {
  key: string
  /** The region's name, on its card and for screen readers. */
  label: string
  /** The corners, in the image's own coordinates (`width` by `height`). */
  points: [number, number][]
  tone: ImageRegionTone
  /** A line under the name on the card. */
  description?: string
  /** What the mark shows; by default one that matches the tone. */
  icon?: Component
}
