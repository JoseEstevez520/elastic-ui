<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { fieldBareClass, inputIconVariants, inputVariants, type InputVariants } from './input.variants'

/**
 * A single-line field. Attributes (`type`, `placeholder`, `name`…) go to the input itself; `class`
 * goes to the wrapper, so it can size the field in a layout. `bare` drops the tray: only the text,
 * for a field that is part of what it edits (a title written in place), sized by its `class`.
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  size?: InputVariants['size']
  /** Shown inside, on the left. */
  icon?: Component
  /** Marks the value as needing a fix (`aria-invalid`). */
  invalid?: boolean
  /** No tray and no padding: the text alone, in the type its wrapper gives it. */
  bare?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string | number>()
// In a Field: its id, what describes it, and whether it is invalid.
const fieldAttrs = useFieldControl(() => props.invalid)
</script>

<template>
  <div :class="cn('relative w-full', props.class)">
    <!-- After the input, so the icon can follow its focus (`peer-focus`). -->
    <input
      v-model="value"
      v-bind="{ ...fieldAttrs, ...$attrs }"
      :class="bare ? cn(fieldBareClass, 'font-[inherit] text-[length:inherit] leading-[inherit]') : inputVariants({ size, withIcon: !!icon })"
    />
    <component :is="icon" v-if="icon && !bare" aria-hidden="true" :class="inputIconVariants({ size })" />
  </div>
</template>
