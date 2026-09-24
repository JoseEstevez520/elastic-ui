<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { inputIconVariants, inputVariants, type InputVariants } from './input.variants'

/**
 * A single-line field. Attributes (`type`, `placeholder`, `name`…) go to the input itself; `class`
 * goes to the wrapper, so it can size the field in a layout.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  size?: InputVariants['size']
  /** Shown inside, on the left. */
  icon?: Component
  /** Marks the value as needing a fix (`aria-invalid`). */
  invalid?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string | number>()
</script>

<template>
  <div :class="cn('relative w-full', props.class)">
    <!-- After the input, so the icon can follow its focus (`peer-focus`). -->
    <input
      v-model="value"
      v-bind="$attrs"
      :aria-invalid="invalid || undefined"
      :class="inputVariants({ size, withIcon: !!icon })"
    />
    <component :is="icon" v-if="icon" aria-hidden="true" :class="inputIconVariants({ size })" />
  </div>
</template>
