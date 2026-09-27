import { createRouter, createWebHistory } from 'vue-router'
import DocsLayout from './layouts/DocsLayout.vue'
import ComponentPage from './pages/ComponentPage.vue'
import ComponentsPage from './pages/ComponentsPage.vue'
import DocsPage from './pages/DocsPage.vue'
import LandingPage from './pages/LandingPage.vue'
import PrinciplesPage from './pages/PrinciplesPage.vue'
import { registry } from './parts'

declare module 'vue-router' {
  interface RouteMeta {
    /** The page's name, as the breadcrumbs' last crumb and the document's title. */
    title?: string
  }
}

// Where a route means to land: a saved position (back/forward), an anchor's, offset for the
// sticky header once it exists, or the top of a fresh page. `undefined` for an anchor not in the
// DOM yet (a lazy-loaded part page's stories still loading) — not 0, so it is never mistaken for
// "the top, on purpose" and pinned there instead of waiting for the real target.
function targetOf(hash: string, saved?: { left: number; top: number }): number | undefined {
  if (saved) return saved.top
  if (!hash) return 0
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!el) return undefined
  const headerReady = getComputedStyle(document.documentElement).getPropertyValue('--page-header-height').trim() !== ''
  if (!headerReady) return undefined
  const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  return el.getBoundingClientRect().top + window.scrollY - margin
}

// A part's page (or the Components page's many sections) fills in async: its stories load, then
// mount their own Tabs, and TabsList moves the newly-mounted tab "into view" on the way (a library
// quirk, SITE-NEEDS.md) — after the page has already landed on its target, that nudges the window
// off it again, so the next page opens looking scrolled halfway down. Rather than guessing how long
// that takes, this keeps the window pinned on the target for as long as the page keeps changing
// underneath it, and gives up the moment the visitor actually tries to scroll it themselves.
function pinScroll(hash: string, saved?: { left: number; top: number }): void {
  let live = true
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
  const release = () => {
    if (!live) return
    live = false
    observer.disconnect()
    clearTimeout(quiet)
    clearTimeout(giveUp)
    for (const type of events) window.removeEventListener(type, release)
  }
  for (const type of events) window.addEventListener(type, release, { passive: true, once: true })

  // Applies the target and reports whether it could: `false` while it's still unknown (the
  // header hasn't published its height yet, or a hash's element hasn't mounted), which must never
  // start the "nothing left to correct" countdown below — there would be nothing to undo yet.
  const apply = () => {
    const top = targetOf(hash, saved)
    if (top === undefined) return false
    window.scrollTo({ top, left: saved?.left ?? 0, behavior: 'instant' })
    return true
  }
  const observer = new MutationObserver(() => {
    if (!apply()) return
    clearTimeout(quiet)
    quiet = setTimeout(release, 600)
  })
  observer.observe(document.body, { childList: true, subtree: true })
  // The one change a hash's target needs that isn't a node being added: `--page-header-height`
  // itself, an inline style SidebarLayoutHeader's own ResizeObserver sets on `<html>` a moment
  // after mounting. Watched on its own, narrowly, so it doesn't add the noise every other inline
  // style change on the page (motion-v's animations) would.
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
  // No countdown yet when the very first attempt can't resolve a target either — only the hard
  // cap keeps this from waiting forever.
  let quiet: ReturnType<typeof setTimeout> | undefined = apply() ? setTimeout(release, 600) : undefined
  // However long the page takes to settle, this never outlasts it.
  const giveUp = setTimeout(release, 3000)
}

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    pinScroll(to.hash, savedPosition ?? undefined)
    // Handled above, uniformly: a hash's or a restored position's target isn't known
    // synchronously (the element it names may not exist until this route's own async content
    // mounts, and mounting is exactly what keeps nudging the window off it).
    return false
  },
  routes: [
    // One shell for every page, the index included, so the sidebar stays still between them
    // (USAGE 12) and a link to it lands the same way a link to any other page does.
    {
      path: '/',
      component: DocsLayout,
      children: [
        { path: '', component: LandingPage, meta: { title: 'elastic-ui' } },
        { path: 'docs', component: DocsPage, meta: { title: 'Get started' } },
        { path: 'docs/principles', component: PrinciplesPage, meta: { title: 'Principles' } },
        { path: 'components', component: ComponentsPage, meta: { title: 'Components' } },
        { path: 'components/:name', component: ComponentPage },
      ],
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title ?? registry.find((entry) => entry.slug === to.params.name)?.name
  document.title = !title || to.path === '/' ? 'elastic-ui' : `${title} · elastic-ui`
})
