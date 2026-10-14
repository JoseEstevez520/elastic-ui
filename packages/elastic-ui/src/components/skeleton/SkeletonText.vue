<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import Skeleton from './Skeleton.vue'

/** Lines of text still to come: `lines` placeholders, the last one shorter, as a paragraph ends. */
const props = withDefaults(
  defineProps<{
    lines?: number
    class?: HTMLAttributes['class']
  }>(),
  { lines: 3 },
)
</script>

<template>
  <div aria-hidden="true" :class="cn('flex flex-col gap-2.5', props.class)">
    <Skeleton
      v-for="n in Math.max(1, lines)"
      :key="n"
      :class="cn('h-3.5 w-full', n === Math.max(1, lines) && n > 1 && 'w-3/5')"
    />
  </div>
</template>
