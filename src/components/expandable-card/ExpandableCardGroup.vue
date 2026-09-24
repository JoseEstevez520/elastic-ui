<script setup lang="ts">
import { LayoutGroup, MotionConfig } from 'motion-v'
import { ref, useId, useTemplateRef, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { morphTransition } from '../../utils/motion'
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
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (event.key === 'Escape') close()
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (openId.value && event.target instanceof Node && !root.value?.contains(event.target)) close()
})

// Scopes every card's `layoutId`s, so two groups on a page never pair with each other.
const groupId = useId()
</script>

<template>
  <LayoutGroup :id="groupId">
    <MotionConfig :transition="morphTransition">
      <div ref="root" class="relative">
        <!-- `auto-rows-fr` makes every row as tall as the tallest card, not just each row. -->
        <div :class="cn('grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2', props.class)">
          <slot />
        </div>
      </div>
    </MotionConfig>
  </LayoutGroup>
</template>
