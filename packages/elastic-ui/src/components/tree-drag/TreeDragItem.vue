<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, useTemplateRef, computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { TreeDragItemKey, useTreeDragContext, type TreeDragId } from './tree-drag.context'

/**
 * One row of a `TreeDrag`: what is moved. It says where it sits (`parentId`, `index`) and whether
 * it can hold others (`section`, with how many it holds as `count`), and its `TreeDragHandle`
 * starts the drag. Put only the row in it, not the rows under it: they are items of their own.
 * While dragged it follows the pointer on a raised surface, and what it leaves behind stays put.
 */
const props = defineProps<{
  id: TreeDragId
  parentId?: TreeDragId | null
  index: number
  section?: boolean
  count?: number
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
</script>

<template>
  <div
    ref="el"
    :data-dragging="dragging || undefined"
    :class="cn('group/row relative rounded-md', dragging && 'z-10 bg-surface-raised', props.class)"
    :style="dragging ? { transform: `translateY(${context.offset.value}px)`, pointerEvents: 'none' } : undefined"
  >
    <slot :dragging="dragging" />
  </div>
</template>
