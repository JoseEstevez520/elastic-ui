<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { descriptionItemClass } from './description-list.variants'

/** One row of a DescriptionList: a term (`term`, or the richer `#term` slot) and its value. */
const props = defineProps<{
  term?: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn(descriptionItemClass, props.class)">
    <dt class="text-ui text-fg-muted">
      <slot name="term">{{ term }}</slot>
    </dt>
    <dd class="min-w-0 text-ui text-fg">
      <slot />
    </dd>
  </div>
</template>
