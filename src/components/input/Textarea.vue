<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { fieldClass } from './input.variants'

/**
 * A multi-line field that grows with its text, from a few lines up to a limit, and scrolls past
 * it. Attributes go to the textarea itself.
 */
const props = defineProps<{
  /** Marks the value as needing a fix (`aria-invalid`). */
  invalid?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string>()
</script>

<template>
  <textarea
    v-model="value"
    :aria-invalid="invalid || undefined"
    :class="
      cn(
        fieldClass,
        'block min-h-20 max-h-60 resize-none px-3 py-2 leading-relaxed field-sizing-content',
        'overflow-y-auto overscroll-contain scrollbar-subtle',
        props.class,
      )
    "
  />
</template>
