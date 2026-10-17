import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface SuggestionMenuContext {
  /** The value of the item the keys would pick. */
  highlighted: Ref<string | undefined>
  /** Each item's id, from its value, for `aria-activedescendant`. */
  idOf: (value: string) => string
  select: (value: string) => void
}

const SuggestionMenuContextKey: InjectionKey<SuggestionMenuContext> = Symbol('SuggestionMenuContext')

export function provideSuggestionMenuContext(context: SuggestionMenuContext) {
  provide(SuggestionMenuContextKey, context)
}

export function useSuggestionMenuContext(part: string): SuggestionMenuContext {
  const context = inject(SuggestionMenuContextKey, null)
  if (!context) throw new Error(`${part} must be used inside <SuggestionMenu>.`)
  return context
}
