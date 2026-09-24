<script setup lang="ts">
import { AccordionContent } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { disclosureContentClass, disclosureInnerClass } from '../collapsible/collapsible.variants'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <AccordionContent :class="cn('group/disclosure', disclosureContentClass)">
    <div :class="cn(disclosureInnerClass, 'pb-4 text-fg-secondary', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
