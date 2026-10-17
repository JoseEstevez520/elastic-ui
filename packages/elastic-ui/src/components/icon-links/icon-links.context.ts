import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

/** A link's tray at rest: as wide as it is tall. */
export const ICON_LINK_SIZE = 40

export type IconLinksVariant = 'default' | 'ghost'

export interface IconLinksContext {
  /** Every link shows its label, rather than only the one pointed at. */
  expanded: Readonly<Ref<boolean>>
  variant: Readonly<Ref<IconLinksVariant>>
  /** A link tells the row how wide it is open, so the row knows whether opening one fits. */
  reportWidth?: (id: string, width: number | undefined) => void
}

const IconLinksContextKey: InjectionKey<IconLinksContext> = Symbol('IconLinksContext')

export function provideIconLinksContext(context: IconLinksContext) {
  provide(IconLinksContextKey, context)
}

/** A link outside a row opens only when pointed at or focused. */
export function useIconLinksContext(): IconLinksContext {
  return inject(IconLinksContextKey, { expanded: ref(false), variant: ref('default') })
}
