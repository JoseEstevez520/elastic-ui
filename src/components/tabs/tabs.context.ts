import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type { TabsVariant } from './tabs.variants'

export interface TabsContext {
  value: Readonly<Ref<string | undefined>>
  variant: Readonly<Ref<TabsVariant>>
}

const TabsContextKey: InjectionKey<TabsContext> = Symbol('TabsContext')

export function provideTabsContext(context: TabsContext) {
  provide(TabsContextKey, context)
}

export function useTabsContext(): TabsContext {
  const context = inject(TabsContextKey, null)
  if (!context) throw new Error('Tabs parts must be used inside <Tabs>.')
  return context
}
