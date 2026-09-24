import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface NavTreeContext {
  /** The value of the active item. */
  active: Ref<string | undefined>
  select: (value: string) => void
}

export interface NavTreeGroupContext {
  /** Opens this group and every group around it. */
  reveal: () => void
}

const NavTreeContextKey: InjectionKey<NavTreeContext> = Symbol('NavTreeContext')
const NavTreeGroupContextKey: InjectionKey<NavTreeGroupContext> = Symbol('NavTreeGroupContext')

export function provideNavTreeContext(context: NavTreeContext) {
  provide(NavTreeContextKey, context)
}

export function useNavTreeContext(): NavTreeContext {
  const context = inject(NavTreeContextKey, null)
  if (!context) throw new Error('NavTree parts must be used inside <NavTree>.')
  return context
}

export function provideNavTreeGroupContext(context: NavTreeGroupContext) {
  provide(NavTreeGroupContextKey, context)
}

/** The group an item or group sits in, or none at the top level. */
export function useNavTreeGroupContext(): NavTreeGroupContext | null {
  return inject(NavTreeGroupContextKey, null)
}
