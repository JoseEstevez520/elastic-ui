<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useTruncated } from '../../composables/useTruncated'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import TextMorph from '../text-morph/TextMorph.vue'
import { filtersPillClass, filtersPillLabelClass, filtersPillRemoveClass } from './filters.variants'

// Internal: a filter in use. Pressing it opens its category; its cross takes it away.
const props = defineProps<{ category: string; values: string }>()
const emit = defineEmits<{ open: []; remove: [] }>()
const labels = useLabels()

// Values too long for the row give way, ending in a fading edge rather than an ellipsis, since
// they morph; the edge only shows while they do not fit.
const valuesEl = useTemplateRef<HTMLElement>('valuesEl')
const truncated = useTruncated(valuesEl, () => props.values)
</script>

<template>
  <div :class="filtersPillClass">
    <button type="button" :class="filtersPillLabelClass" @click="emit('open')">
      <span class="shrink-0 text-fg-muted">{{ category }}:</span>
      <span ref="valuesEl" :class="cn('min-w-0 overflow-hidden whitespace-nowrap text-fg', truncated && 'mask-fade-r')">
        <TextMorph :text="values" />
      </span>
    </button>
    <button type="button" :aria-label="`${labels.removeFilter}: ${category}`" :class="filtersPillRemoveClass" @click="emit('remove')">
      <XIcon aria-hidden="true" class="size-3.5" />
    </button>
  </div>
</template>
