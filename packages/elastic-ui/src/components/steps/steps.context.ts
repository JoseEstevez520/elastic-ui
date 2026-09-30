import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface StepsContext {
  /** The open step's index; unused when `static`. */
  active: Ref<number>
  isStatic: Readonly<Ref<boolean>>
  /** The items in order, so each knows its number and whether it is the last. */
  ids: Readonly<Ref<string[]>>
}

const StepsContextKey: InjectionKey<StepsContext> = Symbol('StepsContext')

export function provideStepsContext(context: StepsContext) {
  provide(StepsContextKey, context)
}

export function useStepsContext(): StepsContext {
  const context = inject(StepsContextKey, null)
  if (!context) throw new Error('Steps parts must be used inside <Steps>.')
  return context
}

const StepsItemKey: InjectionKey<Readonly<Ref<number>>> = Symbol('StepsItem')

export const provideStepsItem = (index: Readonly<Ref<number>>) => provide(StepsItemKey, index)

export function useStepsItem() {
  const index = inject(StepsItemKey, null)
  if (!index) throw new Error('StepsNext must be used inside <StepsItem>.')
  return index
}
