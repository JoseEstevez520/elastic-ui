import { createRouter, createWebHistory } from 'vue-router'
import DocsLayout from './layouts/DocsLayout.vue'
import ComponentsPage from './pages/ComponentsPage.vue'
import DocsPage from './pages/DocsPage.vue'
import LandingPage from './pages/LandingPage.vue'
import PrinciplesPage from './pages/PrinciplesPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** The page's name, as the breadcrumbs' last crumb and the document's title. */
    title?: string
  }
}

export const router = createRouter({
  history: createWebHistory(),
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
      ],
    },
  ],
})

router.afterEach((to) => {
  document.title = to.path === '/' ? 'elastic-ui' : `${to.meta.title} · elastic-ui`
})
