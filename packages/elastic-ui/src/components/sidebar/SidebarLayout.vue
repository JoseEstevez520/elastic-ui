<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TooltipGroup from '../tooltip/TooltipGroup.vue'
import { provideSidebarContext } from './sidebar.context'

/**
 * Holds a Sidebar and the page beside it, and the state they share, so a SidebarToggle works
 * from anywhere inside: the sidebar itself or the page's own header.
 *
 * `bare` leaves the page alone, for a moment that wants all of the screen (writing, reading): the
 * sidebar folds away to the edge and the header up out of the way, and come back as they went.
 * Both stay mounted, so nothing in the page is drawn again.
 */
const props = withDefaults(
  defineProps<{
    /** Below this width the sidebar becomes a panel that slides in from the edge. */
    mobileBelow?: number
    /** The page alone: the sidebar and the page's header fold away. */
    bare?: boolean
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
const bare = computed(() => !!props.bare)
watch(bare, (isBare) => {
  if (isBare) mobileOpen.value = false
})

provideSidebarContext({
  // On a phone the panel always shows the labels.
  collapsed: computed(() => !mobile.value && collapsed.value),
  mobile,
  mobileOpen,
  isOpen: computed(() => (mobile.value ? mobileOpen.value : !collapsed.value)),
  panelId: useId(),
  bare,
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
