<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { disclosureContentClass, disclosureInnerClass } from './collapsible.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <CollapsibleContent :class="cn('group/disclosure', disclosureContentClass)">
    <div :class="cn(disclosureInnerClass, 'pb-3 text-fg-secondary', props.class)">
      <slot />
    </div>
  </CollapsibleContent>
</template>
