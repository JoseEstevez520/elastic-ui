<script setup lang="ts">
import { animate, motion, useMotionValue } from 'motion-v'
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { EASE_EMPHASIZED, prefersReducedMotion } from '../../utils/motion'
import { provideNavTreeContext } from './nav-tree.context'
import { navTreeIndicatorClass } from './nav-tree.variants'

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
  { label: 'Sections' },
)

const active = defineModel<string>()
provideNavTreeContext({ active, select: (value) => (active.value = value) })

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
    if (getComputedStyle(el).overflow === 'hidden') {
      const rect = el.getBoundingClientRect()
      top = Math.max(top, rect.top)
      bottom = Math.min(bottom, rect.bottom)
    }
  }
  const hiddenTop = Math.max(0, top - box.top)
  const hiddenBottom = Math.max(0, box.bottom - bottom)
  return {
    visible: !closing && hiddenTop + hiddenBottom < box.height,
    clip: hiddenTop || hiddenBottom ? `inset(${hiddenTop}px 0 ${hiddenBottom}px 0)` : undefined,
  }
}

function place(slide: boolean) {
  const row = list.value?.querySelector<HTMLElement>('[data-nav-tree-active]')
  const around = row ? clipAround(row) : { visible: false, clip: undefined }
  if (around.visible !== shown) {
    shown = around.visible
    animate(opacity, shown ? 1 : 0, FADE)
  }
  clip.value = around.clip
  if (!row || !list.value) return

  const from = list.value.getBoundingClientRect()
  const to = row.getBoundingClientRect()
  const target = { x: to.left - from.left, y: to.top - from.top, width: to.width, height: to.height }

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
// changes on every frame of a group opening or closing, and when the width changes.
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
        :class="navTreeIndicatorClass"
      />
      <slot />
    </ul>
  </nav>
</template>
