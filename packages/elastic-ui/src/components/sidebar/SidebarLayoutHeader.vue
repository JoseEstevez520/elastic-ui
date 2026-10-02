<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useRequiredSidebarContext } from './sidebar.context'
import SidebarToggle from './SidebarToggle.vue'

/**
 * The page's own bar, beside the Sidebar: held at the top as the page scrolls, on the page's
 * background so nothing shows through, with a hairline under it only once the page has moved. On
 * a phone, where the sidebar is a panel off screen, it carries the toggle that opens it. Its height
 * is published as `--page-header-height`, which TableOfContents and Prose's headings read, so
 * nothing is left under it.
 *
 * Put it first in the page's column, with what goes on its left (breadcrumbs) in the default slot
 * and what goes on its right (search, theme) in `end`. When the layout goes bare it folds up out
 * of the way, its content first and then its room, and comes back the way it went.
 */
const props = defineProps<{
  /** What scrolls, when it is not the page: an element, or a selector for it. */
  scroller?: HTMLElement | string
  /** Names the toggle it carries on a phone. */
  toggleLabel?: string
  /** No hairline under it even once the page has moved: the bar and the page one surface. */
  seamless?: boolean
  class?: HTMLAttributes['class']
}>()

defineSlots<{
  default?(): unknown
  end?(): unknown
}>()

const sidebar = useRequiredSidebarContext('SidebarLayoutHeader')
const header = useTemplateRef<HTMLElement>('header')
const scrolled = ref(false)

let target: HTMLElement | Window = window
const read = () => (scrolled.value = (target instanceof Window ? target.scrollY : target.scrollTop) > 1)

// Its height, where the page can read it: on the root, or on what scrolls.
let host: HTMLElement | undefined
let observer: ResizeObserver | undefined
onMounted(() => {
  const el = typeof props.scroller === 'string' ? document.querySelector<HTMLElement>(props.scroller) : props.scroller
  target = el ?? window
  host = el ?? document.documentElement
  target.addEventListener('scroll', read, { passive: true })
  read()
  observer = new ResizeObserver(() => host?.style.setProperty('--page-header-height', `${header.value?.offsetHeight ?? 0}px`))
  if (header.value) observer.observe(header.value)
})
onBeforeUnmount(() => {
  target.removeEventListener('scroll', read)
  observer?.disconnect()
  host?.style.removeProperty('--page-header-height')
})
</script>

<template>
  <header
    ref="header"
    :inert="sidebar.bare.value"
    :class="
      cn(
        'sticky top-0 z-30 flex items-center gap-3 overflow-hidden px-4',
        'bg-[color:var(--page-header-bg,var(--color-bg))] motion-reduce:transition-none',
        sidebar.bare.value
          ? 'h-0 opacity-0 transition-[height,opacity,box-shadow] duration-[300ms,100ms,300ms] [transition-delay:100ms,0ms,0ms]'
          : 'h-14 opacity-100 transition-[height,opacity,box-shadow] duration-[450ms,200ms,300ms] [transition-delay:0ms,200ms,0ms]',
        // A hairline, not a shadow, and only once the page has moved under it.
        scrolled && !seamless ? 'shadow-[0_1px_0_var(--color-border)]' : 'shadow-[0_1px_0_transparent]',
        props.class,
      )
    "
  >
    <SidebarToggle v-if="sidebar.mobile.value" :label="toggleLabel" class="-ml-1" />
    <div class="flex min-w-0 flex-1 items-center gap-3"><slot /></div>
    <div v-if="$slots.end" class="flex shrink-0 items-center gap-2"><slot name="end" /></div>
  </header>
</template>
