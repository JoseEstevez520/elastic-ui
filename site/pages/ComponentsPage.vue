<script setup lang="ts">
import { Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Input, TableOfContents, type TableOfContentsItem } from 'elastic-ui'
import ComponentSection from '../components/ComponentSection.vue'
import { groupedRegistry } from '../parts'

// One long page instead of a card grid to a page each (SITE.md §4, "scroll through the docs"):
// every part, its group's order, its main story live where it stands. A search narrows the
// sections themselves rather than filtering a list of links to them.
const query = ref('')
const groups = computed(() => groupedRegistry(query.value))
const partCount = computed(() => groups.value.reduce((total, group) => total + group.parts.length, 0))

// The part being read, followed by the right-hand TableOfContents as it does on any long page.
const active = ref<string>()
const tocItems = computed<TableOfContentsItem[]>(() =>
  groups.value.flatMap((group) => group.parts.map((entry) => ({ id: entry.slug, label: entry.name }))),
)
</script>

<template>
  <div class="article flex items-start gap-12 py-10">
    <div class="flex min-w-0 flex-1 flex-col gap-10">
      <div class="flex flex-col gap-2">
        <h1 class="text-display text-fg">Components</h1>
        <p class="text-copy text-fg-secondary">
          Every public part, live: scroll to read them one after another, or search to narrow the list. Each opens its own
          page for its other stories and its API.
        </p>
      </div>

      <Input v-model="query" :icon="Search" placeholder="Search parts" aria-label="Search parts" class="max-w-sm" />

      <p v-if="!partCount" class="text-copy text-fg-muted">No part matches "{{ query }}".</p>

      <section v-for="group in groups" :key="group.category" class="flex flex-col gap-8">
        <h2 class="text-label text-fg-muted">{{ group.category }}</h2>
        <ComponentSection v-for="entry in group.parts" :key="entry.slug" :entry="entry" />
      </section>
    </div>

    <TableOfContents
      v-if="tocItems.length"
      v-model:active="active"
      :items="tocItems"
      class="sticky top-[calc(var(--page-header-height,0px)+2.5rem)] hidden max-h-[calc(100dvh-var(--page-header-height,0px)-5rem)] w-48 shrink-0 self-start overflow-y-auto scrollbar-subtle xl:block"
    />
  </div>
</template>
