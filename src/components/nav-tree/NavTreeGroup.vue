<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui'
import { computed, ref, watch, type Component, type HTMLAttributes } from 'vue'
import { useHasChanged } from '../../composables/useHasChanged'
import { cn } from '../../utils/cn'
import { Passthrough } from '../../utils/Passthrough'
import Collapsible from '../collapsible/Collapsible.vue'
import CollapsibleTrigger from '../collapsible/CollapsibleTrigger.vue'
import DisclosureChevron from '../collapsible/DisclosureChevron.vue'
import { disclosureContentClass } from '../collapsible/collapsible.variants'
import SidebarTypewriter from '../sidebar/SidebarTypewriter.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import {
  provideNavTreeGroupContext,
  useNavTreeContext,
  useNavTreeGroupContext,
  useNavTreePlacement,
} from './nav-tree.context'
import {
  navTreeChildrenVariants,
  navTreeIconClass,
  navTreeLabelVariants,
  navTreeRailContentClass,
  navTreeRowClass,
} from './nav-tree.variants'

/** A heading that folds its items (and nested groups) open, like a Collapsible. */
const props = defineProps<{
  label: string
  /** Shown before the label, and alone when a Sidebar folds to its rail. */
  icon?: Component
  defaultOpen?: boolean
  class?: HTMLAttributes['class']
}>()

const open = defineModel<boolean>('open', { default: false })
if (props.defaultOpen) open.value = true

// In a sidebar folded to its rail a group shows only its icon, with its items tucked away; opening
// it unfolds the sidebar first, so its items have room to show.
const { sidebar, railed, placement } = useNavTreePlacement()
const index = useNavTreeContext().nextIndex()

// Whether the group last opened or closed because the sidebar folded, not from its header.
const byRail = ref(false)
watch(railed, () => (byRail.value = true))

const shownOpen = computed({
  get: () => open.value && !railed.value,
  set: (value) => {
    byRail.value = false
    if (railed.value) {
      sidebar?.expand()
      open.value = true
    } else open.value = value
  },
})

// A group open from the start just shows; only opening and closing it afterwards animates.
const changed = useHasChanged(shownOpen)

// While its items are tucked away in the rail, the group stands in for the active one among them.
const heldActive = ref(0)
const holdsActive = computed(() => heldActive.value > 0)

const parent = useNavTreeGroupContext()
provideNavTreeGroupContext({
  reveal: () => {
    open.value = true
    parent?.reveal()
  },
  holdActive: (isActive) => {
    heldActive.value += isActive ? 1 : -1
    parent?.holdActive(isActive)
  },
  railedAway: computed(() => railed.value || !!parent?.railedAway.value),
})
</script>

<template>
  <li>
    <Collapsible v-model:open="shownOpen">
      <component :is="sidebar ? Tooltip : Passthrough" side="right" :content="label" :disabled="!railed">
        <!-- The chevron sits inside the label, so it folds away with it into the rail. -->
        <CollapsibleTrigger
          :chevron="false"
          :data-nav-tree-active="(railed && holdsActive && !parent) || undefined"
          :class="cn(navTreeRowClass, 'justify-start gap-0 font-medium text-fg', props.class)"
        >
          <component :is="icon" v-if="icon" aria-hidden="true" :class="navTreeIconClass" />
          <!-- The fade goes on the text, not the whole label, so the chevron stays whole. The text
               fills the room up to the chevron, so only a label that does not fit reaches it. -->
          <span :class="cn(navTreeLabelVariants({ placement, edge: false }), 'flex items-center justify-between gap-4')">
            <span :class="cn('min-w-0 flex-1', sidebar && 'overflow-hidden mask-fade-r')">
              <SidebarTypewriter v-if="sidebar" :text="label" :shown="!railed" :index="index" />
              <template v-else>{{ label }}</template>
            </span>
            <!-- Goes as the erasing starts, and comes back as the label is written in. -->
            <span :class="['flex transition-opacity duration-150', railed && 'opacity-0']">
              <DisclosureChevron />
            </span>
          </span>
        </CollapsibleTrigger>
      </component>
      <CollapsibleContent :class="byRail ? navTreeRailContentClass : disclosureContentClass">
        <ul role="list" :class="navTreeChildrenVariants({ wave: changed && !byRail })">
          <slot />
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </li>
</template>
