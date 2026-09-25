<script setup lang="ts">
import { ListboxItem } from 'reka-ui'
import { computed, onBeforeUnmount, ref, useId, useSlots, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { textOf } from '../../utils/textOf'
import { matchesQuery } from '../../utils/search'
import { useCommandGroup, useCommandPaletteContext } from './command-palette.context'
import {
  commandIconClass,
  commandItemClass,
  commandItemInClass,
  commandShortcutClass,
} from './command-palette.variants'

/**
 * One command. Found by its text, its `value` and its `keywords`; choosing it (click or Enter)
 * emits `select` and closes the palette, unless the handler calls `event.preventDefault()`.
 */
const props = defineProps<{
  /** Unique within the palette. Also searched, so it can hold a slug or an id. */
  value: string
  /** More words it is found by, such as synonyms or another language. */
  keywords?: string[]
  icon?: Component
  /** A keyboard shortcut to show on the right. Only shown; binding it is up to the app. */
  shortcut?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{ select: [event: CustomEvent] }>()

const context = useCommandPaletteContext()
const slots = useSlots()
const matches = computed(() =>
  matchesQuery(context.query.value, `${textOf(slots.default) ?? ''} ${props.value}`, props.keywords),
)
onBeforeUnmount(context.register(useId(), useCommandGroup(), matches))

// Only an item coming back as the query changes comes into focus on its own; on opening, the
// palette's wave brings them all in.
const returning = ref(false)
watch(matches, (now) => (returning.value = now))

function onSelect(event: CustomEvent) {
  emit('select', event)
  if (!event.defaultPrevented) context.close()
}
</script>

<template>
  <ListboxItem
    v-if="matches"
    :value="value"
    :disabled="disabled"
    :class="cn(commandItemClass, returning && commandItemInClass, props.class)"
    @select="onSelect"
  >
    <component :is="icon" v-if="icon" aria-hidden="true" :class="commandIconClass" />
    <!-- Fills the row, so the fading edge only reaches text too long for it. -->
    <span class="min-w-0 flex-1 overflow-hidden whitespace-nowrap mask-fade-r">
      <slot />
    </span>
    <span v-if="shortcut" :class="commandShortcutClass">{{ shortcut }}</span>
  </ListboxItem>
</template>
