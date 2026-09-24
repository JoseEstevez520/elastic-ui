import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface MorphHeaderContext {
  open: Readonly<Ref<boolean>>
  close: () => void
}

/** Where the nav is being rendered: in the bar on desktop, or in the open panel on mobile. */
export type MorphHeaderPlacement = 'inline' | 'panel'

const MorphHeaderContextKey: InjectionKey<MorphHeaderContext> = Symbol('MorphHeaderContext')
const MorphHeaderPlacementKey: InjectionKey<MorphHeaderPlacement> = Symbol('MorphHeaderPlacement')

export function provideMorphHeaderContext(context: MorphHeaderContext) {
  provide(MorphHeaderContextKey, context)
}

export function useMorphHeaderContext(): MorphHeaderContext {
  const context = inject(MorphHeaderContextKey, null)
  if (!context) throw new Error('MorphHeader parts must be used inside <MorphHeader>.')
  return context
}

export function provideMorphHeaderPlacement(placement: MorphHeaderPlacement) {
  provide(MorphHeaderPlacementKey, placement)
}

export function useMorphHeaderPlacement(): MorphHeaderPlacement {
  return inject(MorphHeaderPlacementKey, 'inline')
}
