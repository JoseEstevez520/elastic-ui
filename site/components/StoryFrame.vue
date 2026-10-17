<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import { providePortalTarget } from 'elastic-ui'
import { useFittedHeight } from '../fitted-height'
import type { StoryInfo } from '../parts'
import { useStoryFit } from '../story-fit'

/**
 * The frame a story's live preview sits in, the same on a part's page and on the Components page.
 *
 * A story of the page itself (Storybook's `fullscreen`: a header, a sidebar, a table of contents)
 * gets a page of its own, an iframe, so it scrolls, sticks and breaks as on a real page: drawn at a
 * desktop's width and scaled down into the frame, or at the frame's own width on a phone. Every other story sits in a frame that takes its height from the story and fits it in
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
useStoryFit(frame, content, minHeight, () => props.component)

const src = computed(() => `/frame/${props.slug}/${props.story.key}`)

// A story of the page is drawn at a desktop's width and scaled down into its frame, so a page's
// part shows the page it belongs to (a sidebar beside its content, not folded away below 768px);
// in a frame as narrow as a phone's it is drawn at the frame's own width, as a phone would.
const DESKTOP = 1024
const PHONE = 640
const shell = ref<HTMLElement>()
const shellWidth = ref(0)
const pageWidth = computed(() => (shellWidth.value < PHONE ? shellWidth.value : Math.max(shellWidth.value, DESKTOP)))
const scale = computed(() => (pageWidth.value ? shellWidth.value / pageWidth.value : 1))
const pageHeight = () => props.story.height ?? 560
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => (shellWidth.value = Math.round(entry?.contentRect.width ?? 0)))
  if (shell.value) observer.observe(shell.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="story.fullscreen"
    ref="shell"
    class="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-bg"
    :style="{ height: `${pageHeight()}px` }"
  >
    <iframe
      v-if="shellWidth"
      :src="src"
      :title="story.name"
      loading="lazy"
      class="block origin-top-left"
      :style="{ width: `${pageWidth}px`, height: `${pageHeight() / scale}px`, scale }"
    />
  </div>
  <div
    v-else
    ref="frame"
    class="story-stage rounded-[var(--radius-xl)] border border-border p-6"
    :style="{ minHeight: `${fitted}px` }"
  >
    <div ref="content" class="story-content">
      <component :is="component" />
    </div>
  </div>
</template>
