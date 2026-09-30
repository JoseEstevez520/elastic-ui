<script setup lang="ts">
import { ListboxGroupLabel } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ListboxGroupLabel :class="cn('px-2.5 pt-2 pb-1 text-meta text-fg-muted', props.class)">
    <slot />
  </ListboxGroupLabel>
</template>
