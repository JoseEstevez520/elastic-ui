import { inject, provide, type InjectionKey, type Ref } from 'vue'

export type DiagramLayout = 'row' | 'column' | 'grid'

/**
 * Which way a diagram's parts run where they sit, so an arrow points along them: `across` in a
 * row, `down` in a column, a grid or a row stacked for want of room, and `undefined` until a row
 * has been measured (the `sm` breakpoint stands in).
 */
export type DiagramDirection = 'across' | 'down' | undefined

export interface DiagramContext {
  direction: Readonly<Ref<DiagramDirection>>
  /** Inside an area, parts stretch to its width; in a group, a chip keeps its own. */
  inArea: boolean
}

const DiagramContextKey: InjectionKey<DiagramContext> = Symbol('DiagramContext')

export function provideDiagramContext(context: DiagramContext) {
  provide(DiagramContextKey, context)
}

/** Parts used on their own, outside any group, sit in a line of text. */
export function useDiagramContext(): DiagramContext | null {
  return inject(DiagramContextKey, null)
}
