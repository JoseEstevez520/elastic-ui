<script setup lang="ts">
import { motion } from 'motion-v'
import { TabsContent } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

const props = defineProps<{
  value: string
  class?: HTMLAttributes['class']
}>()

// The library's one way of appearing: a fade, without the morph delay since nothing moves first.
const fadeIn = { duration: 0.22, ease: 'linear' } as const
</script>

<template>
  <TabsContent
    :value="value"
    :class="cn('focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent', props.class)"
  >
    <motion.div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="fadeIn">
      <slot />
    </motion.div>
  </TabsContent>
</template>
