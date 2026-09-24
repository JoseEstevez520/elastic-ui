<script setup lang="ts">
import { CollapsibleContent, injectCollapsibleRootContext } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { useHasChanged } from '../../composables/useHasChanged'
import { cn } from '../../utils/cn'
import { disclosureContentClass, disclosureInnerClass } from './collapsible.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
// Content open from the start just shows; only opening and closing it afterwards animates.
const collapsible = injectCollapsibleRootContext()
const changed = useHasChanged(() => collapsible.open.value)
</script>

<template>
  <CollapsibleContent :class="disclosureContentClass">
    <div :class="cn(changed && disclosureInnerClass, 'pb-3 text-fg-secondary', props.class)">
      <slot />
    </div>
  </CollapsibleContent>
</template>
