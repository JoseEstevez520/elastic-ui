<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A quiet hairline between groups, where space alone does not part them (DECISIONS, Philosophy 3:
 * fewer boxes, so reach for it last). Across, it can carry a short label in its middle ("or"),
 * the line running on either side. `decorative` hides it from screen readers.
 */
const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    /** Across only: a word in its middle. */
    label?: string
    decorative?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { orientation: 'horizontal' },
)
const line = 'bg-[color:var(--separator-color,var(--color-border))]'
</script>

<template>
  <div
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="decorative || orientation === 'horizontal' ? undefined : 'vertical'"
    :class="
      cn(
        orientation === 'vertical'
          ? ['w-px shrink-0 self-stretch', line]
          : label
            ? 'flex w-full items-center gap-3'
            : ['h-px w-full shrink-0', line],
        props.class,
      )
    "
  >
    <template v-if="orientation === 'horizontal' && label">
      <span aria-hidden="true" :class="['h-px flex-1', line]" />
      <span class="text-meta text-fg-muted">{{ label }}</span>
      <span aria-hidden="true" :class="['h-px flex-1', line]" />
    </template>
  </div>
</template>
