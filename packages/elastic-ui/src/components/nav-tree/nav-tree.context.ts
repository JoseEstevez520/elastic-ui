import { computed, inject, provide, type InjectionKey, type Ref } from 'vue'
import { useSidebarContext, useSidebarVariant } from '../sidebar/sidebar.context'
import type { NavTreeLabelPlacement } from './nav-tree.variants'

export interface NavTreeContext {
  /** The value of the active item. */
  active: Ref<string | undefined>
  select: (value: string) => void
  /** The row's place in the tree, in the order rows are set up, for cascades down the list. */
  nextIndex: () => number
  /** A tree to pick from rather than to navigate: rows are options, never links. */
  selectable: Readonly<Ref<boolean>>
  /**
   * A selectable tree's `tabindex` for a row: only one row is reached with Tab, and the arrow
   * keys move between them. `undefined` in a navigation tree.
   */
  tabIndex: (rowId: string, isActive: boolean, index: number) => number | undefined
}

export interface NavTreeGroupContext {
  /** Opens this group and every group around it. */
  reveal: () => void
  /** Tells this group and those around it whether the active item is inside. */
  holdActive: (isActive: boolean) => void
  /** Whether its items are tucked away in a sidebar's rail, where the group stands in for them. */
  railedAway: Readonly<Ref<boolean>>
  /** The group's depth: 1 at the top level. */
  level: number
  /** Moves the focus to the group's own row, as the left arrow does in a selectable tree. */
  focusHeader: () => void
}

const NavTreeContextKey: InjectionKey<NavTreeContext> = Symbol('NavTreeContext')
const NavTreeGroupContextKey: InjectionKey<NavTreeGroupContext> = Symbol('NavTreeGroupContext')

export function provideNavTreeContext(context: NavTreeContext) {
  provide(NavTreeContextKey, context)
}

export function useNavTreeContext(): NavTreeContext {
  const context = inject(NavTreeContextKey, null)
  if (!context) throw new Error('NavTree parts must be used inside <NavTree>.')
  return context
}

export function provideNavTreeGroupContext(context: NavTreeGroupContext) {
  provide(NavTreeGroupContextKey, context)
}

/** The group an item or group sits in, or none at the top level. */
export function useNavTreeGroupContext(): NavTreeGroupContext | null {
  return inject(NavTreeGroupContextKey, null)
}

/**
 * Where a row renders: on its own, in an open Sidebar, or in one folded to its rail. Only a tree
 * inside the Sidebar itself follows it: one in the page beside it (a picker in a popover) stays
 * on its own, so a folded sidebar never erases its labels.
 */
export function useNavTreePlacement() {
  const sidebar = useSidebarVariant() ? useSidebarContext() : null
  const railed = computed(() => !!sidebar?.collapsed.value)
  const placement = computed<NavTreeLabelPlacement>(() => (!sidebar ? 'standalone' : railed.value ? 'rail' : 'sidebar'))
  return { sidebar, railed, placement }
}
