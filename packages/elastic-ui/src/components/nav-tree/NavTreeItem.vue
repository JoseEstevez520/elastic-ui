<script setup lang="ts">
import { computed, onBeforeUnmount, useId, useSlots, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLink, type LinkTo } from '../../utils/link'
import { Passthrough } from '../../utils/Passthrough'
import { textOf } from '../../utils/textOf'
import SidebarTypewriter from '../sidebar/SidebarTypewriter.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import { useNavTreeContext, useNavTreeGroupContext, useNavTreePlacement } from './nav-tree.context'
import { navTreeIconClass, navTreeLabelVariants, navTreeRowClass } from './nav-tree.variants'

const props = defineProps<{
  /** Identifies the item; it is active while it equals the NavTree's `v-model`. */
  value: string
  /** Renders a link; without it (or `to`) the item is a button. Ignored in a `selectable` tree. */
  href?: string
  /** Renders the app's RouterLink to this location, so navigating never reloads the page. */
  to?: LinkTo
  /** The link component to render, such as NuxtLink, given `to` or `href`. */
  as?: string | Component
  /** Shown before the label, and alone when a Sidebar folds to its rail. */
  icon?: Component
  class?: HTMLAttributes['class']
}>()

const tree = useNavTreeContext()
const group = useNavTreeGroupContext()
const { sidebar, railed, placement } = useNavTreePlacement()
// A plain-text label in a sidebar is erased and written back letter by letter.
const slots = useSlots()
const text = computed(() => (sidebar ? textOf(slots.default) : undefined))
const index = tree.nextIndex()

// In a tree to pick from the item is an option, never a link.
const anyLink = useLink(props)
const link = computed(() => (tree.selectable.value ? undefined : anyLink.value))
const active = computed(() => tree.active.value === props.value)
const rowId = useId()
const level = (group?.level ?? 0) + 1

function onKeydown(event: KeyboardEvent) {
  if (!tree.selectable.value || event.key !== 'ArrowLeft' || !group) return
  event.preventDefault()
  group.focusHeader()
}

// The active item is never left hidden inside a folded group.
watch(active, (isActive) => isActive && group?.reveal(), { immediate: true })
// Groups count the active item inside them only on a change, so an item that was never active
// never takes a count away.
watch(
  active,
  (isActive, wasActive) => {
    if (isActive !== !!wasActive) group?.holdActive(isActive)
  },
  { immediate: true },
)
onBeforeUnmount(() => active.value && group?.holdActive(false))
</script>

<template>
  <li :role="tree.selectable.value ? 'none' : undefined">
    <!-- In a sidebar folded to its rail only the icon shows; the label comes back as a tooltip. -->
    <component :is="sidebar ? Tooltip : Passthrough" side="right" :disabled="!railed">
      <component
        :is="link?.is ?? 'button'"
        v-bind="link?.attrs"
        :id="rowId"
        :type="link ? undefined : 'button'"
        :role="tree.selectable.value ? 'treeitem' : undefined"
        :aria-selected="tree.selectable.value ? active : undefined"
        :aria-level="tree.selectable.value ? level : undefined"
        :tabindex="tree.tabIndex(rowId, active, index)"
        :aria-current="active && !tree.selectable.value ? (link ? 'page' : 'true') : undefined"
        :data-nav-tree-active="(active && !group?.railedAway.value) || undefined"
        :class="cn(navTreeRowClass, active && 'text-fg', props.class)"
        @click="tree.select(value)"
        @keydown="onKeydown"
      >
        <component :is="icon" v-if="icon" aria-hidden="true" :class="navTreeIconClass" />
        <span :class="navTreeLabelVariants({ placement, fade: !text })">
          <SidebarTypewriter v-if="text" :text="text" :shown="!railed" :index="index" />
          <slot v-else />
        </span>
      </component>
      <template #content><slot /></template>
    </component>
  </li>
</template>
