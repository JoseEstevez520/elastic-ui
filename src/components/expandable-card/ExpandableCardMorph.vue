<script setup lang="ts">
import { motion } from 'motion-v'
import { useExpandableCardRegion } from './expandable-card.context'

/**
 * Makes a piece of the head travel on its own between the cell and the overlay. Each piece
 * needs its own shared `layoutId`: without one it has no previous box to animate from and lands
 * straight on its final position, as if flying in from outside.
 *
 * Keep morphing pieces at the same size in both states, since a size change is drawn as a
 * stretch.
 */
defineProps<{ name: string }>()
const { id, placement } = useExpandableCardRegion()
</script>

<template>
  <div v-if="placement === 'placeholder'"><slot /></div>
  <motion.div v-else :layout-id="`${id}-${name}`"><slot /></motion.div>
</template>
