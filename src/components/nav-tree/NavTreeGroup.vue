<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, ref, watch, type Component, type HTMLAttributes } from 'vue'
import { useHasChanged } from '../../composables/useHasChanged'
import { cn } from '../../utils/cn'
import { useLink, type LinkTo } from '../../utils/link'
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

/**
 * A heading that folds its items (and nested groups) open, like a Collapsible. Given a `value` and
 * a link (`to`, `href`), the heading is also a page of its own, as a section's index in a
 * documentation site: its label goes there, and its chevron alone folds it.
 */
const props = defineProps<{
  label: string
  /** Shown before the label, and alone when a Sidebar folds to its rail. */
  icon?: Component
  defaultOpen?: boolean
  /** Identifies the group's own page; it is active while it equals the NavTree's `v-model`. */
  value?: string
  href?: string
  /** Renders the app's RouterLink to the group's own page. */
  to?: LinkTo
  /** The link component to render, such as NuxtLink, given `to` or `href`. */
  as?: string | Component
  /** Names the chevron when the label is a link: it says what folding does. */
  toggleLabel?: string
  class?: HTMLAttributes['class']
}>()

const open = defineModel<boolean>('open', { default: false })
if (props.defaultOpen) open.value = true

// In a sidebar folded to its rail a group shows only its icon, with its items tucked away; opening
// it unfolds the sidebar first, so its items have room to show.
const { sidebar, railed, placement } = useNavTreePlacement()
const tree = useNavTreeContext()
const index = tree.nextIndex()
const link = useLink(props)

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

// A group open from the start just shows; only opening and closing it afterwards animates. That
// includes a group opened while the tree first renders, by the active item inside it revealing
// itself: that happens after the group has set up, so until the first frame is out its content
// takes no animation at all.
const changed = useHasChanged(shownOpen)
const settled = ref(false)
let frame = 0
onMounted(() => (frame = requestAnimationFrame(() => (settled.value = true))))
onBeforeUnmount(() => cancelAnimationFrame(frame))

// While its items are tucked away in the rail, the group stands in for the active one among them.
const heldActive = ref(0)
const holdsActive = computed(() => heldActive.value > 0)

const parent = useNavTreeGroupContext()

// The group's own page: while it is the active one, it opens to show what it holds, and the groups
// around it open to show it and count it, as they do for an item.
const active = computed(() => props.value !== undefined && tree.active.value === props.value)
watch(
  active,
  (isActive) => {
    if (!isActive) return
    open.value = true
    parent?.reveal()
  },
  { immediate: true },
)
watch(
  active,
  (isActive, wasActive) => {
    if (isActive !== !!wasActive) parent?.holdActive(isActive)
  },
  { immediate: true },
)
onBeforeUnmount(() => active.value && parent?.holdActive(false))

// Going to the group's page opens it too, to show what is inside.
function go() {
  if (props.value !== undefined) tree.select(props.value)
  shownOpen.value = true
}

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
        <!-- A page of its own: the label is a link, and only the chevron folds the group. -->
        <div
          v-if="link"
          :data-nav-tree-active="(active && !parent?.railedAway.value) || (railed && holdsActive && !parent) || undefined"
          :class="cn(navTreeRowClass, 'cursor-default p-0 font-medium text-fg hover:text-fg', props.class)"
        >
          <component
            :is="link.is"
            v-bind="link.attrs"
            :aria-current="active ? 'page' : undefined"
            class="flex min-w-0 flex-1 items-center rounded-[inherit] py-1.5 pl-2.5 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            @click="go"
          >
            <component :is="icon" v-if="icon" aria-hidden="true" :class="navTreeIconClass" />
            <span :class="navTreeLabelVariants({ placement, edge: true })">
              <SidebarTypewriter v-if="sidebar" :text="label" :shown="!railed" :index="index" />
              <template v-else>{{ label }}</template>
            </span>
          </component>
          <CollapsibleTrigger
            :chevron="false"
            :aria-label="toggleLabel ?? label"
            :class="['w-auto shrink-0 rounded-[inherit] py-1.5 pr-2.5 pl-2 transition-opacity duration-150', railed && 'pointer-events-none opacity-0']"
          >
            <DisclosureChevron />
          </CollapsibleTrigger>
        </div>
        <!-- The chevron sits inside the label, so it folds away with it into the rail. -->
        <CollapsibleTrigger
          v-else
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
      <CollapsibleContent data-nav-tree-content :class="byRail ? navTreeRailContentClass : settled ? disclosureContentClass : 'overflow-hidden'">
        <ul role="list" :class="navTreeChildrenVariants({ wave: changed && !byRail })">
          <slot />
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </li>
</template>
