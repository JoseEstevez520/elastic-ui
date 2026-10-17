<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRightIcon, PlusIcon } from '../../icons/internal'
import { useLabels } from '../../utils/labels'

/**
 * What a row's `mark` looks like: a small tinted icon after the label, as Status does, with the
 * word for screen readers. The label itself keeps its colour. Used by NavTreeItem and NavTreeGroup.
 */
const props = defineProps<{ mark: 'new' | 'moved' }>()

const labels = useLabels()
const text = computed(() => (props.mark === 'new' ? labels.markNew : labels.markMoved))
</script>

<template>
  <span class="ml-2 inline-flex shrink-0 items-center" data-nav-tree-mark>
    <component
      :is="mark === 'new' ? PlusIcon : ArrowRightIcon"
      aria-hidden="true"
      :class="['size-3.5', mark === 'new' ? 'text-success' : 'text-accent']"
    />
    <span class="sr-only">{{ text }}</span>
  </span>
</template>
