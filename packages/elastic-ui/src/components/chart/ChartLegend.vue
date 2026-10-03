<script setup lang="ts">
import type { ChartVariant } from './chart.types'

/** The series' names, each after a key shaped as its mark: a stroke, a bar's square, a point. */
defineProps<{
  items: Array<{ name: string; color: string }>
  variant: ChartVariant
}>()
</script>

<template>
  <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-meta text-fg-secondary" aria-hidden="true">
    <li v-for="item in items" :key="item.name" class="inline-flex items-center gap-1.5">
      <span
        :class="
          variant === 'line'
            ? 'h-0.5 w-3 rounded-full'
            : variant === 'bars'
              ? 'size-2 rounded-[2px]'
              : 'size-2 rounded-full'
        "
        :style="{ background: item.color }"
      />
      {{ item.name }}
    </li>
  </ul>
</template>
