<script setup lang="ts">
import { DropdownMenuItem, useForwardPropsEmits, type DropdownMenuItemEmits, type DropdownMenuItemProps } from 'reka-ui'
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { menuIconClass, menuItemClass, menuShortcutClass } from './menu.variants'

const props = defineProps<
  DropdownMenuItemProps & {
    icon?: Component
    /** A keyboard shortcut to show on the right, such as `⌘K`. Only shown; binding it is up to the app. */
    shortcut?: string
    class?: HTMLAttributes['class']
  }
>()
const emits = defineEmits<DropdownMenuItemEmits>()

const forwarded = useForwardPropsEmits(useDelegatedProps(props, 'icon', 'shortcut'), emits)
</script>

<template>
  <DropdownMenuItem v-bind="forwarded" :class="cn(menuItemClass, props.class)">
    <component :is="icon" v-if="icon" aria-hidden="true" :class="menuIconClass" />
    <slot />
    <span v-if="shortcut" :class="menuShortcutClass">{{ shortcut }}</span>
  </DropdownMenuItem>
</template>
