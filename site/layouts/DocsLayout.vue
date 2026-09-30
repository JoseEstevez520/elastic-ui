<script setup lang="ts">
import { BookOpen, Boxes, Compass } from '@lucide/vue'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Breadcrumbs,
  NavTree,
  NavTreeGroup,
  NavTreeItem,
  PageTransition,
  ScrollIndicator,
  Sidebar,
  SidebarLayout,
  SidebarLayoutHeader,
  ThemeToggle,
  type BreadcrumbsItem,
} from 'elastic-ui'
import { groupedRegistry, registry } from '../parts'
import { readingPart } from '../reading'

const route = useRoute()
const collapsed = ref(false)
const scrollIndicator = useTemplateRef('scrollIndicator')
// Every part, as groups the sidebar can jump straight to a section of the (single, long)
// Components page (ROADMAP.md, the site plan); read once, since it never changes at runtime.
const groups = groupedRegistry()
// On the long Components page the sidebar's tab follows the part being read; elsewhere, the page.
const current = computed(() => (route.path === '/components' && readingPart.value ? readingPart.value : route.path))
// Keep that tab in view in the sidebar's own scroll, never moving the page (DECISIONS, pitfalls).
watch(current, async () => {
  await nextTick()
  const item = document.querySelector<HTMLElement>('aside [aria-current]')
  let box = item?.parentElement
  while (box && !(box.scrollHeight > box.clientHeight && /(auto|scroll)/.test(getComputedStyle(box).overflowY)))
    box = box.parentElement
  if (!item || !box) return
  const top = item.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
  if (top < box.scrollTop + 48 || top > box.scrollTop + box.clientHeight - 48)
    box.scrollTo({ top: top - box.clientHeight / 3, behavior: 'smooth' })
})

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
        <RouterLink to="/" class="rounded-[var(--radius-sm)] px-2.5 text-sm font-semibold focus-ring"
          >elastic-ui</RouterLink
        >
      </template>
      <NavTree :model-value="current">
        <NavTreeItem value="/docs" to="/docs" :icon="BookOpen">Get started</NavTreeItem>
        <NavTreeItem value="/docs/principles" to="/docs/principles" :icon="Compass">Principles</NavTreeItem>
        <NavTreeGroup value="/components" to="/components" :icon="Boxes" label="Components">
          <NavTreeGroup v-for="group in groups" :key="group.category" :label="group.category">
            <NavTreeItem
              v-for="entry in group.parts"
              :key="entry.slug"
              :value="entry.slug"
              :to="`/components#${entry.slug}`"
            >
              {{ entry.name }}
            </NavTreeItem>
          </NavTreeGroup>
        </NavTreeGroup>
      </NavTree>
    </Sidebar>
    <main class="min-w-0 flex-1">
      <SidebarLayoutHeader seamless>
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
