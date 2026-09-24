<script setup lang="ts">
import { animate, motion, useMotionValue } from 'motion-v'
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { labelFor } from '../../utils/labels'
import { EASE_EMPHASIZED, EASE_SOFT, prefersReducedMotion } from '../../utils/motion'
import { useSidebarVariant } from '../sidebar/sidebar.context'
import { provideNavTreeContext } from './nav-tree.context'
import { navTreeIndicatorVariants } from './nav-tree.variants'

/**
 * Side navigation: items, and groups that fold open like a Collapsible. The active item's
 * background slides to the next one instead of jumping, and a group holding the active item
 * opens on its own. Bind `v-model` to the current route, or let a click set it.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('sections') },
)

const active = defineModel<string>()
let rows = 0
provideNavTreeContext({ active, select: (value) => (active.value = value), nextIndex: () => rows++ })

// One indicator for the whole tree, placed over the active item's measured box, as in Tabs. It
// slides on a change of item, and follows the item at once while groups open and close above
// it, so it never lags behind the list moving under it.
const SLIDE = { duration: 0.45, ease: EASE_EMPHASIZED }
// Same as the group content fading out (`animate-content-out`).
const FADE = { duration: 0.15, ease: 'linear' } as const
const x = useMotionValue(0)
const y = useMotionValue(0)
const width = useMotionValue(0)
const height = useMotionValue(0)
const opacity = useMotionValue(0)
let placed = false
let sliding = false
let shown = false

const list = useTemplateRef<HTMLElement>('list')
// In a `connected` sidebar the indicator is a tab of the page, running on to the sidebar's edge.
const tab = useSidebarVariant() === 'connected'

// The indicator sits outside the groups' clip, so it takes on the clip of the groups around its
// item: it folds away and grows back exactly like the item, and fades with the group's content
// once the group starts to close (Reka UI marks it `data-state="closed"` right away).
const clip = ref<string>()

function clipAround(row: HTMLElement) {
  const box = row.getBoundingClientRect()
  let top = box.top
  let bottom = box.bottom
  let closing = false
  for (let el = row.parentElement; el && el !== list.value; el = el.parentElement) {
    if (el.dataset.state === 'closed') closing = true
    if (getComputedStyle(el).overflowY !== 'visible') {
      const rect = el.getBoundingClientRect()
      top = Math.max(top, rect.top)
      bottom = Math.min(bottom, rect.bottom)
    }
  }
  const hiddenTop = Math.max(0, top - box.top)
  const hiddenBottom = Math.max(0, box.bottom - bottom)
  return {
    visible: !closing && hiddenTop + hiddenBottom < box.height,
    clip: hiddenTop || hiddenBottom ? `inset(${hiddenTop}px 0 ${hiddenBottom}px 0 round 6px)` : undefined,
  }
}

// A group that opens brings its items in as a wave; the indicator comes in with its own item,
// on that item's delay and pace, never ahead of the text it sits under.
const COME_IN = { duration: 0.45, ease: EASE_SOFT }
function fadeInWith(row: HTMLElement) {
  const entrance = row.closest('li')?.getAnimations()[0]
  const timing = entrance?.effect?.getComputedTiming()
  if (!entrance || !timing) return FADE
  const waited = Number(entrance.currentTime ?? 0)
  const delay = Math.max(0, (timing.delay ?? 0) - waited) / 1000
  return { ...COME_IN, delay }
}

function place(slide: boolean) {
  const row = list.value?.querySelector<HTMLElement>('[data-nav-tree-active]')
  const around = row ? clipAround(row) : { visible: false, clip: undefined }
  if (around.visible !== shown) {
    shown = around.visible
    // Placed for the first time, it is simply there, like everything open when the page loads.
    if (!placed) opacity.jump(shown ? 1 : 0)
    else animate(opacity, shown ? 1 : 0, shown && row ? fadeInWith(row) : FADE)
  }
  clip.value = around.clip
  if (!row || !list.value) return

  const from = list.value.getBoundingClientRect()
  const to = row.getBoundingClientRect()
  const edge = tab ? list.value.closest('aside')?.getBoundingClientRect().right : undefined
  const target = {
    x: to.left - from.left,
    y: to.top - from.top,
    width: (edge ?? to.right) - to.left,
    height: to.height,
  }

  if (!placed || prefersReducedMotion() || (!slide && !sliding)) {
    x.jump(target.x)
    y.jump(target.y)
    width.jump(target.width)
    height.jump(target.height)
  } else {
    sliding = true
    animate(x, target.x, SLIDE)
    animate(width, target.width, SLIDE)
    animate(height, target.height, SLIDE)
    animate(y, target.y, { ...SLIDE, onComplete: () => (sliding = false) })
  }
  placed = true
}

watch(active, () => nextTick(() => place(true)))

// Created on mount: ResizeObserver does not exist during server rendering. The list's size
// changes on every frame of a group opening or closing, and of a sidebar folding.
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!list.value) return
  observer = new ResizeObserver(() => place(false))
  observer.observe(list.value)
  place(false)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav :aria-label="label" :class="props.class">
    <!-- `isolate` keeps the indicator's negative z-index above whatever is behind the nav. -->
    <ul ref="list" role="list" class="relative isolate flex flex-col gap-0.5">
      <motion.li
        aria-hidden="true"
        role="presentation"
        :style="{ x, y, width, height, opacity, clipPath: clip }"
        :class="navTreeIndicatorVariants({ shape: tab ? 'tab' : 'pill' })"
      />
      <slot />
    </ul>
  </nav>
</template>
