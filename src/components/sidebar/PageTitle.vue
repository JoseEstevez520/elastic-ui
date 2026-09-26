<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useRequiredSidebarContext } from './sidebar.context'

/**
 * The page's large title, as iOS's: as the page scrolls it goes up under SidebarLayoutHeader,
 * fading and blurring as it passes under the bar's edge, and once it is under, the bar shows it,
 * small, coming into focus; scrolled back, it comes out again. The title becomes the bar's rather
 * than two titles showing at once. One per page, first in its content.
 */
const props = withDefaults(defineProps<{ as?: string; class?: HTMLAttributes['class'] }>(), { as: 'h1' })

const sidebar = useRequiredSidebarContext('PageTitle')
const title = useTemplateRef<HTMLElement>('title')
// How far it has gone under the bar, from 0 (clear of it) to 1 (all under).
const gone = ref(0)

let frame = 0
function read() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const el = title.value
    if (!el) return
    const edge = sidebar.header.value?.getBoundingClientRect().bottom ?? 0
    const box = el.getBoundingClientRect()
    gone.value = Math.min(1, Math.max(0, (edge - box.top) / box.height))
    const text = el.textContent?.trim() ?? ''
    const under = gone.value > 0.9
    const was = sidebar.pageTitle.value
    if (was?.text !== text || was.under !== under) sidebar.pageTitle.value = { text, under }
  })
}
// Whatever scrolls (the page, or a scroller of its own) tells it, as scroll events reach the
// document on their way down.
onMounted(() => {
  document.addEventListener('scroll', read, { capture: true, passive: true })
  window.addEventListener('resize', read, { passive: true })
  read()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  document.removeEventListener('scroll', read, { capture: true })
  window.removeEventListener('resize', read)
  sidebar.pageTitle.value = undefined
})
</script>

<template>
  <component
    :is="as"
    ref="title"
    :class="cn('origin-left text-3xl font-semibold tracking-tight text-fg', props.class)"
    :style="gone ? { opacity: 1 - gone, filter: `blur(${gone * 3}px)`, scale: 1 - gone * 0.04 } : undefined"
  >
    <slot />
  </component>
</template>
