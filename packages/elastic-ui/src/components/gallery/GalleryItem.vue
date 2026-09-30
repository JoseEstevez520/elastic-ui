<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import ImageView from '../image-view/ImageView.vue'

/**
 * One piece of work in a Gallery: its picture, and its name and a line under it, with no box round
 * them (fewer boxes). `zoom` makes the picture an ImageView, which grows into full view where it
 * is; otherwise it is a plain image, for an item that is a link to its page.
 */
const props = defineProps<{
  src: string
  alt: string
  title?: string
  /** A line under the title: the year, the kind of work. */
  meta?: string
  zoom?: boolean
  class?: HTMLAttributes['class']
}>()
const picture = 'aspect-[4/3] w-full rounded-[var(--gallery-radius,var(--radius-lg))] bg-surface object-cover'
</script>

<template>
  <figure :class="cn('flex flex-col gap-2', props.class)">
    <ImageView v-if="zoom" :src="src" :alt="alt" :caption="title" :class="picture" />
    <img v-else :src="src" :alt="alt" :class="picture" loading="lazy" />
    <figcaption v-if="title || meta" class="flex flex-col">
      <span v-if="title" class="text-label text-fg">{{ title }}</span>
      <span v-if="meta" class="text-meta text-fg-muted">{{ meta }}</span>
    </figcaption>
  </figure>
</template>
