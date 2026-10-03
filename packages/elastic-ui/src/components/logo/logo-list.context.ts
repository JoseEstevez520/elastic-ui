import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

export interface LogoListContext {
  /** Each logo and name stand alone, with no tray under them. */
  bare: Readonly<Ref<boolean>>
}

const LogoListContextKey: InjectionKey<LogoListContext> = Symbol('LogoListContext')

export function provideLogoListContext(context: LogoListContext) {
  provide(LogoListContextKey, context)
}

/** An item outside a list keeps its tray. */
export function useLogoListContext(): LogoListContext {
  return inject(LogoListContextKey, { bare: ref(false) })
}
