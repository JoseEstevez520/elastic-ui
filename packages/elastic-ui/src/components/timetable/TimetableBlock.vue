<script setup lang="ts">
import { computed } from 'vue'
import { useLink } from '../../utils/link'
import TruncatedText from '../truncated-text/TruncatedText.vue'
import type { TimetableEvent } from './timetable.types'

// Internal: one block of a Timetable, a link to its page when it has one. With `editable`, it
// takes the pointer itself (to move) and grows a thin handle along its top and bottom edge (to
// resize); it never links, so dragging it never starts a navigation.
const props = defineProps<{ event: TimetableEvent; link?: boolean; editable?: boolean; selected?: boolean }>()
const emit = defineEmits<{ 'resize-top': [event: PointerEvent]; 'resize-bottom': [event: PointerEvent] }>()
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
    :is="editable ? 'div' : (target?.is ?? 'div')"
    v-bind="editable ? {} : target?.attrs"
    :tabindex="editable ? 0 : undefined"
    :role="editable ? 'button' : undefined"
    :class="[
      'relative m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-[var(--radius-md)] px-2.5 py-2 transition-opacity duration-150 focus-ring',
      target && !editable && 'hover:opacity-80',
      editable && 'cursor-grab touch-none select-none active:cursor-grabbing',
      selected && 'ring-2 ring-[color:var(--color-fg)] ring-offset-1 ring-offset-[color:var(--color-bg)]',
    ]"
    :style="{ backgroundColor: `color-mix(in oklab, ${tint} 14%, var(--color-bg))` }"
  >
    <span class="pointer-events-none text-label leading-tight" :style="{ color: `color-mix(in oklab, ${tint} 75%, var(--color-fg))` }">{{ event.title }}</span>
    <TruncatedText v-if="event.detail" class="pointer-events-none text-meta leading-tight text-fg-secondary">{{ event.detail }}</TruncatedText>

    <template v-if="editable">
      <div class="absolute inset-x-0 top-0 h-1.5 cursor-ns-resize touch-none" @pointerdown.stop="emit('resize-top', $event)" />
      <div class="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize touch-none" @pointerdown.stop="emit('resize-bottom', $event)" />
    </template>
  </component>
</template>
