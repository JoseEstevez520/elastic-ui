<script setup lang="ts">
import { computed, reactive, ref, toRef, useId, useTemplateRef, type HTMLAttributes } from 'vue'
import FieldMorph from '../field-morph/FieldMorph.vue'
import { provideSelect } from './select.context'

/**
 * Picks one option (or several, with `multiple`) from a list the field grows into: its outline
 * stretches down to hold the options and folds back into the field once one is picked, as
 * PopoverMorph's button becomes its panel. Arrow keys move, typing jumps to an option, Enter picks,
 * Escape closes. In a Field, the trigger is linked to the label, the help and the error.
 */
const props = defineProps<{
  defaultValue?: string | string[]
  multiple?: boolean
  disabled?: boolean
  /** For a form: sent under this name. */
  name?: string
  required?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string | string[] | undefined>({
  default: undefined,
})
if (value.value === undefined && props.defaultValue !== undefined) value.value = props.defaultValue
const open = defineModel<boolean>('open', { default: false })

const morph = useTemplateRef<InstanceType<typeof FieldMorph>>('morph')
provideSelect({
  open,
  value,
  multiple: toRef(() => !!props.multiple),
  disabled: toRef(() => !!props.disabled),
  texts: reactive(new Map<string, string>()),
  panel: computed(() => morph.value?.panel ?? undefined),
  trigger: ref<HTMLElement>(),
  contentId: useId(),
})
const formValue = computed(() => (Array.isArray(value.value) ? value.value.join(',') : (value.value ?? '')))
</script>

<template>
  <FieldMorph ref="morph" v-model:open="open" :class="props.class">
    <slot />
    <input v-if="name" type="hidden" :name="name" :value="formValue" :required="required" />
  </FieldMorph>
</template>
