import { computed, getCurrentInstance, type Component } from 'vue'

/** Where a link goes in the app's router: a path, or a location object (`{ name, params }`). */
export type LinkTo = string | Record<string, unknown>

/**
 * What a part that can navigate accepts: `href` for a plain link, `to` for the app's router link
 * (RouterLink, found by name so the library needs no router; NuxtLink with `as`), and `as` to
 * render any other link component.
 */
export interface LinkProps {
  href?: string
  to?: LinkTo
  as?: string | Component
}

/**
 * The element a navigating part renders and the attributes that make it go there, or `undefined`
 * when it is not a link at all. Call in `setup`.
 */
export function useLink(props: LinkProps) {
  // Registered globally by `app.use(router)`; looked up without resolveComponent's warning, so an
  // app with no router just gets a plain link.
  const routerLink = getCurrentInstance()?.appContext.components.RouterLink
  return computed(() => {
    if (props.as) return { is: props.as, attrs: props.to !== undefined ? { to: props.to } : { href: props.href } }
    if (props.to !== undefined) {
      if (routerLink) return { is: routerLink, attrs: { to: props.to } }
      return { is: 'a', attrs: { href: typeof props.to === 'string' ? props.to : undefined } }
    }
    if (props.href !== undefined) return { is: 'a', attrs: { href: props.href } }
    return undefined
  })
}
