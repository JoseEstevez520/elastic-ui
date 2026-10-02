<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { provideSidebarVariant, useRequiredSidebarContext, type SidebarVariant } from './sidebar.context'
import SidebarToggle from './SidebarToggle.vue'
import {
  sidebarBackdropClass,
  sidebarHeaderClass,
  sidebarHeaderFolded,
  sidebarHeaderShown,
  sidebarVariants,
} from './sidebar.variants'

/**
 * A side column that folds to a rail of icons, whose labels are erased and come back as tooltips.
 * On a phone it is a panel that slides in from the edge instead. Put a NavTree inside, with an
 * `icon` on each item and group.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** How it sits against the page (see `SidebarVariant`). */
    variant?: SidebarVariant
    label?: string
    /** Names the fold button the sidebar carries. */
    toggleLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'plain', label: labelFor('sidebar'), toggleLabel: labelFor('toggleSidebar') },
)

const sidebar = useRequiredSidebarContext('Sidebar')
// Read once: the NavTree inside draws its indicator to match, and a variant is a layout choice,
// not a state that changes.
provideSidebarVariant(props.variant)
const { mobile, mobileOpen, collapsed, isOpen, bare } = sidebar

// What changed last: folding to the rail, or going bare. Each moves on its own timing.
const change = ref<'fold' | 'bare'>('fold')
watch(collapsed, () => (change.value = 'fold'))
watch(bare, () => (change.value = 'bare'))

// The panel on a phone closes with Escape and a tap outside, and takes focus while open.
const aside = useTemplateRef<HTMLElement>('aside')
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (event.key === 'Escape' && mobileOpen.value) mobileOpen.value = false
})
watch(mobileOpen, async (isMobileOpen) => {
  await nextTick()
  if (isMobileOpen) aside.value?.querySelector<HTMLElement>('a[href], button')?.focus({ preventScroll: true })
})

const style = computed(() => {
  if (mobile.value) return { transform: mobileOpen.value ? 'translateX(0)' : 'translateX(-100%)' }
  if (bare.value) return { width: '0px' }
  return { width: collapsed.value ? 'var(--sidebar-rail, 3.25rem)' : 'var(--sidebar-width, 16rem)' }
})
// As in SkillNet, with its curve (`--ease-glide`). Folding, the labels are erased first and the sidebar narrows
// 180ms later, along with the labels' room, so it never cuts a word. Unfolding, it widens at once
// and the labels are written into the room it makes. On a phone the panel slides, faster out
// than in. Going bare, its content fades at once and then its room closes; coming back, the room
// opens and the content comes in halfway along, slower in than out.
const timing = computed(() => {
  if (mobile.value) return isOpen.value ? 'duration-[350ms]' : 'duration-[250ms]'
  if (change.value === 'bare') return bare.value ? 'duration-300 delay-100' : 'duration-[450ms]'
  return isOpen.value ? 'duration-[320ms]' : 'duration-[320ms] delay-[180ms]'
})
const contentClass = computed(() =>
  bare.value && !mobile.value
    ? 'opacity-0 transition-opacity duration-100 motion-reduce:transition-none'
    : 'opacity-100 transition-opacity duration-200 delay-200 motion-reduce:transition-none',
)
</script>

<template>
  <div
    v-if="mobile"
    aria-hidden="true"
    :class="cn(sidebarBackdropClass, mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0')"
    @click="mobileOpen = false"
  />
  <!-- Two roots (the backdrop and the sidebar), so attributes go to the sidebar. -->
  <aside
    v-bind="$attrs"
    :id="sidebar.panelId"
    ref="aside"
    :aria-label="label"
    :inert="(mobile && !mobileOpen) || bare"
    :data-collapsed="collapsed || undefined"
    :data-bare="bare || undefined"
    :style="style"
    :class="cn(sidebarVariants({ variant, mobile }), timing, props.class)"
  >
    <div :class="cn('flex h-full flex-col', contentClass)">
      <!-- The header folds like the labels: its own content folds away to the left and leaves the
           toggle alone, centred in the rail. On a phone the toggle lives in the page instead. -->
      <div class="flex shrink-0 items-center p-2">
        <div :class="cn(sidebarHeaderClass, collapsed ? sidebarHeaderFolded : sidebarHeaderShown)">
          <slot name="header" />
        </div>
        <SidebarToggle v-if="!mobile" :label="toggleLabel" :class="collapsed ? 'mx-auto' : 'ml-auto'" />
      </div>
      <div class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-2 scrollbar-subtle">
        <slot />
      </div>
      <div v-if="$slots.footer" class="shrink-0 p-2"><slot name="footer" /></div>
    </div>
  </aside>
</template>
