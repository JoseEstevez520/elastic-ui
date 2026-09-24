<script setup lang="ts">
import { computed, onBeforeUnmount, useSlots, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { Passthrough } from '../../utils/Passthrough'
import { textOf } from '../../utils/textOf'
import SidebarTypewriter from '../sidebar/SidebarTypewriter.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import { useNavTreeContext, useNavTreeGroupContext, useNavTreePlacement } from './nav-tree.context'
import { navTreeIconClass, navTreeLabelVariants, navTreeRowClass } from './nav-tree.variants'

const props = defineProps<{
  /** Identifies the item; it is active while it equals the NavTree's `v-model`. */
  value: string
  /** Renders a link; without it the item is a button. */
  href?: string
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

const active = computed(() => tree.active.value === props.value)

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
  <li>
    <!-- In a sidebar folded to its rail only the icon shows; the label comes back as a tooltip. -->
    <component :is="sidebar ? Tooltip : Passthrough" side="right" :disabled="!railed">
      <component
        :is="href ? 'a' : 'button'"
        :href="href"
        :type="href ? undefined : 'button'"
        :aria-current="active ? (href ? 'page' : 'true') : undefined"
        :data-nav-tree-active="(active && !group?.railedAway.value) || undefined"
        :class="cn(navTreeRowClass, active && 'text-fg', props.class)"
        @click="tree.select(value)"
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
