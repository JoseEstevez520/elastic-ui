import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface SelectionMenuContext {
  /** The selected text, snapped to whole words. */
  text: Readonly<Ref<string>>
  /** Lets go of the selection, band and bar together. */
  clear: () => void
}

const SelectionMenuKey: InjectionKey<SelectionMenuContext> = Symbol('SelectionMenu')

export function provideSelectionMenu(context: SelectionMenuContext) {
  provide(SelectionMenuKey, context)
}

export function useSelectionMenu(): SelectionMenuContext {
  const context = inject(SelectionMenuKey, null)
  if (!context) throw new Error('SelectionMenuItem must be used inside <SelectionMenu>.')
  return context
}
