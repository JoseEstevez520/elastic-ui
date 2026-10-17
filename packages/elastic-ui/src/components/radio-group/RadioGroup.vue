<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useFieldGroup } from '../../utils/field'

/**
 * One choice among a few, all in view: RadioGroupItems in a column, or in a row with `row`. For
 * more than about six choices, or when room is short, a Select. Arrow keys move and choose, as
 * radio buttons do. In a Field, the Field's label names it.
 */
const props = defineProps<{
  /** Its name for screen readers, when it is not in a Field. */
  label?: string
  row?: boolean
  disabled?: boolean
  name?: string
  required?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string>()
const fieldAttrs = useFieldGroup()
</script>

<template>
  <RadioGroupRoot
    v-model="value"
    v-bind="fieldAttrs"
    :aria-label="label"
    :disabled="disabled"
    :name="name"
    :required="required"
    :orientation="row ? 'horizontal' : 'vertical'"
    :class="cn('flex', row ? 'flex-wrap gap-x-6 gap-y-2' : 'flex-col gap-2.5', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
