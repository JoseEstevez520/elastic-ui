import { h, type FunctionalComponent } from 'vue'

// The library ships no icon set, so the few icons its own parts need are drawn here, on Lucide's
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

export const AlertIcon: FunctionalComponent = () =>
  h('svg', stroke, [h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M12 8v4M12 16h.01' })])

/** A chevron pointing forward: the quietest way to say "go on". */
export const ChevronRightIcon: FunctionalComponent = () => h('svg', stroke, [h('path', { d: 'm9 18 6-6-6-6' })])

/** A rounded square: stop. */
export const StopIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2.5 })])

export const XIcon: FunctionalComponent = () => h('svg', stroke, [h('path', { d: 'M18 6 6 18M6 6l12 12' })])
