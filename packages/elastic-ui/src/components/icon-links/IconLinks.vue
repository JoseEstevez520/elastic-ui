<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, toRef, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useEventListener } from '../../composables/useEventListener'
import { ICON_LINK_SIZE, provideIconLinksContext, type IconLinksVariant } from './icon-links.context'

/**
 * A row of links each shown by its icon alone, that open into their words when pointed at: the
 * places someone can be found (GitHub, LinkedIn, an email), or what a project offers (its site,
 * its code). A logo is in its own colour; pointed at or focused, its tray widens into its label
 * over a tint of the brand (Instagram's gradient, LinkedIn's blue), and the others make room.
 * `ghost` has no tray at rest, for a row over colour (a Glow) or beside text.
 *
 * Every label shows from the start where opening one would not fit on the row, measured from the
 * labels rather than guessed from a breakpoint: a tray widening past the edge would drop to the
 * next line, out from under the pointer, close, come back under it and open again, for ever. It
 * does too where there is no pointer to hover with, as on a phone.
 */
const props = withDefaults(
  defineProps<{
    /** `default`: a round tray under each icon. `ghost`: the icon alone until it opens. */
    variant?: IconLinksVariant
    /** Every label shows at rest. */
    expanded?: boolean
    /** The list's name, for screen readers. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'default' },
)

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
  const closed = widths.length * ICON_LINK_SIZE + (widths.length - 1) * gap.value
  // A row as wide as its closed trays is shrink-wrapped (in a flex item, `w-fit`): nothing limits it,
  // it grows with the tray, so opening one fits. Measured against itself it never would, and the
  // links would stay open for ever.
  if (Math.abs(room.value - closed) < 1) return true
  return closed - ICON_LINK_SIZE + Math.max(...widths) <= room.value
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

provideIconLinksContext({
  expanded: computed(() => props.expanded || noHover.value || !opensInPlace.value),
  variant: toRef(props, 'variant'),
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
