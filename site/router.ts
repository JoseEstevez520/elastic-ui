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
        { path: 'components/:name', component: ComponentPage },
      ],
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title ?? registry.find((entry) => entry.slug === to.params.name)?.name
  document.title = !title || to.path === '/' ? 'elastic-ui' : `${title} · elastic-ui`
})
