<script setup lang="ts">
import { computed } from 'vue'
import { useLink } from '../../utils/link'
import type { TimetableEvent } from './timetable.types'

// Internal: one block of a Timetable, a link to its page when it has one.
const props = defineProps<{ event: TimetableEvent; link?: boolean }>()
const target = useLink({
  get to() {
    return props.link ? props.event.to : undefined
  },
  get href() {
    return props.link ? props.event.href : undefined
  },
})

// Its colour as a soft tint, and its title in it mixed with the theme's text colour, so it reads
// as well in light as in dark.
const tint = computed(() => props.event.color ?? 'var(--color-fg-muted)')
</script>

<template>
  <component
    :is="target?.is ?? 'div'"
    v-bind="target?.attrs"
    :class="['m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-[var(--radius-md)] px-2.5 py-2 transition-opacity duration-150 focus-ring', target && 'hover:opacity-80']"
    :style="{ backgroundColor: `color-mix(in oklab, ${tint} 14%, var(--color-bg))` }"
  >
    <span class="text-sm leading-tight font-semibold" :style="{ color: `color-mix(in oklab, ${tint} 75%, var(--color-fg))` }">{{ event.title }}</span>
    <span v-if="event.detail" class="mask-fade-r text-xs leading-tight whitespace-nowrap text-fg-secondary">{{ event.detail }}</span>
  </component>
</template>
