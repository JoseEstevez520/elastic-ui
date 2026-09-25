<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { CheckIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import { floatingPanelClass } from '../popover/popover.variants'
import { selectItemClass } from '../select/select.variants'
import { comboboxAnchorClass } from './combobox.variants'

export interface ComboboxOption {
  value: string
  label: string
  /** A quieter line under the label. */
  description?: string
  disabled?: boolean
}

/**
 * Picking one value by typing: a field that narrows its options to what is written, for lists too
 * long to scan in a Select (countries, students, modules). The options come from the field, as a
 * Select's do, in a wave; arrow keys move, Enter picks, Escape closes. In a Field, it is linked to
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
</script>

<template>
  <ComboboxRoot v-model="value" :disabled="disabled" :name="name" open-on-click :class="cn('relative w-full', props.class)">
    <ComboboxAnchor :class="comboboxAnchorClass">
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
    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        :side-offset="6"
        :collision-padding="16"
        :class="
          cn(
            floatingPanelClass,
            'shadow-overlay w-(--reka-combobox-trigger-width) max-h-[min(20rem,var(--reka-combobox-content-available-height))] overflow-hidden',
          )
        "
      >
        <!-- As a Select's options: a wave from the field outwards, none past the eighth. -->
        <ComboboxViewport class="stagger-items p-1 [--stagger-delay:0.05s]">
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
    </ComboboxPortal>
  </ComboboxRoot>
</template>
