<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import ImageView from '../image-view/ImageView.vue'

/**
 * A picture with its caption under it, as a `figure`. The picture grows into full view where it
 * is when pressed (ImageView), and the same caption comes into focus under it there. With `video`
 * it is a clip that plays in a loop and opens the same way. Put anything else in the default slot
 * and the caption stays the same.
 */
const props = withDefaults(
  defineProps<{
    /** The picture, unless the default slot brings something else; with `video`, its poster. */
    src?: string
    /** A clip in place of the picture: it plays muted and in a loop, and opens with its controls. */
    video?: string
    alt?: string
    /** A short line under it, also shown in the full view. The `caption` slot takes richer content. */
    caption?: string
    /** A larger file for the full view. */
    fullSrc?: string
    /** Pressing the picture opens it. Turn it off for a picture that has nothing more to show. */
    zoomable?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { zoomable: true },
)
</script>

<template>
  <figure :class="cn('flex flex-col gap-2', props.class)">
    <slot>
      <ImageView
        v-if="(src || video) && zoomable"
        :src="src ?? ''"
        :video="video"
        :alt="alt ?? ''"
        :caption="caption"
        :full-src="fullSrc"
        class="w-full rounded-[var(--radius-lg)]"
      />
      <video
        v-else-if="video"
        :src="video"
        :poster="src"
        muted
        loop
        autoplay
        playsinline
        class="w-full rounded-[var(--radius-lg)]"
      />
      <img v-else-if="src" :src="src" :alt="alt ?? ''" class="w-full rounded-[var(--radius-lg)]" />
    </slot>
    <figcaption v-if="caption || $slots.caption" class="text-meta text-fg-muted">
      <slot name="caption">{{ caption }}</slot>
    </figcaption>
  </figure>
</template>
