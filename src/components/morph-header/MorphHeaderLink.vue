<script setup lang="ts">
import { motion } from 'motion-v'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useMorphHeaderContext, useMorphHeaderPlacement } from './morph-header.context'
import { morphHeaderLinkVariants } from './morph-header.variants'

const props = defineProps<{
  href: string
  active?: boolean
  class?: HTMLAttributes['class']
}>()
const { close } = useMorphHeaderContext()
const placement = useMorphHeaderPlacement()
</script>

<template>
  <!-- Inline links carry `layout` so the bar's morph moves them instead of stretching them. -->
  <motion.a
    :layout="placement === 'inline'"
    :href="href"
    :aria-current="active ? 'page' : undefined"
    :class="cn(morphHeaderLinkVariants({ placement }), props.class)"
    @click="placement === 'panel' && close()"
  >
    <slot />
  </motion.a>
</template>
