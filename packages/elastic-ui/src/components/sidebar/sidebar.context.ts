import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface SidebarContext {
  /** Folded to a rail of icons (wide screens). */
  collapsed: Readonly<Ref<boolean>>
  /** Narrow screens, where the sidebar is a panel that slides in from the edge. */
  mobile: Readonly<Ref<boolean>>
  /** The panel slid in, on a phone. */
  mobileOpen: Ref<boolean>
  expand: () => void
  toggle: () => void
  /** Whether the toggle has the sidebar open: unfolded, or slid in on a phone. */
  isOpen: Readonly<Ref<boolean>>
  panelId: string
  /** The page alone: the sidebar and the page's header folded away (`SidebarLayout bare`). */
  bare: Readonly<Ref<boolean>>
}

const SidebarContextKey: InjectionKey<SidebarContext> = Symbol('SidebarContext')

export function provideSidebarContext(context: SidebarContext) {
  provide(SidebarContextKey, context)
}

/** The sidebar layout around a part, or none: NavTree works on its own too. */
export function useSidebarContext(): SidebarContext | null {
  return inject(SidebarContextKey, null)
}

export function useRequiredSidebarContext(part: string): SidebarContext {
  const context = useSidebarContext()
  if (!context) throw new Error(`${part} must be used inside <SidebarLayout>.`)
  return context
}

/**
 * How a sidebar sits against the page:
 *   plain      a column in a slightly different tone, with no line between it and the page.
 *   connected  as in SkillNet: a tinted column where the active item is a tab of the page itself,
 *              fused to the sidebar's edge with the corners curving into it.
 */
export type SidebarVariant = 'plain' | 'connected'

const SidebarVariantKey: InjectionKey<SidebarVariant> = Symbol('SidebarVariant')

export function provideSidebarVariant(variant: SidebarVariant) {
  provide(SidebarVariantKey, variant)
}

/** The variant of the sidebar around a part, or none outside a sidebar. */
export function useSidebarVariant(): SidebarVariant | null {
  return inject(SidebarVariantKey, null)
}
