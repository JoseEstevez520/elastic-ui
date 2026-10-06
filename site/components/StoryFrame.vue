<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { providePortalTarget } from 'elastic-ui'
import { useFittedHeight } from '../fitted-height'
import type { StoryInfo } from '../parts'
import { useStoryFit } from '../story-fit'

/**
 * The frame a story's live preview sits in, the same on a part's page and on the Components page.
 *
 * A story of the page itself (Storybook's `fullscreen`: a header, a sidebar, a table of contents)
 * gets a page of its own, an iframe, so it scrolls, sticks and breaks at its own width as on a real
 * page. Every other story sits in a frame that takes its height from the story and fits it in
 * without anything set by hand (story-fit.ts): shrunk when wider than the frame, centred when it
 * leaves it mostly empty.
 */
const props = defineProps<{
  slug: string
  story: StoryInfo
  component?: Component
}>()

// The least a frame is tall, so a small part does not sit in a sliver; a story can ask for more.
const MIN_HEIGHT = 176
const minHeight = () => props.story.height ?? MIN_HEIGHT

// Overlays the story opens (a dialog, a menu, a term) teleport into the frame, not the page.
const frame = ref<HTMLElement>()
const content = ref<HTMLElement>()
providePortalTarget(frame)
// The frame grows to hold a panel the story opens, and folds back once it closes.
const fitted = useFittedHeight(frame, minHeight)
const { zoom, offsetX, offsetY } = useStoryFit(frame, content, minHeight, () => props.component)

const src = computed(() => `/frame/${props.slug}/${props.story.key}`)
</script>

<template>
  <iframe
    v-if="story.fullscreen"
    :src="src"
    :title="story.name"
    loading="lazy"
    class="block w-full rounded-[var(--radius-xl)] border border-border bg-bg"
    :style="{ height: `${story.height}px` }"
  />
  <div
    v-else
    ref="frame"
    class="story-stage rounded-[var(--radius-xl)] border border-border p-6"
    :style="{ minHeight: `${fitted}px` }"
  >
    <div
      ref="content"
      class="story-content"
      :style="{ zoom, paddingInlineStart: `${offsetX}px`, paddingTop: `${offsetY}px` }"
    >
      <component :is="component" />
    </div>
  </div>
</template>
