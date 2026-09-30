<script setup lang="ts">
import { computed, useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideField } from '../../utils/field'
import { labelFor } from '../../utils/labels'

/**
 * A form control with its label, its help and, when it needs fixing, what is wrong: one column,
 * the label above, the help or the error below. The control inside (Input, Textarea, Select,
 * Combobox, DatePicker…) is linked to them on its own: the label points at it, the help and the
 * error describe it, and the error marks it invalid. The error comes into focus where the help was.
 */
const props = withDefaults(
  defineProps<{
    label: string
    /** A line of help under the control. */
    description?: string
    /** What is wrong with the value; the control is marked invalid while there is one. */
    error?: string
    /** Says the field may be left empty, beside the label. */
    optional?: boolean
    optionalLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { optionalLabel: labelFor('optional') },
)

const id = useId()
const labelId = `${id}-label`
const helpId = `${id}-help`
const errorId = `${id}-error`
provideField({
  id,
  labelId,
  describedBy: computed(() => (props.error ? errorId : props.description ? helpId : undefined)),
  invalid: computed(() => !!props.error),
})
</script>

<template>
  <div :class="cn('flex flex-col gap-1.5', props.class)">
    <label :id="labelId" :for="id" class="text-label text-fg">
      {{ label }}<span v-if="optional" class="font-normal text-fg-muted"> · {{ optionalLabel }}</span>
    </label>
    <slot />
    <!-- The help, or in its place the error, coming into focus where the help was. -->
    <Transition mode="out-in" enter-active-class="animate-blur-in motion-reduce:animate-none">
      <p v-if="error" :id="errorId" key="error" class="text-meta text-[color:var(--color-danger)]">{{ error }}</p>
      <p v-else-if="description" :id="helpId" key="help" class="text-meta text-fg-muted">{{ description }}</p>
    </Transition>
  </div>
</template>
