<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { fieldBareClass, fieldClass } from './input.variants'

/**
 * A multi-line field that grows with its text, from a few lines up to a limit, and scrolls past
 * it. Attributes go to the textarea itself.
 */
const props = defineProps<{
  /** Marks the value as needing a fix (`aria-invalid`). */
  invalid?: boolean
  /**
   * No line and no side padding, just the text: for a field inside a surface that already
   * frames it, such as a popover or a card.
   */
  bare?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string>()
const fieldAttrs = useFieldControl(() => props.invalid)
</script>

<template>
  <textarea
    v-model="value"
    v-bind="fieldAttrs"
    :class="
      cn(
        bare ? fieldBareClass : fieldClass,
        'block min-h-20 max-h-60 resize-none py-2 leading-relaxed field-sizing-content',
        !bare && 'px-3',
        'overflow-y-auto overscroll-contain scrollbar-subtle',
        props.class,
      )
    "
  />
</template>
