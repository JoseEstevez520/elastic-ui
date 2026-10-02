<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { logoColor, type LogoIcon } from './logo.utils'

/**
 * A technology's or a brand's logo. Given an `icon` (Simple Icons' `siVuedotjs`, passed in as any
 * icon is, so the library ships none), it is drawn in the brand's own colour where that reads on
 * the theme's ground, and in the text's where it does not (a near-black brand in the dark theme);
 * `mono` draws it in the text's colour always. For a brand Simple Icons lacks, `src` takes an image
 * of its own; with `mono`, a one-colour image is drawn in the text's colour too, so it reads in
 * both themes (from your own site: it is used as a mask, which other sites must allow).
 */
const props = defineProps<{
  icon?: LogoIcon
  src?: string
  /** What it is, for screen readers: the icon's title by default. Empty beside its own name. */
  alt?: string
  /** In the text's colour rather than the brand's. */
  mono?: boolean
  class?: HTMLAttributes['class']
}>()

const name = computed(() => props.alt ?? props.icon?.title ?? '')
const color = computed(() => (props.mono ? undefined : logoColor(props.icon?.hex)))
// Drawn through the image as a mask, so it takes the text's colour in either theme.
const mask = computed(() => (props.src ? { mask: `url(${JSON.stringify(props.src)}) center / contain no-repeat` } : undefined))
const a11y = computed(() => (name.value ? { role: 'img', 'aria-label': name.value } : { 'aria-hidden': 'true' as const }))
</script>

<template>
  <svg
    v-if="icon"
    viewBox="0 0 24 24"
    fill="currentColor"
    v-bind="a11y"
    :class="cn('size-5 shrink-0', props.class)"
    :style="color ? { color } : undefined"
  >
    <path :d="icon.path" />
  </svg>
  <span
    v-else-if="src && mono"
    v-bind="a11y"
    :class="cn('inline-block size-5 shrink-0 bg-current', props.class)"
    :style="mask"
  />
  <img
    v-else-if="src"
    :src="src"
    :alt="name"
    loading="lazy"
    decoding="async"
    :class="cn('size-5 shrink-0 object-contain', props.class)"
  />
</template>
