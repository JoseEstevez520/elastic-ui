import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type { ToggleSize } from './toggle.variants'

interface ToggleGroupContext {
  type: Ref<'single' | 'multiple'>
  size: Ref<ToggleSize>
}

const key: InjectionKey<ToggleGroupContext> = Symbol('ToggleGroup')
export const provideToggleGroup = (context: ToggleGroupContext) => provide(key, context)
export const useToggleGroup = () => inject(key, undefined)
