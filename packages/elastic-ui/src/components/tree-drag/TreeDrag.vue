<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import {
  provideTreeDragContext,
  type TreeDragId,
  type TreeDragKey,
  type TreeDragMeta,
  type TreeDragMove,
} from './tree-drag.context'

/**
 * Makes a tree of rows movable by hand. Each row is a `TreeDragItem` with a `TreeDragHandle`;
 * dragging a row shows where it will land, a line between two rows or the middle of a section
 * lit to say "inside", and on release it says so with `move` (which parent, which place). It
 * moves nothing itself: the app moves its data and the rows follow. From the keyboard, Alt with
 * the arrows on a handle moves a row up or down among its siblings, out of its section, or into
 * the section above it.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{ move: [move: TreeDragMove] }>()

const root = useTemplateRef<HTMLElement>('root')
const items = new Set<() => TreeDragMeta>()
const draggingId = ref<TreeDragId | null>(null)
const offset = ref(0)

type Drop = { move: TreeDragMove; kind: 'before' | 'after' | 'inside'; over: TreeDragMeta }
const drop = ref<Drop | null>(null)
// The line or the lit row, in the tree's own coordinates.
const mark = reactive({ top: 0, left: 0, width: 0, height: 0, inside: false })

const metas = () => [...items].map((read) => read())

// What the dragged row cannot land on: itself and everything under it.
function withinDragged(all: TreeDragMeta[], id: TreeDragId) {
  const gone = new Set<TreeDragId>([id])
  let grew = true
  while (grew) {
    grew = false
    for (const m of all) if (m.parentId != null && gone.has(m.parentId) && !gone.has(m.id)) gone.add(m.id), (grew = true)
  }
  return gone
}

function locate(id: TreeDragId, y: number): Drop | null {
  const all = metas()
  const dragged = all.find((m) => m.id === id)
  if (!dragged) return null
  const gone = withinDragged(all, id)
  const rows = all.filter((m) => !gone.has(m.id)).sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top)
  if (!rows.length) return null

  // The row under the pointer, or the nearest end of the tree.
  let over = rows.find((m) => {
    const r = m.el.getBoundingClientRect()
    return y >= r.top && y <= r.bottom
  })
  if (!over) over = y < rows[0].el.getBoundingClientRect().top ? rows[0] : rows[rows.length - 1]
  const r = over.el.getBoundingClientRect()
  const fraction = Math.min(Math.max((y - r.top) / r.height, 0), 1)

  let kind: Drop['kind'] = fraction < 0.5 ? 'before' : 'after'
  if (over.section && fraction > 0.3 && fraction < 0.7) kind = 'inside'

  let parentId = kind === 'inside' ? over.id : over.parentId
  let index = kind === 'inside' ? over.count : kind === 'before' ? over.index : over.index + 1
  // Once the dragged row leaves, the places after it close up by one.
  if (parentId === dragged.parentId && dragged.index < index) index -= 1
  if (parentId === dragged.parentId && index === dragged.index) return null
  return { move: { id, parentId, index }, kind, over }
}

function place(next: Drop | null) {
  drop.value = next
  if (!next || !root.value) return
  const box = root.value.getBoundingClientRect()
  const r = next.over.el.getBoundingClientRect()
  mark.inside = next.kind === 'inside'
  mark.left = r.left - box.left
  mark.width = r.width
  mark.height = next.kind === 'inside' ? r.height : 2
  mark.top = (next.kind === 'after' ? r.bottom : r.top) - box.top - (next.kind === 'inside' ? 0 : 1)
}

let startY = 0
let lastY = 0
let scrollFrame = 0

function frame() {
  // The page follows a row dragged to its top or bottom edge.
  const edge = 56
  const speed = lastY < edge ? -(edge - lastY) / 4 : lastY > innerHeight - edge ? (lastY - (innerHeight - edge)) / 4 : 0
  if (speed) {
    scrollBy(0, speed)
    if (draggingId.value != null) {
      offset.value = lastY - startY
      place(locate(draggingId.value, lastY))
    }
  }
  scrollFrame = requestAnimationFrame(frame)
}

function onMove(event: PointerEvent) {
  if (draggingId.value == null) return
  lastY = event.clientY
  offset.value = lastY - startY
  place(locate(draggingId.value, lastY))
}

function finish(commit: boolean) {
  const done = drop.value
  stop()
  if (commit && done) emit('move', done.move)
}

const onUp = () => finish(true)
const onKey = (event: KeyboardEvent) => event.key === 'Escape' && finish(false)

function stop() {
  cancelAnimationFrame(scrollFrame)
  removeEventListener('pointermove', onMove)
  removeEventListener('pointerup', onUp)
  removeEventListener('pointercancel', onCancel)
  removeEventListener('keydown', onKey)
  draggingId.value = null
  offset.value = 0
  drop.value = null
}
const onCancel = () => finish(false)

function start(id: TreeDragId, event: PointerEvent) {
  if (event.button !== 0 || draggingId.value != null) return
  draggingId.value = id
  startY = lastY = event.clientY
  addEventListener('pointermove', onMove)
  addEventListener('pointerup', onUp)
  addEventListener('pointercancel', onCancel)
  addEventListener('keydown', onKey)
  scrollFrame = requestAnimationFrame(frame)
}

// A step from the keyboard is a move like any other.
function step(id: TreeDragId, key: TreeDragKey) {
  const all = metas()
  const me = all.find((m) => m.id === id)
  if (!me) return
  const siblings = all.filter((m) => m.parentId === me.parentId).sort((a, b) => a.index - b.index)
  if (key === 'up' && me.index > 0) emit('move', { id, parentId: me.parentId, index: me.index - 1 })
  else if (key === 'down' && me.index < siblings.length - 1) emit('move', { id, parentId: me.parentId, index: me.index + 1 })
  else if (key === 'out' && me.parentId != null) {
    const parent = all.find((m) => m.id === me.parentId)
    if (parent) emit('move', { id, parentId: parent.parentId, index: parent.index + 1 })
  } else if (key === 'in' && me.index > 0) {
    const before = siblings[me.index - 1]
    if (before?.section) emit('move', { id, parentId: before.id, index: before.count })
  }
}

provideTreeDragContext({
  register: (meta) => {
    items.add(meta)
    return () => items.delete(meta)
  },
  draggingId,
  offset,
  start,
  step,
})

onBeforeUnmount(stop)
</script>

<template>
  <div ref="root" :class="cn('relative', props.class)">
    <slot />
    <!-- Where it will land: a line between two rows, or the row it would go inside, lit. -->
    <div
      v-if="drop"
      aria-hidden="true"
      class="pointer-events-none absolute z-20 rounded-md transition-[top,left,width,height] duration-150 ease-emphasized motion-reduce:transition-none"
      :class="mark.inside ? 'bg-fg/10' : 'bg-fg'"
      :style="{ top: `${mark.top}px`, left: `${mark.left}px`, width: `${mark.width}px`, height: `${mark.height}px` }"
    />
  </div>
</template>
