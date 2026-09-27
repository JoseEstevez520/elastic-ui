<script setup lang="ts">
import { Search } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Input } from 'elastic-ui'
import ComponentSection from '../components/ComponentSection.vue'
import { readingPart as active } from '../reading'
import { groupedRegistry } from '../parts'

// One long page instead of a card grid to a page each (SITE.md §4, "scroll through the docs"):
// every part, its group's order, its main story live where it stands. A search narrows the
// sections themselves rather than filtering a list of links to them.
const query = ref('')
const groups = computed(() => groupedRegistry(query.value))
const partCount = computed(() => groups.value.reduce((total, group) => total + group.parts.length, 0))

// The part being read: the section crossing a line a third of the way down the screen. The sidebar's
// connected tab follows it (`readingPart`); no table of contents beside it, which would only repeat
// the sidebar's list and narrow the page.
let observer: IntersectionObserver | undefined
function observe() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) active.value = entry.target.id
    },
    { rootMargin: '-33% 0px -66% 0px' },
  )
  document.querySelectorAll('section.scroll-anchor[id]').forEach((el) => observer!.observe(el))
}
onMounted(observe)
watch(groups, () => requestAnimationFrame(observe))
onBeforeUnmount(() => {
  observer?.disconnect()
  active.value = undefined
})
</script>

<template>
  <div class="article py-10">
    <div class="flex min-w-0 flex-col gap-10">
      <div class="flex flex-col gap-2">
        <h1 class="text-display text-fg">Components</h1>
        <p class="text-copy text-fg-secondary">
          Every public part, live: scroll to read them one after another, or search to narrow the list. Each opens its
          own page for its other stories and its API.
        </p>
      </div>

      <Input v-model="query" :icon="Search" placeholder="Search parts" aria-label="Search parts" class="max-w-sm" />

      <p v-if="!partCount" class="text-copy text-fg-muted">No part matches "{{ query }}".</p>

      <section v-for="group in groups" :key="group.category" class="flex flex-col gap-8">
        <h2 class="text-label text-fg-muted">{{ group.category }}</h2>
        <ComponentSection v-for="entry in group.parts" :key="entry.slug" :entry="entry" />
      </section>
    </div>
  </div>
</template>
