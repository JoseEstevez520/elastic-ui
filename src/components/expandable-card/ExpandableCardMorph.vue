<script setup lang="ts">
import { motion } from 'motion-v'
import { useExpandableCardRegion } from './expandable-card.context'

/**
 * Makes a piece of the head travel on its own between the cell and the overlay. Each piece
 * needs its own shared `layoutId`: without one it has no previous box to animate from and lands
 * straight on its final position, as if flying in from outside.
 *
 * Only the position animates. A size change would be drawn as a scale, and scaled text is
 * stretched text; the box takes its new size at once and the text inside reflows instead.
 */
defineProps<{ name: string }>()
const { id, placement } = useExpandableCardRegion()
</script>

<template>
  <div v-if="placement === 'placeholder'"><slot /></div>
  <motion.div v-else layout="position" :layout-id="`${id}-${name}`"><slot /></motion.div>
</template>
