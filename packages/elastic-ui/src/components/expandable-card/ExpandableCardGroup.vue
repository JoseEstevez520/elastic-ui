<script setup lang="ts">
import { LayoutGroup, MotionConfig } from 'motion-v'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { morphTransition, prefersReducedMotion } from '../../utils/motion'
import { provideExpandableCardGroup } from './expandable-card.context'

/**
 * A grid of cards where the one you open lifts out of its cell and grows to cover the whole
 * grid, while its siblings fade out underneath. `class` styles the grid itself.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const openId = ref<string | null>(null)
const liftedId = ref<string | null>(null)
const activeId = ref<string | null>(null)

const close = () => (openId.value = null)

provideExpandableCardGroup({
  openId,
  liftedId,
  activeId,
  open: (id) => {
    activeId.value = id
    liftedId.value = id
    openId.value = id
    revealGroupTop()
  },
  close,
  onBodyHidden: (id) => {
    if (openId.value !== id) liftedId.value = null
  },
  onReturned: (id) => {
    if (activeId.value === id) activeId.value = null
  },
})

const root = useTemplateRef<HTMLElement>('root')

// The open card lands at the top of the group, which on a one-column layout can be far above
// the card that was tapped. Bring it back into view; `scroll-margin-top` on the group leaves
// room for a fixed header.
function revealGroupTop() {
  const el = root.value
  if (!el || el.getBoundingClientRect().top >= 0) return
  el.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (event.key === 'Escape') close()
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (openId.value && event.target instanceof Node && !root.value?.contains(event.target)) close()
})

// The open card covers at least the grid but grows past it when its content needs more room,
// as with a single row of cards. The group grows along with it, from the grid's own height so
// the transition has a real starting point, and pushes whatever follows down.
const grid = useTemplateRef<HTMLElement>('grid')
const gridHeight = ref(0)
const openHeight = ref<number>()
// Created on mount: ResizeObserver does not exist during server rendering.
let gridObserver: ResizeObserver | undefined
let openObserver: ResizeObserver | undefined

onMounted(() => {
  gridObserver = new ResizeObserver(() => (gridHeight.value = grid.value?.offsetHeight ?? 0))
  openObserver = new ResizeObserver(([entry]) => {
    openHeight.value = entry ? (entry.target as HTMLElement).offsetHeight : undefined
  })
  if (grid.value) gridObserver.observe(grid.value)
})

watch(liftedId, async (id) => {
  openObserver?.disconnect()
  openHeight.value = undefined
  if (!id) return
  await nextTick()
  const card = root.value?.querySelector<HTMLElement>('[data-expandable-card-open]')
  if (card) openObserver?.observe(card)
})

onBeforeUnmount(() => {
  gridObserver?.disconnect()
  openObserver?.disconnect()
})

// The open card covers the grid's own height, not the group's: the group follows the card, so a
// card held to the group's height could never shrink back once its content had grown.
const rootStyle = computed(() => ({
  minHeight: `${openHeight.value ?? gridHeight.value}px`,
  ...(gridHeight.value ? { '--expandable-card-cover': `${gridHeight.value}px` } : {}),
}))

// Scopes every card's `layoutId`s, so two groups on a page never pair with each other.
const groupId = useId()
</script>

<template>
  <LayoutGroup :id="groupId">
    <MotionConfig :transition="morphTransition" reduced-motion="user">
      <!-- Grows at the open pace and shrinks at the faster close pace. -->
      <div
        ref="root"
        :style="rootStyle"
        :class="
          cn(
            'relative transition-[min-height] ease-emphasized motion-reduce:transition-none',
            liftedId ? 'duration-[520ms]' : 'duration-300',
          )
        "
      >
        <!-- `auto-rows-fr` makes every row as tall as the tallest card, not just each row. -->
        <div ref="grid" :class="cn('grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2', props.class)">
          <slot />
        </div>
      </div>
    </MotionConfig>
  </LayoutGroup>
</template>
