<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import Collapsible from '../collapsible/Collapsible.vue'
import CollapsibleTrigger from '../collapsible/CollapsibleTrigger.vue'
import { disclosureContentClass } from '../collapsible/collapsible.variants'
import { provideNavTreeGroupContext, useNavTreeGroupContext } from './nav-tree.context'
import { navTreeChildrenClass, navTreeRowClass } from './nav-tree.variants'

/** A heading that folds its items (and nested groups) open, like a Collapsible. */
const props = defineProps<{
  label: string
  defaultOpen?: boolean
  class?: HTMLAttributes['class']
}>()

const open = defineModel<boolean>('open', { default: false })
if (props.defaultOpen) open.value = true

const parent = useNavTreeGroupContext()
provideNavTreeGroupContext({
  reveal: () => {
    open.value = true
    parent?.reveal()
  },
})
</script>

<template>
  <li>
    <Collapsible v-model:open="open">
      <CollapsibleTrigger :class="cn(navTreeRowClass, 'justify-between font-medium text-fg', props.class)">
        {{ label }}
      </CollapsibleTrigger>
      <CollapsibleContent :class="disclosureContentClass">
        <ul role="list" :class="navTreeChildrenClass">
          <slot />
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </li>
</template>
