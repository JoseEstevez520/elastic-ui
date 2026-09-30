import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface SheetFlowContext {
  /** The step on show, which may trail the one asked for while the last one leaves. */
  shown: Ref<number>
  /** The steps' titles, in the order they are written. */
  titles: Ref<{ id: symbol; title: string }[]>
  next: () => void
  back: () => void
  finish: () => void
}

const key: InjectionKey<SheetFlowContext> = Symbol('SheetFlow')
export const provideSheetFlowContext = (context: SheetFlowContext) => provide(key, context)
export function useSheetFlowContext() {
  const context = inject(key)
  if (!context) throw new Error('SheetFlowStep must be used inside a SheetFlow')
  return context
}
