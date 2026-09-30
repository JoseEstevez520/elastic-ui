<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A hand-drawn diagram's frame: a `figure` that says in words what it shows, with an optional
 * caption, and brings the drawing in once, as a group, when it first comes into view. Inside, the
 * drawing is yours, an `<svg class="diagram">` with the diagram classes (see USAGE 10), or HTML
 * with `diagram-chip`s; mark what should come in with `diagram-in`, and it does in order.
 */
const props = defineProps<{
  /** What it shows, for those who cannot see it. */
  label: string
  caption?: string
  class?: HTMLAttributes['class']
}>()

const root = useTemplateRef<HTMLElement>('root')
const shown = ref(false)
// Waiting once mounted and until seen: before any script runs (server rendering) it simply shows.
const waiting = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  waiting.value = true
  // Numbered in order, so they come in one after another.
  root.value?.querySelectorAll<HTMLElement | SVGElement>('.diagram-in').forEach((el, i) => el.style.setProperty('--diagram-index', String(i)))
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      waiting.value = false
      shown.value = true
      observer?.disconnect()
    },
    // Nearly all of it in view, not peeking in at the bottom edge.
    { threshold: 0.8 },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <figure ref="root" role="img" :aria-label="label" :data-waiting="waiting || undefined" :data-shown="shown || undefined" :class="cn('diagram-frame', props.class)">
    <slot />
    <figcaption v-if="caption" class="mt-3 text-ui text-fg-muted">{{ caption }}</figcaption>
  </figure>
</template>
