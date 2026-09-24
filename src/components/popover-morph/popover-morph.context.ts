import { inject, provide, type InjectionKey } from 'vue'

export interface PopoverMorphContext {
  close: () => void
}

const PopoverMorphContextKey: InjectionKey<PopoverMorphContext> = Symbol('PopoverMorphContext')

export function providePopoverMorphContext(context: PopoverMorphContext) {
  provide(PopoverMorphContextKey, context)
}

export function usePopoverMorphContext(): PopoverMorphContext {
  const context = inject(PopoverMorphContextKey, null)
  if (!context) throw new Error('PopoverMorph parts must be used inside <PopoverMorph>.')
  return context
}
