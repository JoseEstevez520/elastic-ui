<script setup lang="ts">
import { motion } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentIn, contentOut } from '../../utils/motion'
import { useExpandableCardRegion } from './expandable-card.context'

/**
 * A logo or icon shown only on the open card. Always mounted there and faded with the body,
 * so the title never jumps sideways when it appears or goes.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const region = useExpandableCardRegion()
</script>

<template>
  <motion.div
    v-if="region.placement === 'overlay'"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: region.expanded ? 1 : 0, transition: region.expanded ? contentIn : contentOut }"
    :class="cn('shrink-0', props.class)"
  >
    <slot />
  </motion.div>
</template>
