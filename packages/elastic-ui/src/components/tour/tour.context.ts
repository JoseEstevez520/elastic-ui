import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface TourStepMeta {
  target: string
  title: string
  /** Opaque to the library: an app with routes passes what `beforeStep` needs to get there. */
  to?: unknown
  /** The step's slot, rendered as a functional component inside the travelling card. */
  body?: () => unknown
}

export interface TourContext {
  /** The open step's index. */
  active: Ref<number>
  /** The steps in order, so each knows its number and whether it is the last. */
  ids: Readonly<Ref<string[]>>
  /** Each step's own text, keyed by its id. */
  metas: Readonly<Ref<Record<string, TourStepMeta>>>
  register: (id: string, meta: TourStepMeta) => void
  unregister: (id: string) => void
  next: () => void
  back: () => void
  skip: () => void
}

const TourContextKey: InjectionKey<TourContext> = Symbol('TourContext')

export const provideTourContext = (context: TourContext) => provide(TourContextKey, context)

export function useTourContext(): TourContext {
  const context = inject(TourContextKey, null)
  if (!context) throw new Error('TourStep must be used inside <Tour>.')
  return context
}
