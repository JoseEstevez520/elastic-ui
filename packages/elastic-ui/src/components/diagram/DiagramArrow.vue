<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { ArrowBothIcon, ArrowRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useDiagramContext } from './diagram.context'

/**
 * A plain arrow between the parts before and after it, pointing along the way they run: across
 * in a row, down in a column or a row stacked on a phone, turning when a row does. `both` points
 * both ways, `label` puts a word on it ("calls"). Quiet, as every connection is (USAGE 10).
 */
const props = defineProps<{
  label?: string
  /** Points both ways (⇄). */
  both?: boolean
  class?: HTMLAttributes['class']
}>()

const context = useDiagramContext()
// Outside a group it sits in a line of text, pointing across.
const direction = computed(() => (context ? context.direction.value : 'across'))
</script>

<template>
  <span
    aria-hidden="true"
    :class="cn('diagram-in inline-flex shrink-0 items-center justify-center gap-1 self-center text-meta text-fg-faint', props.class)"
  >
    <component
      :is="both ? ArrowBothIcon : ArrowRightIcon"
      :class="['size-4 shrink-0', direction === 'down' ? 'rotate-90' : direction === undefined && 'max-sm:rotate-90']"
      :stroke-width="1.5"
    />
    <span v-if="label">{{ label }}</span>
  </span>
</template>
