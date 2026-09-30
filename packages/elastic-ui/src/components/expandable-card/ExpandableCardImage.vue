<script setup lang="ts">
import { motion } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import { imageFade } from '../card/card.variants'
import { morphCloseTransition } from '../../utils/motion'
import { cn } from '../../utils/cn'
import { useExpandableCardRegion } from './expandable-card.context'

/**
 * Full-bleed image at the top of the card: at its own ratio in the cell, a wide banner in the
 * open card. Goes in the card's `#media` slot.
 *
 * The frame changes shape but the image never does. It keeps its ratio, grows uniformly and is
 * cropped by the frame, so it is never squashed mid-morph. Both carry their own `layoutId`:
 * the frame's changes in shape are only ever seen as a changing crop.
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    /** The image's aspect ratio, as CSS `aspect-ratio`. The cell shows it uncropped. */
    ratio?: string
    /** Fades the bottom edge into the card. */
    fade?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { alt: '', ratio: '21 / 9' },
)

const { id, placement } = useExpandableCardRegion()
const open = placement === 'overlay'
// Landing back in the cell is faster than leaving it.
const transition = open ? undefined : morphCloseTransition

// The open banner's height; the cell's follows from the ratio.
const frameStyle = open
  ? { height: 'var(--expandable-card-banner-height, 12rem)' }
  : { aspectRatio: props.ratio }
const frameClass = cn('relative flex items-center overflow-hidden', props.fade && imageFade, props.class)
</script>

<template>
  <div v-if="placement === 'placeholder'" :style="frameStyle" :class="frameClass" />
  <motion.div v-else :layout-id="`${id}-media`" :transition="transition" :style="frameStyle" :class="frameClass">
    <motion.img
      :layout-id="`${id}-media-image`"
      :transition="transition"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      :style="{ aspectRatio: ratio }"
      class="block w-full shrink-0 object-cover"
    />
  </motion.div>
</template>
