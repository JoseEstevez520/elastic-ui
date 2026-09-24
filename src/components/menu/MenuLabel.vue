<script setup lang="ts">
import { DropdownMenuLabel } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { menuLabelClass } from './menu.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DropdownMenuLabel :class="cn(menuLabelClass, props.class)">
    <slot />
  </DropdownMenuLabel>
</template>
