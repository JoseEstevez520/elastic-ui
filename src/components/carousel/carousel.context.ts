import { inject, provide, type InjectionKey, type Ref } from 'vue'

interface CarouselContext {
  /** The slides' elements, in the order they stand in the track. */
  slides: Ref<HTMLElement[]>
  register: (el: HTMLElement) => void
  unregister: (el: HTMLElement) => void
  current: Ref<number>
  slideLabel: string
  ofLabel: string
}

const key: InjectionKey<CarouselContext> = Symbol('Carousel')
export const provideCarousel = (context: CarouselContext) => provide(key, context)
export function useCarousel(part: string) {
  const context = inject(key, undefined)
  if (!context) throw new Error(`${part} must be used inside a Carousel`)
  return context
}
