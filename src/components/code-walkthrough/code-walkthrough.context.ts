import { inject, provide, type InjectionKey, type Ref } from 'vue'

/** What a step tells the walkthrough about itself. */
export interface CodeWalkthroughStepEntry {
  id: string
  el: () => HTMLElement | undefined
  code: () => string
  file: () => string | undefined
  highlight: () => string | undefined
}

export interface CodeWalkthroughContext {
  steps: Ref<CodeWalkthroughStepEntry[]>
  /** The step being read, from 0. */
  active: Ref<number>
}

const CodeWalkthroughKey: InjectionKey<CodeWalkthroughContext> = Symbol('CodeWalkthrough')

export const provideCodeWalkthroughContext = (context: CodeWalkthroughContext) => provide(CodeWalkthroughKey, context)

export function useCodeWalkthroughContext() {
  const context = inject(CodeWalkthroughKey, null)
  if (!context) throw new Error('CodeWalkthroughStep must be used inside <CodeWalkthrough>.')
  return context
}
