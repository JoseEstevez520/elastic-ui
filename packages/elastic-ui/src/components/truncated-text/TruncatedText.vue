<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { useTruncated } from '../../composables/useTruncated'
import { cn } from '../../utils/cn'

/**
 * One line that ends in a fading edge only when it runs past its box, never an ellipsis (DECISIONS,
 * "Truncate with a fading edge"). A line that fits keeps every letter. It measures itself as it
 * resizes and as its content changes, so it serves a list of rows, where `useTruncated` would need
 * a ref per row. In a flex row, give it `min-w-0` (or `flex-1`) so it can shrink.
 */
const props = withDefaults(
  defineProps<{
    as?: string
    class?: HTMLAttributes['class']
  }>(),
  { as: 'span' },
)

const el = useTemplateRef<HTMLElement>('el')
// Text changing in a box already at its widest does not resize it, so changes are watched too.
const changes = ref(0)
const truncated = useTruncated(el, changes)
let observer: MutationObserver | undefined
onMounted(() => {
  observer = new MutationObserver(() => changes.value++)
  if (el.value) observer.observe(el.value, { childList: true, characterData: true, subtree: true })
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <component :is="as" ref="el" :class="cn('block overflow-hidden whitespace-nowrap', truncated && 'mask-fade-r', props.class)">
    <slot />
  </component>
</template>
