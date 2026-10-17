<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * What a list or a page says while it has nothing to show: quiet, so the one thing to do next
 * leads. A large faint icon, a title, a line of help and the actions, centred, coming in as one
 * wave when it first appears (`stagger-children`). The icon can be any component, or anything in
 * the `icon` slot, as a FileIcon.
 */
const props = defineProps<{
  title: string
  description?: string
  icon?: Component
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('mx-auto flex max-w-sm flex-col items-center px-6 py-10 text-center stagger-children', props.class)">
    <div v-if="icon || $slots.icon" aria-hidden="true" class="mb-4 text-fg-faint [&>svg]:size-10">
      <slot name="icon"><component :is="icon" :stroke-width="1.5" /></slot>
    </div>
    <p class="text-label text-fg">{{ title }}</p>
    <p v-if="description || $slots.default" class="mt-1 text-ui text-fg-muted">
      <slot>{{ description }}</slot>
    </p>
    <div v-if="$slots.actions" class="mt-5 flex flex-wrap justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
