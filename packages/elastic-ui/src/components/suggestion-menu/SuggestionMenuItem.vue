<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { menuIconClass, menuItemClass } from '../menu/menu.variants'
import { useSuggestionMenuContext } from './suggestion-menu.context'

/**
 * One suggestion: its icon and its name. Pointing at it highlights it and a click picks it;
 * pressing it never takes the focus from the text being written.
 */
const props = defineProps<{
  value: string
  icon?: Component
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const menu = useSuggestionMenuContext('SuggestionMenuItem')
const highlighted = computed(() => menu.highlighted.value === props.value)
</script>

<template>
  <div
    :id="menu.idOf(value)"
    role="option"
    :aria-selected="highlighted"
    :aria-disabled="disabled || undefined"
    :data-suggestion-value="value"
    :data-highlighted="highlighted ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :class="cn(menuItemClass, props.class)"
    @pointerdown.prevent
    @pointermove="!disabled && (menu.highlighted.value = value)"
    @click="!disabled && menu.select(value)"
  >
    <component :is="icon" v-if="icon" aria-hidden="true" :class="menuIconClass" />
    <slot />
  </div>
</template>
