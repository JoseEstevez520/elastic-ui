<script setup lang="ts">
import { BookOpen, Boxes, Compass } from '@lucide/vue'
import { computed, ref, useTemplateRef } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Breadcrumbs,
  NavTree,
  NavTreeItem,
  PageTransition,
  ScrollIndicator,
  Sidebar,
  SidebarLayout,
  SidebarLayoutHeader,
  ThemeToggle,
  type BreadcrumbsItem,
} from 'elastic-ui'
import { registry } from '../parts'

const route = useRoute()
const collapsed = ref(false)
const scrollIndicator = useTemplateRef('scrollIndicator')

// Breadcrumbs hold the path to the page; the sidebar keeps to the sections (USAGE 15).
const crumbs = computed<BreadcrumbsItem[]>(() => {
  if (route.path.startsWith('/components/')) {
    const name = registry.find((entry) => entry.slug === route.params.name)?.name
    if (name) return [{ label: 'Components', to: '/components' }, { label: name }]
  }
  return [{ label: route.meta.title ?? 'elastic-ui' }]
})
</script>

<template>
  <SidebarLayout v-model:collapsed="collapsed">
    <Sidebar variant="connected">
      <template #header>
        <RouterLink to="/" class="rounded-[var(--radius-sm)] px-2.5 text-sm font-semibold focus-ring">elastic-ui</RouterLink>
      </template>
      <NavTree :model-value="route.path">
        <NavTreeItem value="/docs" to="/docs" :icon="BookOpen">Get started</NavTreeItem>
        <NavTreeItem value="/docs/principles" to="/docs/principles" :icon="Compass">Principles</NavTreeItem>
        <NavTreeItem value="/components" to="/components" :icon="Boxes">Components</NavTreeItem>
      </NavTree>
    </Sidebar>
    <main class="min-w-0 flex-1">
      <SidebarLayoutHeader>
        <Breadcrumbs :items="crumbs" />
        <template #end>
          <ThemeToggle />
        </template>
      </SidebarLayoutHeader>
      <RouterView v-slot="{ Component }">
        <PageTransition :page="route.path" @changed="scrollIndicator?.flash()">
          <component :is="Component" />
        </PageTransition>
      </RouterView>
    </main>
    <ScrollIndicator ref="scrollIndicator" />
  </SidebarLayout>
</template>
