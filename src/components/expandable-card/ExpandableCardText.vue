<script setup lang="ts">
import { motion } from 'motion-v'
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentIn, contentOut } from '../../utils/motion'
import { useExpandableCardRegion } from './expandable-card.context'

/**
 * One line of head text that never wraps, so the head's height never depends on its width.
 *
 * A line that does not fit fades out at its edge instead of ending in an ellipsis. An ellipsis
 * is either there or not and cannot be animated, so swapping it for the full line always lands
 * as a jump; a fading edge can. In the open card the faded edge and the hidden rest fade in
 * together with the body, and fade back out before the card returns to its cell.
 */
const props = withDefaults(
  defineProps<{
    /** Unique within the card. Pairs this text between the cell and the open card. */
    name: string
    as?: string
    class?: HTMLAttributes['class']
  }>(),
  { as: 'p' },
)

const region = useExpandableCardRegion()
const el = useTemplateRef<HTMLElement>('el')

/** Width of the fading edge. */
const FADE = 24

const truncated = ref(false)
let observer: ResizeObserver | undefined

onMounted(() => {
  const node = el.value
  if (!node || region.placement === 'overlay') return
  const measure = () => (truncated.value = node.scrollWidth > node.clientWidth)
  observer = new ResizeObserver(measure)
  observer.observe(node)
  measure()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  const node = el.value
  if (!node || region.placement !== 'cell') return
  if (truncated.value) region.textWidths.set(props.name, node.clientWidth)
  else region.textWidths.delete(props.name)
})

const edgeMask = `linear-gradient(to right, #000 calc(100% - ${FADE}px), transparent)`

// Where the line was cut in the cell. At `--rest: 0` this draws the same fading edge the cell
// showed; at `--rest: 1` the whole line.
const cutAt = region.placement === 'overlay' ? region.textWidths.get(props.name) : undefined
const openingMask =
  cutAt === undefined
    ? undefined
    : `linear-gradient(to right, #000 ${cutAt - FADE}px, rgb(0 0 0 / var(--rest)) ${cutAt}px)`
</script>

<template>
  <motion.div
    v-if="openingMask"
    :initial="{ '--rest': 0 }"
    :animate="{ '--rest': region.expanded ? 1 : 0, transition: region.expanded ? contentIn : contentOut }"
    :style="{ maskImage: openingMask }"
  >
    <component :is="as" :class="cn('overflow-hidden whitespace-nowrap', props.class)"><slot /></component>
  </motion.div>
  <component
    :is="as"
    v-else
    ref="el"
    :style="truncated ? { maskImage: edgeMask } : undefined"
    :class="cn('overflow-hidden whitespace-nowrap', props.class)"
  >
    <slot />
  </component>
</template>
