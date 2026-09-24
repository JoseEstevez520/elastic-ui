<script setup lang="ts">
import { motion } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import ExpandableCardMorph from './ExpandableCardMorph.vue'
import { useExpandableCardRegion } from './expandable-card.context'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const region = useExpandableCardRegion()
</script>

<template>
  <!-- Two elements: layout projection owns the outer one's `transform`, so the inner one spins. -->
  <ExpandableCardMorph name="indicator" :class="cn('shrink-0 pt-0.5 text-fg-faint', props.class)">
    <motion.span
      aria-hidden="true"
      class="block size-4"
      :initial="false"
      :animate="{ rotate: region.expanded ? 45 : 0 }"
      :transition="{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </motion.span>
  </ExpandableCardMorph>
</template>
