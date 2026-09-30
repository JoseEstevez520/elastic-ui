import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'

/** Where the library teleports its overlays: `body` unless a page sends them somewhere of its own. */
export type PortalTarget = string | HTMLElement

const portalTargetKey: InjectionKey<Ref<HTMLElement | undefined>> = Symbol('portal-target')

/**
 * Sends every overlay below this component into `target` instead of `body`. A page that shows
 * components in a frame of its own (a preview box) provides it, so a dialog or a menu stays inside
 * the frame rather than covering the page.
 */
export function providePortalTarget(target: Ref<HTMLElement | undefined>) {
  provide(portalTargetKey, target)
}

/** The target an overlay teleports into: the nearest provided frame, or `body`. */
export function usePortalTarget(): ComputedRef<PortalTarget> {
  const target = inject(portalTargetKey, undefined)
  return computed(() => target?.value ?? 'body')
}

/**
 * The size an overlay that fills the screen should take: the provided frame's, or the viewport's.
 * Read it when the overlay opens, not before. Lets a dialog or a sheet cover the frame it lives in
 * rather than the whole page.
 */
export function usePortalSize(): () => { width: number; height: number } {
  const target = inject(portalTargetKey, undefined)
  return () => {
    const el = target?.value
    return el
      ? { width: el.clientWidth, height: el.clientHeight }
      : { width: window.innerWidth, height: window.innerHeight }
  }
}
