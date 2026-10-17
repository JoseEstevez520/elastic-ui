import { inject, provide, type InjectionKey } from 'vue'

/** How long the pointer rests on a trigger before its tooltip shows, in ms. */
export const TOOLTIP_DELAY = 400

const TooltipGroupKey: InjectionKey<true> = Symbol('TooltipGroup')

export function provideTooltipGroup() {
  provide(TooltipGroupKey, true)
}

/** Whether a TooltipGroup already provides Reka UI's TooltipProvider around this tooltip. */
export function useInTooltipGroup() {
  return inject(TooltipGroupKey, false)
}
