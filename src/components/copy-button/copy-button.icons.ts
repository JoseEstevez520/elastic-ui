import { h, type FunctionalComponent } from 'vue'

// The library ships no icon set, so the two icons this button needs are drawn here, on Lucide's
// 24px grid and stroke so they sit with a project's own icons.
const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
} as const

export const CopyIcon: FunctionalComponent = () =>
  h('svg', stroke, [
    h('rect', { x: 8, y: 8, width: 14, height: 14, rx: 2 }),
    h('path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }),
  ])

export const CheckIcon: FunctionalComponent = () => h('svg', stroke, [h('path', { d: 'M20 6 9 17l-5-5' })])
