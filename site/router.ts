import { createRouter, createWebHistory } from 'vue-router'
import DocsLayout from './layouts/DocsLayout.vue'
import ComponentPage from './pages/ComponentPage.vue'
import ComponentsPage from './pages/ComponentsPage.vue'
import DocsPage from './pages/DocsPage.vue'
import LandingPage from './pages/LandingPage.vue'
import PrinciplesPage from './pages/PrinciplesPage.vue'
import { registry } from './parts'
// Not part of the package's public API: the site reaches for this the way its own parts do
// (see LandingPage's use of usePlayInTurn).
import { prefersReducedMotion } from '../src/utils/motion'

declare module 'vue-router' {
  interface RouteMeta {
    /** The page's name, as the breadcrumbs' last crumb and the document's title. */
    title?: string
  }
}

// A route's target, when it has one: found straight after the switch, or waited for a frame or
// two when the page it lands on mounts its headings async (a lazy-loaded part page's stories).
// `scrollIntoView` finds whichever ancestor actually scrolls — the window today, or a `<main>`
// with its own overflow if a page ever grows one — and its offset comes from the `scroll-margin-top`
// every anchored heading already carries (tokens.css, `--page-header-height`), the same one
// TableOfContents' own clicks use, so a route change and a click land the same way.
function scrollToHash(hash: string, tries = 0): void {
  const id = decodeURIComponent(hash.slice(1))
  const el = document.getElementById(id)
  // A page with a SidebarLayoutHeader publishes its height a moment after mounting (its
  // ResizeObserver's first callback); scrolling before that lands short, under the header. A
  // page with none (the landing's MorphHeader floats, it publishes nothing) never sets it, so
  // this only waits out its own retry budget instead of forever.
  const headerReady = getComputedStyle(document.documentElement).getPropertyValue('--page-header-height').trim() !== ''
  if (el && (headerReady || tries > 10)) {
    el.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    return
  }
  if (tries < 20) requestAnimationFrame(() => scrollToHash(hash, tries + 1))
}

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    // Back/forward: the browser's own remembered position.
    if (savedPosition) return savedPosition
    // A link to an anchor: scrolled there, offset for the sticky header, once it exists.
    if (to.hash) {
      scrollToHash(to.hash)
      return false
    }
    // A fresh navigation: the top of the new page, never where the last one left off.
    return { top: 0 }
  },
  routes: [
    { path: '/', component: LandingPage, meta: { title: 'elastic-ui' } },
    // Docs and the parts share one shell, so the sidebar stays still between them (USAGE 12).
    {
      path: '/',
      component: DocsLayout,
      children: [
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
