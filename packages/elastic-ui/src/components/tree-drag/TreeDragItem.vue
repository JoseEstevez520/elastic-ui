<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, useTemplateRef, computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { TreeDragItemKey, useTreeDragContext, type TreeDragId, type TreeDragKey } from './tree-drag.context'

/**
 * One row of a `TreeDrag`: what is moved. It says where it sits (`parentId`, `index`) and whether
 * it can hold others (`section`, with how many it holds as `count`). Press it anywhere and move to
 * lift it (with `handle`, only its `TreeDragHandle` does), or use Alt with the arrows when it has
 * focus. Put only the row in it, not the rows under it: they are items of their own. Its slot says
 * when it is `dragging`, so a section can fold its rows away while it travels.
 */
const props = defineProps<{
  id: TreeDragId
  parentId?: TreeDragId | null
  index: number
  section?: boolean
  count?: number
  /** Only the handle starts a drag; the rest of the row is left alone. */
  handle?: boolean
  class?: HTMLAttributes['class']
}>()

const context = useTreeDragContext()
const el = useTemplateRef<HTMLElement>('el')
provide(TreeDragItemKey, { id: props.id })

let unregister: (() => void) | undefined
onMounted(() => {
  unregister = context.register(() => ({
    id: props.id,
    parentId: props.parentId ?? null,
    index: props.index,
    section: Boolean(props.section),
    count: props.count ?? 0,
    el: el.value!,
  }))
})
onBeforeUnmount(() => unregister?.())

const dragging = computed(() => context.draggingId.value === props.id)
const moving = computed(() => context.draggingId.value != null)
const shift = computed(() => context.shifts.value[String(props.id)] ?? 0)
const lit = computed(() => context.insideId.value === props.id)

// Text being edited keeps its clicks, selections and keys.
const typing = (target: EventTarget | null) => Boolean((target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]'))

function onPointerdown(event: PointerEvent) {
  if (props.handle || typing(event.target)) return
  context.start(props.id, event)
}

const keys: Record<string, TreeDragKey> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'out', ArrowRight: 'in' }
function onKeydown(event: KeyboardEvent) {
  const key = keys[event.key]
  if (!event.altKey || !key || typing(event.target)) return
  event.preventDefault()
  context.step(props.id, key)
}
</script>

<template>
  <div
    ref="el"
    :data-dragging="dragging || undefined"
    :class="
      cn(
        'group/row relative rounded-md',
        !props.handle && 'cursor-grab',
        dragging && 'z-10 cursor-grabbing bg-surface-raised transition-[translate] duration-150 ease-emphasized motion-reduce:transition-none',
        lit && 'bg-fg/10',
        moving && !dragging && 'transition-[transform,background-color] duration-200 ease-emphasized motion-reduce:transition-none',
        props.class,
      )
    "
    :style="
      dragging
        ? { transform: `translateY(${context.offset.value}px)`, translate: `${context.offsetX.value}px`, pointerEvents: 'none' }
        : moving
          ? { transform: `translateY(${shift}px)` }
          : undefined
    "
    @pointerdown="onPointerdown"
    @keydown="onKeydown"
  >
    <slot :dragging="dragging" />
  </div>
</template>
