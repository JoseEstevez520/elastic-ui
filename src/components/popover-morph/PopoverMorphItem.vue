<script setup lang="ts">
import { RovingFocusItem } from 'reka-ui'
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { menuIconClass, menuShortcutClass } from '../menu/menu.variants'
import { usePopoverMorphContext } from './popover-morph.context'
import { popoverMorphItemClass } from './popover-morph.variants'

/**
 * An action in a PopoverMorph with `role="menu"`, styled like a MenuItem. Choosing it closes the
 * menu, and focus goes back to the trigger; call `preventDefault()` on the `select` event to keep
 * it open.
 */
const props = defineProps<{
  icon?: Component
  /** A keyboard shortcut to show on the right, such as `⌘K`. Only shown; binding it is up to the app. */
  shortcut?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
const emit = defineEmits<{ select: [event: Event] }>()

// The chosen item stays marked for a moment before the menu folds, as native menus do, so what was
// picked registers before everything moves.
const HOLD = 80
const { close } = usePopoverMorphContext()
function choose(event: Event) {
  emit('select', event)
  if (!event.defaultPrevented) setTimeout(close, HOLD)
}
</script>

<template>
  <RovingFocusItem as-child :focusable="!disabled">
    <button
      type="button"
      role="menuitem"
      :aria-disabled="disabled || undefined"
      :class="cn(popoverMorphItemClass, props.class)"
      @click="!disabled && choose($event)"
    >
      <component :is="icon" v-if="icon" aria-hidden="true" :class="menuIconClass" />
      <slot />
      <span v-if="shortcut" :class="menuShortcutClass">{{ shortcut }}</span>
    </button>
  </RovingFocusItem>
</template>
