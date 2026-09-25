<script setup lang="ts">
import { useTemplateRef, watchEffect, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import { useSelect } from './select.context'
import { selectTriggerClass } from './select.variants'

/** The field: what is chosen, and the chevron. Opens the list on a click, Enter, Space or the arrows. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const select = useSelect()
// In a Field: its id, what describes it, and whether it is invalid.
const fieldAttrs = useFieldControl(() => undefined)

const button = useTemplateRef<HTMLButtonElement>('button')
watchEffect(() => (select.trigger.value = button.value ?? undefined))

function onKeydown(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key) && !select.open.value) {
    event.preventDefault()
    select.open.value = true
  }
}
</script>

<template>
  <button
    ref="button"
    type="button"
    role="combobox"
    aria-haspopup="listbox"
    :aria-expanded="select.open.value"
    :aria-controls="select.contentId"
    :disabled="select.disabled.value"
    :data-state="select.open.value ? 'open' : 'closed'"
    v-bind="fieldAttrs"
    :class="cn(selectTriggerClass, props.class)"
    @click="select.open.value = !select.open.value"
    @keydown="onKeydown"
  >
    <slot />
    <DisclosureChevron />
  </button>
</template>
