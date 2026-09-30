<script setup lang="ts">
import { CollapsibleTrigger, injectCollapsibleRootContext } from 'reka-ui'
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import DisclosureChevron from './DisclosureChevron.vue'
import { disclosureTriggerClass } from './collapsible.variants'

const props = withDefaults(
  defineProps<{
    /** Shows a chevron that turns while open. */
    chevron?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { chevron: true },
)

// Reka assigns the content's id when the content mounts, after this trigger has rendered, and
// the trigger keeps an empty `aria-controls` until something re-renders it. Assigning the id
// here first links them from the start; the content keeps an id that is already set.
const collapsible = injectCollapsibleRootContext()
collapsible.contentId ||= useId()
</script>

<template>
  <CollapsibleTrigger :class="cn(disclosureTriggerClass, props.class)">
    <slot />
    <DisclosureChevron v-if="chevron" />
  </CollapsibleTrigger>
</template>
