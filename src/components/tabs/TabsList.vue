<script setup lang="ts">
import { animate, motion, useMotionValue, useTransform } from 'motion-v'
import { TabsList } from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { EASE_EMPHASIZED, prefersReducedMotion } from '../../utils/motion'
import { useTabsContext } from './tabs.context'
import { tabsIndicatorVariants, tabsListVariants } from './tabs.variants'

/**
 * The indicator is one element that slides to the active tab, taking its width on the way, with
 * the library's one ease. No stretching: it only has to show where the selection went.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const tabs = useTabsContext()

const SLIDE = { duration: 0.45, ease: EASE_EMPHASIZED }

const leftEdge = useMotionValue(0)
const rightEdge = useMotionValue(0)
const width = useTransform(() => rightEdge.get() - leftEdge.get())
const placed = ref(false)

const list = useTemplateRef<InstanceType<typeof TabsList>>('list')
const listEl = () => list.value?.$el as HTMLElement | undefined

function moveToActive(instant: boolean) {
  const active = listEl()?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
  if (!active) return
  const left = active.offsetLeft
  const right = left + active.offsetWidth

  if (instant || !placed.value || prefersReducedMotion()) {
    leftEdge.jump(left)
    rightEdge.jump(right)
  } else {
    animate(leftEdge, left, SLIDE)
    animate(rightEdge, right, SLIDE)
  }
  placed.value = true
  // In a list that scrolls sideways, keep the active tab in view, scrolling only the list itself:
  // `scrollIntoView` would also move the page, as far as it takes, on every mount.
  const el = listEl()
  if (el && el.scrollWidth > el.clientWidth) {
    const to = left < el.scrollLeft ? left : right > el.scrollLeft + el.clientWidth ? right - el.clientWidth : el.scrollLeft
    if (to !== el.scrollLeft) el.scrollTo({ left: to, behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

watch(tabs.value, () => nextTick(() => moveToActive(false)))

// When the tabs scroll sideways, the side with more tabs fades out instead of cutting a label
// in half, the same rule as any truncated text.
const FADE = 24
const moreBefore = ref(false)
const moreAfter = ref(false)
function updateEdges() {
  const el = listEl()
  if (!el) return
  moreBefore.value = el.scrollLeft > 1
  moreAfter.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}
const edgeMask = computed(() => {
  if (!moreBefore.value && !moreAfter.value) return undefined
  const start = moreBefore.value ? `transparent, #000 ${FADE}px` : '#000'
  const end = moreAfter.value ? `#000 calc(100% - ${FADE}px), transparent` : '#000'
  return { maskImage: `linear-gradient(to right, ${start}, ${end})` }
})

// Created on mount: ResizeObserver does not exist during server rendering. Re-places the
// indicator at once when tab widths change, for example once a web font loads.
let observer: ResizeObserver | undefined
onMounted(() => {
  const el = listEl()
  if (!el) return
  observer = new ResizeObserver(() => {
    moveToActive(true)
    updateEdges()
  })
  observer.observe(el)
  el.addEventListener('scroll', updateEdges, { passive: true })
  moveToActive(true)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  listEl()?.removeEventListener('scroll', updateEdges)
})
</script>

<template>
  <TabsList
    ref="list"
    :style="edgeMask"
    :class="cn(tabsListVariants({ variant: tabs.variant.value }), props.class)"
  >
    <motion.span
      v-show="placed"
      aria-hidden="true"
      :style="{ x: leftEdge, width }"
      :class="tabsIndicatorVariants({ variant: tabs.variant.value })"
    />
    <slot />
  </TabsList>
</template>
