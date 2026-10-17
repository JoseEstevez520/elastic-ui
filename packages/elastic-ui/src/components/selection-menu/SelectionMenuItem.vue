<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useSelectionMenu } from './selection-menu.context'
import { selectionItemClass } from './selection-menu.variants'

/**
 * An action on the selected text. `select` receives the text; the selection is let go
 * afterwards unless the handler calls `preventDefault()` on the event, to keep it for more.
 */
const props = defineProps<{ icon?: Component; class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{ select: [text: string, event: MouseEvent] }>()

const { text, clear } = useSelectionMenu()
function choose(event: MouseEvent) {
  emit('select', text.value, event)
  if (!event.defaultPrevented) clear()
}
</script>

<template>
  <button type="button" :class="cn(selectionItemClass, props.class)" @click="choose">
    <component :is="icon" v-if="icon" aria-hidden="true" class="size-4 shrink-0" />
    <slot />
  </button>
</template>
