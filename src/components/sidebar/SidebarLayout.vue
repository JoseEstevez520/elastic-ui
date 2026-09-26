<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TooltipGroup from '../tooltip/TooltipGroup.vue'
import { provideSidebarContext } from './sidebar.context'

/**
 * Holds a Sidebar and the page beside it, and the state they share, so a SidebarToggle works
 * from anywhere inside: the sidebar itself or the page's own header.
 */
const props = withDefaults(
  defineProps<{
    /** Below this width the sidebar becomes a panel that slides in from the edge. */
    mobileBelow?: number
    class?: HTMLAttributes['class']
  }>(),
  { mobileBelow: 768 },
)

const collapsed = defineModel<boolean>('collapsed', { default: false })
const mobileOpen = ref(false)

// Server rendering and the first paint assume a wide screen; a phone is known once mounted.
const mobile = ref(false)
let query: MediaQueryList | undefined
const onQuery = () => (mobile.value = !!query?.matches)
onMounted(() => {
  query = window.matchMedia(`(max-width: ${props.mobileBelow - 0.02}px)`)
  onQuery()
  query.addEventListener('change', onQuery)
})
onBeforeUnmount(() => query?.removeEventListener('change', onQuery))
watch(mobile, () => (mobileOpen.value = false))

provideSidebarContext({
  // On a phone the panel always shows the labels.
  collapsed: computed(() => !mobile.value && collapsed.value),
  mobile,
  mobileOpen,
  isOpen: computed(() => (mobile.value ? mobileOpen.value : !collapsed.value)),
  panelId: useId(),
  expand: () => (collapsed.value = false),
  toggle: () => (mobile.value ? (mobileOpen.value = !mobileOpen.value) : (collapsed.value = !collapsed.value)),
})
</script>

<template>
  <TooltipGroup>
    <div :class="cn('flex min-h-dvh', props.class)">
      <slot />
    </div>
  </TooltipGroup>
</template>
