import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface SelectContext {
  open: Ref<boolean>
  value: Ref<string | string[] | undefined>
  multiple: Readonly<Ref<boolean>>
  disabled: Readonly<Ref<boolean>>
  /** Each option's text, by its value, for SelectValue to show. */
  texts: Map<string, string>
  /** Where the options go: the panel the field grows into. */
  panel: Readonly<Ref<HTMLElement | undefined>>
  trigger: Ref<HTMLElement | undefined>
  contentId: string
}

const SelectKey: InjectionKey<SelectContext> = Symbol('Select')
export const provideSelect = (context: SelectContext) => provide(SelectKey, context)
export function useSelect() {
  const context = inject(SelectKey, null)
  if (!context) throw new Error('Select parts must be used inside <Select>.')
  return context
}
