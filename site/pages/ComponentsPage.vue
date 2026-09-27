<script setup lang="ts">
import { Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { AnimatedList, Input } from 'elastic-ui'
import { registry, type RegistryEntry } from '../parts'

const query = ref('')

// Grouped by category, as in Storybook (SITE.md §4); a search narrows every group at once, each
// one settling on its own rather than the whole page jumping.
const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  const matches = (entry: RegistryEntry) => !q || entry.name.toLowerCase().includes(q) || entry.category.toLowerCase().includes(q)
  const byCategory = new Map<string, RegistryEntry[]>()
  for (const entry of registry) {
    if (!matches(entry)) continue
    const list = byCategory.get(entry.category)
    if (list) list.push(entry)
    else byCategory.set(entry.category, [entry])
  }
  return [...byCategory].map(([category, parts]) => ({ category, parts }))
})
</script>

<template>
  <div class="article flex flex-col gap-10 py-10">
    <div class="flex flex-col gap-2">
      <h1 class="text-display text-fg">Components</h1>
      <p class="text-copy text-fg-secondary">
        Every public part of the library. A part's page shows its stories as its examples, its code a tab away, and its API read
        straight from its source.
      </p>
    </div>

    <Input v-model="query" :icon="Search" placeholder="Search parts" aria-label="Search parts" class="max-w-sm" />

    <p v-if="!groups.length" class="text-copy text-fg-muted">No part matches “{{ query }}”.</p>

    <section v-for="group in groups" :key="group.category" class="flex flex-col gap-4">
      <h2 class="text-label tracking-wide text-fg-muted uppercase">{{ group.category }}</h2>
      <AnimatedList
        :items="group.parts"
        :item-key="(entry) => entry.slug"
        as="div"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <template #default="{ item }">
          <RouterLink
            :to="`/components/${item.slug}`"
            class="focus-ring flex h-full flex-col gap-1 rounded-[var(--radius-xl)] bg-bg-subtle p-5 transition-colors hover:bg-bg-muted"
          >
            <span class="text-label text-fg">{{ item.name }}</span>
            <span v-if="item.description" class="line-clamp-2 text-copy text-fg-secondary">{{ item.description }}</span>
          </RouterLink>
        </template>
      </AnimatedList>
    </section>
  </div>
</template>
