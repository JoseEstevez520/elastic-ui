<script setup lang="ts">
import { DropdownMenuSubTrigger, type DropdownMenuSubTriggerProps } from 'reka-ui'
import type { Component, HTMLAttributes } from 'vue'
import { ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { menuIconClass, menuItemClass } from './menu.variants'

const props = defineProps<DropdownMenuSubTriggerProps & { icon?: Component; class?: HTMLAttributes['class'] }>()
const delegated = useDelegatedProps(props, 'icon')
</script>

<template>
  <!-- Stays highlighted while its submenu is open, so the path to it reads at a glance. -->
  <DropdownMenuSubTrigger v-bind="delegated" :class="cn(menuItemClass, 'data-[state=open]:bg-bg-muted', props.class)">
    <component :is="icon" v-if="icon" aria-hidden="true" :class="menuIconClass" />
    <slot />
    <ChevronRightIcon aria-hidden="true" class="ml-auto size-4 text-fg-faint" />
  </DropdownMenuSubTrigger>
</template>
