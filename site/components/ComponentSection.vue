<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { StatusText } from 'elastic-ui'
import { loadPart, type LoadedPart, type RegistryEntry } from '../parts'
import StoryFrame from './StoryFrame.vue'

/**
 * One part, read on the scrolling Components page (ROADMAP.md, the site plan): its name, a one-line description,
 * and its main story live — the same live preview a part's own page opens with, so scrolling here
 * and opening `/components/:name` never show two different things. Its other stories stay a click
 * away, on that page, rather than repeating them all inline.
 */
const props = defineProps<{ entry: RegistryEntry }>()

const root = useTemplateRef<HTMLElement>('root')
const near = shallowRef(false)
const loaded = shallowRef<LoadedPart>()

// Loaded once it is close to view, not the moment the long page mounts: with every part's stories
// and API read up front, the page would import all of them at once.
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      near.value = true
      observer?.disconnect()
    },
    { rootMargin: '600px 0px' },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

watch(near, async (isNear) => {
  if (!isNear) return
  loaded.value = await loadPart(props.entry.slug)
})

const mainStory = computed(() => loaded.value?.data.stories.find((story) => !story.situation))
const mainComponent = computed(() => (mainStory.value ? loaded.value?.components[mainStory.value.key] : undefined))
</script>

<template>
  <section :id="entry.slug" ref="root" class="scroll-anchor flex flex-col gap-4">
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 class="text-title text-fg">
        <RouterLink :to="`/components/${entry.slug}`" class="rounded-[var(--radius-sm)] focus-ring hover:underline">
          {{ entry.name }}
        </RouterLink>
      </h2>
      <RouterLink
        :to="`/components/${entry.slug}`"
        class="shrink-0 rounded-[var(--radius-sm)] text-label text-fg-secondary focus-ring hover:text-fg"
      >
        All examples
      </RouterLink>
    </div>
    <p v-if="entry.description" class="line-clamp-1 text-copy text-fg-secondary">{{ entry.description }}</p>

    <StoryFrame v-if="mainStory && mainComponent" :slug="entry.slug" :story="mainStory" :component="mainComponent" />
    <div v-else class="min-h-44 rounded-[var(--radius-xl)] border border-border p-6">
      <StatusText v-if="near" text="Loading" working class="text-copy text-fg-muted" />
    </div>
  </section>
</template>
