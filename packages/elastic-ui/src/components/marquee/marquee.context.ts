import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { MarqueeSize } from './marquee.variants'

export interface MarqueeContext {
  size: Readonly<Ref<MarqueeSize>>
}

const MarqueeContextKey: InjectionKey<MarqueeContext> = Symbol('MarqueeContext')

export function provideMarqueeContext(context: MarqueeContext) {
  provide(MarqueeContextKey, context)
}

/** Items rendered outside a band fall back to the default size. */
export function useMarqueeContext(): MarqueeContext {
  return inject(MarqueeContextKey, { size: ref('md') })
}
