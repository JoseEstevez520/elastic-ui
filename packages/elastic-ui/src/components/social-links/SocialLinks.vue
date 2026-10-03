<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useEventListener } from '../../composables/useEventListener'
import { provideSocialLinksContext, SOCIAL_LINK_SIZE } from './social-links.context'

/**
 * A row of the places someone can be found: GitHub, LinkedIn, an email. At rest each is its logo
 * in its own colour on a round tray; pointed at or focused, its tray widens into its handle over a
 * tint of the brand (Instagram's gradient, LinkedIn's blue), and the others make room.
 *
 * Every handle shows from the start where opening one would not fit on the row, measured from the
 * handles rather than guessed from a breakpoint: a tray widening past the edge would drop to the
 * next line, out from under the pointer, close, come back under it and open again, for ever. It
 * does too where there is no pointer to hover with, as on a phone.
 */
const props = defineProps<{
  /** Every handle shows at rest. */
  expanded?: boolean
  /** The list's name, for screen readers. */
  label?: string
  class?: HTMLAttributes['class']
}>()

// A touch screen cannot point at one link to open it, so they all stay open.
const noHover = ref(false)
const hoverQuery = () => window.matchMedia('(hover: none)')
useEventListener<MediaQueryListEvent>(hoverQuery, 'change', (event) => (noHover.value = event.matches))

// The row's room and its gap, and each link's width when open.
const list = useTemplateRef<HTMLElement>('list')
const room = ref(Infinity)
const gap = ref(0)
const openWidths = reactive(new Map<string, number>())

// The row closed, with its widest link open in place of one tray.
const opensInPlace = computed(() => {
  const widths = [...openWidths.values()]
  if (!widths.length) return true
  const closed = widths.length * SOCIAL_LINK_SIZE + (widths.length - 1) * gap.value
  return closed - SOCIAL_LINK_SIZE + Math.max(...widths) <= room.value
})

let observer: ResizeObserver | undefined
onMounted(() => {
  noHover.value = hoverQuery().matches
  const el = list.value
  if (!el) return
  gap.value = parseFloat(getComputedStyle(el).columnGap) || 0
  observer = new ResizeObserver(([entry]) => {
    if (entry) room.value = entry.contentRect.width
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

provideSocialLinksContext({
  expanded: computed(() => props.expanded || noHover.value || !opensInPlace.value),
  reportWidth: (id, width) => {
    if (width === undefined) openWidths.delete(id)
    else if (openWidths.get(id) !== width) openWidths.set(id, width)
  },
})
</script>

<template>
  <ul ref="list" :aria-label="label" :class="cn('flex flex-wrap items-center gap-2', props.class)">
    <slot />
  </ul>
</template>
