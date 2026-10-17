import { inject, provide, type InjectionKey, type Ref } from 'vue'

export type TreeDragId = string | number

/** Where an item sits, read live so a parent that re-renders its tree is never out of date. */
export interface TreeDragMeta {
  id: TreeDragId
  parentId: TreeDragId | null
  /** Its place among its siblings. */
  index: number
  /** It can hold others: dropped on its middle, an item goes inside it. */
  section: boolean
  /** How many it holds now. */
  count: number
  el: HTMLElement
}

export interface TreeDragMove {
  id: TreeDragId
  parentId: TreeDragId | null
  /** Its place among the siblings that stay, once it is out of its old place. */
  index: number
}

export type TreeDragKey = 'up' | 'down' | 'out' | 'in'

export interface TreeDragContext {
  register: (meta: () => TreeDragMeta) => () => void
  draggingId: Readonly<Ref<TreeDragId | null>>
  /** How far the dragged row is from where it started, in pixels. */
  offset: Readonly<Ref<number>>
  /** How far it sits sideways: it takes the indent of the level it would land at. */
  offsetX: Readonly<Ref<number>>
  /** The row a drop would go inside, lit while it would. */
  insideId: Readonly<Ref<TreeDragId | null>>
  /** How far each other row moves aside, in pixels, to close the hole and open the gap. */
  shifts: Readonly<Ref<Record<string, number>>>
  start: (id: TreeDragId, event: PointerEvent) => void
  step: (id: TreeDragId, key: TreeDragKey) => void
}

const TreeDragContextKey: InjectionKey<TreeDragContext> = Symbol('TreeDragContext')

export const provideTreeDragContext = (context: TreeDragContext) => provide(TreeDragContextKey, context)

export function useTreeDragContext(): TreeDragContext {
  const context = inject(TreeDragContextKey)
  if (!context) throw new Error('TreeDragItem and TreeDragHandle go inside a TreeDrag')
  return context
}

export interface TreeDragItemContext {
  id: TreeDragId
}
export const TreeDragItemKey: InjectionKey<TreeDragItemContext> = Symbol('TreeDragItemContext')
