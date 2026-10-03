<script setup lang="ts">
import { onBeforeUnmount, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import {
  provideTreeDragContext,
  type TreeDragId,
  type TreeDragKey,
  type TreeDragMeta,
  type TreeDragMove,
} from './tree-drag.context'

/**
 * Makes a tree of rows movable by hand. Each row is a `TreeDragItem`; pressing one and moving
 * lifts it, the rows make room where it would land (the hole it left closes, a gap opens), and a
 * section it would go inside is lit. On release it says so with `move` (which parent, which
 * place). It moves nothing itself: the app moves its data and the rows follow. From the keyboard,
 * Alt with the arrows on a row moves it up or down among its siblings, out of its section, or
 * into the section above it.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{ move: [move: TreeDragMove] }>()

const items = new Set<() => TreeDragMeta>()
const draggingId = ref<TreeDragId | null>(null)
const offset = ref(0)
const insideId = ref<TreeDragId | null>(null)
const shifts = ref<Record<string, number>>({})

const metas = () => [...items].map((read) => read())

// Where every row sits on the page when drag starts, measured once: rows are only moved with
// transforms from then on, so what is measured is never mixed up with what is moved.
interface Box {
  top: number
  bottom: number
  height: number
}
let boxes = new Map<TreeDragId, Box>()
const box = (m: TreeDragMeta) => boxes.get(m.id)!

function measure() {
  boxes = new Map(
    metas().map((m) => {
      const r = m.el.getBoundingClientRect()
      return [m.id, { top: r.top + scrollY, bottom: r.bottom + scrollY, height: r.height }]
    }),
  )
}

// What travels with the dragged row: itself and everything under it.
function withinDragged(all: TreeDragMeta[], id: TreeDragId) {
  const gone = new Set<TreeDragId>([id])
  let grew = true
  while (grew) {
    grew = false
    for (const m of all) {
      if (m.parentId != null && gone.has(m.parentId) && !gone.has(m.id)) {
        gone.add(m.id)
        grew = true
      }
    }
  }
  return gone
}

interface Drop {
  move: TreeDragMove
  inside: boolean
  /** Where the gap opens, on the page, when the row goes between two. */
  gapAt: number | null
}

function locate(id: TreeDragId, y: number): Drop | null {
  const all = metas()
  const dragged = all.find((m) => m.id === id)
  if (!dragged) return null
  const gone = withinDragged(all, id)
  const rows = all
    .filter((m) => !gone.has(m.id))
    .map((m) => ({ m, b: box(m) }))
    .sort((a, b) => a.b.top - b.b.top)
  if (!rows.length) return null

  // The row under the pointer, or the nearest one when it is between two (or past either end).
  const distance = ({ b }: (typeof rows)[number]) => (y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0)
  const over = rows.reduce((best, row) => (distance(row) < distance(best) ? row : best), rows[0])
  const fraction = Math.min(Math.max((y - over.b.top) / over.b.height, 0), 1)

  let kind: 'before' | 'after' | 'inside' = fraction < 0.5 ? 'before' : 'after'
  if (over.m.section && fraction > 0.3 && fraction < 0.7) kind = 'inside'

  const parentId = kind === 'inside' ? over.m.id : over.m.parentId
  let index = kind === 'inside' ? over.m.count : kind === 'before' ? over.m.index : over.m.index + 1
  // Once the dragged row leaves, the places after it close up by one.
  if (parentId === dragged.parentId && dragged.index < index) index -= 1
  // Dropped where it already is: nothing moves, and no gap opens.
  if (parentId === dragged.parentId && index === dragged.index) return null
  return {
    move: { id, parentId, index },
    inside: kind === 'inside',
    gapAt: kind === 'inside' ? null : kind === 'before' ? over.b.top : over.b.bottom,
  }
}

let current: Drop | null = null
let startY = 0
let lastY = 0
let scrollFrame = 0

