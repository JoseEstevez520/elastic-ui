import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface LabRadioContext {
  variant: Ref<'dots' | 'cards'>
}
const key: InjectionKey<LabRadioContext> = Symbol('LabRadio')
export const provideLabRadio = (context: LabRadioContext) => provide(key, context)
export const useLabRadio = () => inject(key)!
