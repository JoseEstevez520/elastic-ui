import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

/** A link's tray at rest: as wide as it is tall. */
export const SOCIAL_LINK_SIZE = 40

export interface SocialLinksContext {
  /** Every link shows its handle, rather than only the one pointed at. */
  expanded: Readonly<Ref<boolean>>
  /** A link tells the row how wide it is open, so the row knows whether opening one fits. */
  reportWidth?: (id: string, width: number | undefined) => void
}

const SocialLinksContextKey: InjectionKey<SocialLinksContext> = Symbol('SocialLinksContext')

export function provideSocialLinksContext(context: SocialLinksContext) {
  provide(SocialLinksContextKey, context)
}

/** A link outside a row opens only when pointed at or focused. */
export function useSocialLinksContext(): SocialLinksContext {
  return inject(SocialLinksContextKey, { expanded: ref(false) })
}
