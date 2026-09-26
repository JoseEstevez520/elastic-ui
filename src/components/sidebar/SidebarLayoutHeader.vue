<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useRequiredSidebarContext } from './sidebar.context'
import SidebarToggle from './SidebarToggle.vue'

/**
 * The page's own bar, beside the Sidebar: held at the top as the page scrolls, on the page's
 * background so nothing shows through. There is no line under it: once the page has moved, what
 * passes under it fades and blurs into it along a soft edge, as iOS's bars since Liquid Glass. Once
 * the page's PageTitle has gone under it, it shows that title, small, coming into focus. On
 * a phone, where the sidebar is a panel off screen, it carries the toggle that opens it. Its height
 * is published as `--page-header-height`, which TableOfContents and Prose's headings read, so
 * nothing is left under it.
 *
 * Put it first in the page's column, with what goes on its left (breadcrumbs) in the default slot
 * and what goes on its right (search, theme) in `end`.
 */
const props = defineProps<{
  /** What scrolls, when it is not the page: an element, or a selector for it. */
  scroller?: HTMLElement | string
  /** Names the toggle it carries on a phone. */
  toggleLabel?: string
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
  sidebar.header.value = header.value ?? undefined
  observer = new ResizeObserver(() => host?.style.setProperty('--page-header-height', `${header.value?.offsetHeight ?? 0}px`))
  if (header.value) observer.observe(header.value)
})
onBeforeUnmount(() => {
  target.removeEventListener('scroll', read)
  observer?.disconnect()
  sidebar.header.value = undefined
  host?.style.removeProperty('--page-header-height')
})
</script>

<template>
  <header
    ref="header"
    :class="
      cn(
        'sticky top-0 z-30 flex h-14 items-center gap-3 px-4',
        'bg-[color:var(--page-header-bg,var(--color-bg))]',
        props.class,
      )
    "
  >
    <!-- The soft edge: the page fading and blurring into the bar as it goes under, only once it has moved. -->
    <div
      aria-hidden="true"
      :class="[
        'page-header-edge pointer-events-none absolute inset-x-0 top-full h-8 transition-opacity duration-300',
        scrolled ? 'opacity-100' : 'opacity-0',
      ]"
    />
    <SidebarToggle v-if="sidebar.mobile.value" :label="toggleLabel" class="-ml-1" />
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <slot />
      <Transition
        enter-active-class="animate-blur-in motion-reduce:animate-none"
        leave-active-class="transition-opacity duration-150"
        leave-to-class="opacity-0"
      >
        <span v-if="!$slots.default && sidebar.pageTitle.value?.under" class="truncate text-sm font-medium text-fg">
          {{ sidebar.pageTitle.value.text }}
        </span>
      </Transition>
    </div>
    <div v-if="$slots.end" class="flex shrink-0 items-center gap-2"><slot name="end" /></div>
  </header>
</template>
