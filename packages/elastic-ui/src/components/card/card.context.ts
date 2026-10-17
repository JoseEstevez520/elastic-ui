import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { CardSize } from './card.variants'

export interface CardContext {
  size: Readonly<Ref<CardSize>>
  /** The whole card is a link to another site: its title carries the outward arrow. */
  external?: Readonly<Ref<boolean>>
}

const CardContextKey: InjectionKey<CardContext> = Symbol('CardContext')

export function provideCardContext(context: CardContext) {
  provide(CardContextKey, context)
}

/** Parts rendered outside a card fall back to the default size. */
export function useCardContext(): CardContext {
  return inject(CardContextKey, { size: ref('md') })
}
