<script setup lang="ts">
import { CollapsibleContent } from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, ref, useId, watch, type Component, type HTMLAttributes } from 'vue'
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
 * documentation site: its label goes there, and its chevron alone folds it. In a `selectable`
 * tree a `value` alone makes it an option: its label picks it, and its chevron folds it.
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
// In a tree to pick from the group's own row is an option, never a link.
const anyLink = useLink(props)
const link = computed(() => (tree.selectable.value ? undefined : anyLink.value))
const choosable = computed(() => !!link.value || (tree.selectable.value && props.value !== undefined))
const rowId = useId()
const childrenId = useId()

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
const level = (parent?.level ?? 0) + 1

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

// In a selectable tree, as in any tree: right unfolds, then goes to the first row inside; left
// folds, then goes up to the group around it.
function onKeydown(event: KeyboardEvent) {
  if (!tree.selectable.value || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return
  event.preventDefault()
  if (event.key === 'ArrowRight') {
    if (!shownOpen.value) shownOpen.value = true
    else document.getElementById(childrenId)?.querySelector<HTMLElement>('[role="treeitem"]')?.focus()
  } else if (shownOpen.value) shownOpen.value = false
  else parent?.focusHeader()
}

// The row's part in a selectable tree: an option that holds a group of others.
const treeitem = computed(() =>
  tree.selectable.value
    ? {
        id: rowId,
        role: 'treeitem',
        'aria-expanded': shownOpen.value,
        'aria-owns': childrenId,
        'aria-level': level,
        tabindex: tree.tabIndex(rowId, active.value, index),
      }
    : {},
)

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
  level,
  focusHeader: () => document.getElementById(rowId)?.focus(),
})
</script>

<template>
  <li :role="tree.selectable.value ? 'none' : undefined">
    <Collapsible v-model:open="shownOpen">
      <component :is="sidebar ? Tooltip : Passthrough" side="right" :content="label" :disabled="!railed">
        <!-- A page of its own, or an option: the label goes there or picks it, and only the
             chevron folds the group. -->
        <div
          v-if="choosable"
          :data-nav-tree-active="(active && !parent?.railedAway.value) || (railed && holdsActive && !parent) || undefined"
          :class="cn(navTreeRowClass, 'cursor-default p-0 text-label text-fg hover:text-fg', props.class)"
        >
          <component
            :is="link?.is ?? 'button'"
            v-bind="{ ...link?.attrs, ...treeitem }"
            :type="link ? undefined : 'button'"
            :aria-current="active && link ? 'page' : undefined"
            :aria-selected="tree.selectable.value ? active : undefined"
            class="flex min-w-0 flex-1 cursor-pointer items-center rounded-[inherit] py-1.5 pl-2.5 text-left outline-none focus-ring-inset"
            @click="go"
            @keydown="onKeydown"
          >
            <component :is="icon" v-if="icon" aria-hidden="true" :class="navTreeIconClass" />
            <span :class="navTreeLabelVariants({ placement, edge: true })">
              <SidebarTypewriter v-if="sidebar" :text="label" :shown="!railed" :index="index" />
              <template v-else>{{ label }}</template>
            </span>
          </component>
          <!-- In a selectable tree the arrow keys fold it from the label, so the chevron is only
               for the pointer, and pressing it leaves the focus where it was. -->
          <CollapsibleTrigger
            :chevron="false"
            :aria-label="toggleLabel ?? label"
            :aria-hidden="tree.selectable.value || undefined"
            :tabindex="tree.selectable.value ? -1 : undefined"
            :class="['w-auto shrink-0 rounded-[inherit] py-1.5 pr-2.5 pl-2 transition-opacity duration-150', railed && 'pointer-events-none opacity-0']"
            @mousedown="tree.selectable.value && $event.preventDefault()"
          >
            <DisclosureChevron />
          </CollapsibleTrigger>
        </div>
        <!-- The chevron sits inside the label, so it folds away with it into the rail. -->
        <CollapsibleTrigger
          v-else
          v-bind="treeitem"
          :chevron="false"
          @keydown="onKeydown"
          :data-nav-tree-active="(railed && holdsActive && !parent) || undefined"
          :class="cn(navTreeRowClass, 'justify-start gap-0 text-label text-fg', props.class)"
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
        <ul
          :id="childrenId"
          :role="tree.selectable.value ? 'group' : 'list'"
          :class="navTreeChildrenVariants({ wave: changed && !byRail })"
        >
          <slot />
        </ul>
      </CollapsibleContent>
    </Collapsible>
  </li>
</template>
