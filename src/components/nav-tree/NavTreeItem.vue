<script setup lang="ts">
import { computed, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useNavTreeContext, useNavTreeGroupContext } from './nav-tree.context'
import { navTreeRowClass } from './nav-tree.variants'

const props = defineProps<{
  /** Identifies the item; it is active while it equals the NavTree's `v-model`. */
  value: string
  /** Renders a link; without it the item is a button. */
  href?: string
  class?: HTMLAttributes['class']
}>()

const tree = useNavTreeContext()
const group = useNavTreeGroupContext()

const active = computed(() => tree.active.value === props.value)

// The active item is never left hidden inside a folded group.
watch(active, (isActive) => isActive && group?.reveal(), { immediate: true })
</script>

<template>
  <li>
    <component
      :is="href ? 'a' : 'button'"
      :href="href"
      :type="href ? undefined : 'button'"
      :aria-current="active ? (href ? 'page' : 'true') : undefined"
      :data-nav-tree-active="active || undefined"
      :class="cn(navTreeRowClass, active && 'text-fg', props.class)"
      @click="tree.select(value)"
    >
      <slot />
    </component>
  </li>
</template>
