<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { computed, ref, type HTMLAttributes } from 'vue'
import { CheckIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import FieldMorph from '../field-morph/FieldMorph.vue'
import { selectItemClass } from '../select/select.variants'

export interface ComboboxOption {
  value: string
  label: string
  /** A quieter line under the label. */
  description?: string
  disabled?: boolean
}

/**
 * Picking one value by typing: a field that narrows its options to what is written, for lists too
 * long to scan in a Select (countries, students, modules). The field grows down into its options,
 * which come into focus as a wave; arrow keys move, Enter picks, Escape closes. In a Field, it is linked to
 * the label, the help and the error.
 */
const props = withDefaults(
  defineProps<{
    options: (ComboboxOption | string)[]
    placeholder?: string
    /** Said when nothing matches what is written. */
    emptyLabel?: string
    /** Marks the value as needing a fix; a Field around it does it on its own. */
    invalid?: boolean
    disabled?: boolean
    name?: string
    class?: HTMLAttributes['class']
  }>(),
  { emptyLabel: labelFor('noResults') },
)

defineSlots<{
  /** How an option shows in the list; its label by default. */
  option?(props: { option: ComboboxOption }): unknown
}>()

const value = defineModel<string>()
const list = computed<ComboboxOption[]>(() => props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)))
const labelOf = (v: unknown) => list.value.find((o) => o.value === v)?.label ?? ''
const fieldAttrs = useFieldControl(() => props.invalid)
const open = ref(false)
</script>

<template>
  <ComboboxRoot v-model="value" v-model:open="open" :disabled="disabled" :name="name" open-on-click :class="cn('w-full', props.class)">
    <!-- The field grows down into its options and folds back into itself. -->
    <FieldMorph v-model:open="open">
      <ComboboxAnchor class="flex w-full items-center">
        <ComboboxInput
          v-bind="fieldAttrs"
          :display-value="labelOf"
          :placeholder="placeholder"
          class="h-10 min-w-0 flex-1 bg-transparent pl-3 text-sm text-fg outline-none placeholder:text-fg-faint"
        />
        <ComboboxTrigger class="group/trigger flex h-10 cursor-pointer items-center px-3 text-fg-faint">
          <DisclosureChevron />
        </ComboboxTrigger>
      </ComboboxAnchor>
      <template #panel>
        <ComboboxContent position="inline" class="border-t border-[color:var(--color-border)] text-sm text-fg">
          <!-- A wave from the field downwards, none past the eighth. -->
          <ComboboxViewport class="stagger-items max-h-72 overflow-y-auto overscroll-contain p-1 scrollbar-subtle [--stagger-delay:0.05s]">
            <ComboboxEmpty class="px-3 py-6 text-center text-sm text-fg-muted">{{ emptyLabel }}</ComboboxEmpty>
            <ComboboxItem
              v-for="option in list"
              :key="option.value"
              :value="option.value"
              :text-value="option.label"
              :disabled="option.disabled"
              :class="selectItemClass"
            >
              <ComboboxItemIndicator class="absolute left-2.5 flex items-center">
                <CheckIcon aria-hidden="true" class="size-3.5" />
              </ComboboxItemIndicator>
              <slot name="option" :option="option">
                <span class="flex flex-col">
                  {{ option.label }}
                  <span v-if="option.description" class="text-xs text-fg-muted">{{ option.description }}</span>
                </span>
              </slot>
            </ComboboxItem>
          </ComboboxViewport>
        </ComboboxContent>
      </template>
    </FieldMorph>
  </ComboboxRoot>
</template>
