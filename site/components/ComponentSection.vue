<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { providePortalTarget, StatusText } from 'elastic-ui'
import { useFittedHeight } from '../fitted-height'
import { loadPart, type LoadedPart, type RegistryEntry } from '../parts'

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

// Overlays the story opens teleport into this frame, not the page.
const frame = ref<HTMLElement>()
providePortalTarget(frame)
// The frame grows to hold a panel the story opens, and folds back once it closes.
const fitted = useFittedHeight(frame, () => mainStory.value?.height ?? 320)

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

    <div
      ref="frame"
      class="story-stage rounded-[var(--radius-xl)] border border-border"
      :class="mainStory?.fullscreen ? 'story-stage--fullscreen' : 'p-6'"
      :style="mainStory?.fullscreen ? { height: `${mainStory.height}px` } : { minHeight: `${fitted}px` }"
    >
      <StatusText v-if="near && !mainComponent" text="Loading" working class="text-copy text-fg-muted" />
      <component :is="mainComponent" v-else-if="mainComponent" />
    </div>
  </section>
</template>