// Closes the hole the row left and opens a gap where it would land, with transforms only.
function place(next: Drop | null) {
  current = next
  const id = draggingId.value
  if (id == null) return
  const all = metas()
  const dragged = all.find((m) => m.id === id)
  if (!dragged) return
  const gone = withinDragged(all, id)
  const own = box(dragged)
  const subBottom = Math.max(...all.filter((m) => gone.has(m.id)).map((m) => box(m).bottom))
  const below = all
    .filter((m) => !gone.has(m.id))
    .map((m) => box(m))
    .filter((b) => b.top >= subBottom - 1)
    .sort((a, b) => a.top - b.top)[0]
  // How much room the row takes: its height, its rows under it, and what sits between rows.
  const pitch = below ? below.top - own.top : subBottom - own.top
  // Not over anywhere new, the gap stays where the hole is: nothing seems to move.
  const gapAt = current ? current.gapAt : own.top
  const moved: Record<string, number> = {}
  for (const m of all) {
    if (m.id === id) continue
    if (gone.has(m.id)) {
      moved[String(m.id)] = offset.value
      continue
    }
    const b = box(m)
    let shift = 0
    if (b.top >= subBottom - 1) shift -= pitch
    if (gapAt != null && b.top >= gapAt - 1) shift += pitch
    if (shift) moved[String(m.id)] = shift
  }
  shifts.value = moved
  insideId.value = current?.inside ? current.move.parentId : null
}

function frame() {
  // The page follows a row dragged to its top or bottom edge.
  const edge = 56
  const speed = lastY < edge ? -(edge - lastY) / 4 : lastY > innerHeight - edge ? (lastY - (innerHeight - edge)) / 4 : 0
  if (speed && draggingId.value != null) {
    scrollBy(0, speed)
    update()
  }
  scrollFrame = requestAnimationFrame(frame)
}

function update() {
  if (draggingId.value == null) return
  offset.value = lastY + scrollY - startY
  place(locate(draggingId.value, lastY + scrollY))
}

// A press is a drag only once it moves, so a click on a row still clicks.
const THRESHOLD = 4
let pending: { id: TreeDragId; x: number; y: number } | null = null

function onMove(event: PointerEvent) {
  if (pending) {
    if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) < THRESHOLD) return
    measure()
    draggingId.value = pending.id
    startY = pending.y + scrollY
    scrollFrame = requestAnimationFrame(frame)
    document.documentElement.style.userSelect = 'none'
    pending = null
  }
  if (draggingId.value == null) return
  lastY = event.clientY
  update()
}

function onTouchMove(event: TouchEvent) {
  if (draggingId.value != null) event.preventDefault()
}

// The click that ends a drag is not a click on what was under the pointer.
const swallow = (event: Event) => event.stopPropagation()

function finish(commit: boolean) {
  const done = current
  const was = draggingId.value
  stop()
  if (was != null) {
    addEventListener('click', swallow, { capture: true, once: true })
    setTimeout(() => removeEventListener('click', swallow, { capture: true }), 0)
  }
  if (commit && done && was != null) emit('move', done.move)
}
const onUp = () => finish(true)
const onCancel = () => finish(false)
const onKey = (event: KeyboardEvent) => event.key === 'Escape' && finish(false)

function stop() {
  cancelAnimationFrame(scrollFrame)
  removeEventListener('pointermove', onMove)
  removeEventListener('pointerup', onUp)
  removeEventListener('pointercancel', onCancel)
  removeEventListener('keydown', onKey)
  removeEventListener('touchmove', onTouchMove)
  document.documentElement.style.userSelect = ''
  pending = null
  current = null
  draggingId.value = null
  offset.value = 0
  insideId.value = null
  shifts.value = {}
}

function start(id: TreeDragId, event: PointerEvent) {
  if (event.button !== 0 || draggingId.value != null || pending) return
  pending = { id, x: event.clientX, y: event.clientY }
  lastY = event.clientY
  addEventListener('pointermove', onMove)
  addEventListener('pointerup', onUp)
  addEventListener('pointercancel', onCancel)
  addEventListener('keydown', onKey)
  addEventListener('touchmove', onTouchMove, { passive: false })
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
  insideId,
  shifts,
  start,
  step,
})

onBeforeUnmount(stop)
</script>

<template>
  <div :class="cn('relative', props.class)">
    <slot />
  </div>
</template>
