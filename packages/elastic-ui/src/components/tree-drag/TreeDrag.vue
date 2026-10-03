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
 * section that would hold it is lit, and, after the last row of a section, how far left or right the pointer is picks the level: further left steps out. On release it says so with `move` (which parent, which
 * place). It moves nothing itself: the app moves its data and the rows follow. From the keyboard,
 * Alt with the arrows on a row moves it up or down among its siblings, out of its section, or
 * into the section above it.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{
  move: [move: TreeDragMove]
  /** The row has hovered over this section for a moment: the app may open it, to drop inside. */
  reveal: [id: TreeDragId]
}>()

const items = new Set<() => TreeDragMeta>()
const draggingId = ref<TreeDragId | null>(null)
const offset = ref(0)
const offsetX = ref(0)
const insideId = ref<TreeDragId | null>(null)
const shifts = ref<Record<string, number>>({})

const metas = () => [...items].map((read) => read())

// Where every row sits on the page when drag starts, measured once: rows are only moved with
// transforms from then on, so what is measured is never mixed up with what is moved.
interface Box {
  top: number
  bottom: number
  height: number
  left: number
}
let boxes = new Map<TreeDragId, Box>()
const box = (m: TreeDragMeta) => boxes.get(m.id)!

function measure() {
  boxes = new Map(
    metas().map((m) => {
      const r = m.el.getBoundingClientRect()
      return [m.id, { top: r.top + scrollY, bottom: r.bottom + scrollY, height: r.height, left: r.left + scrollX }]
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
  /** The section that would hold it, lit so the level reads without a line. */
  holder: TreeDragId | null
  /** Where the gap opens, on the page, when the row goes between two. */
  gapAt: number | null
  /** The left edge of the level it would land at. */
  left: number
  /** It would go inside the section under the pointer, not between rows. */
  inside: boolean
}

function locate(id: TreeDragId, y: number, x: number): Drop | null {
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
  if (over.m.section && fraction > 0.25 && fraction < 0.75) kind = 'inside'

  const shown = (m: TreeDragMeta) => rows.some((r) => r.m.parentId === m.id)
  let parentId: TreeDragId | null
  let index: number
  let gapAt: number | null = null
  // Where a row lands inside a section: level with its rows, or an indent in if it has none.
  const insideLeft = (m: TreeDragMeta, b: Box) => rows.find((r) => r.m.parentId === m.id)?.b.left ?? b.left + 20
  let left = over.b.left

  if (kind === 'inside') {
    parentId = over.m.id
    index = over.m.count
    left = insideLeft(over.m, over.b)
  } else if (kind === 'before') {
    parentId = over.m.parentId
    index = over.m.index
    gapAt = over.b.top
  } else if (over.m.section && shown(over.m)) {
    // Under an open section is its first place: the gap opens between it and its rows.
    parentId = over.m.id
    index = 0
    gapAt = over.b.bottom
    left = insideLeft(over.m, over.b)
  } else {
    // After the last row of a section, the pointer picks the level: further right stays inside
    // it, further left steps out to the section's own level, and so on up.
    const levels: { parentId: TreeDragId | null; index: number; left: number }[] = [
      { parentId: over.m.parentId, index: over.m.index + 1, left: over.b.left },
    ]
    let at = over.m
    while (at.parentId != null) {
      const parent = rows.find((r) => r.m.id === at.parentId)
      if (!parent || rows.some((r) => r.m.parentId === parent.m.id && r.m.index > at.index)) break
      levels.push({ parentId: parent.m.parentId, index: parent.m.index + 1, left: parent.b.left })
      at = parent.m
    }
    const pick = levels.find((level) => x >= level.left + 8) ?? levels[levels.length - 1]
    parentId = pick.parentId
    index = pick.index
    gapAt = over.b.bottom
    left = pick.left
  }

  // Once the dragged row leaves, the places after it close up by one.
  if (parentId === dragged.parentId && dragged.index < index) index -= 1
  // Dropped where it already is: nothing moves, and no gap opens.
  if (parentId === dragged.parentId && index === dragged.index) return null
  return { move: { id, parentId, index }, holder: parentId, gapAt, left, inside: kind === 'inside' }
}

let current: Drop | null = null
let waitingOn: TreeDragId | null = null
let waitTimer: ReturnType<typeof setTimeout> | undefined

// Held over one section for a moment, it is asked to open (once), so the row can go among its rows.
function wait(id: TreeDragId | null) {
  if (id === waitingOn) return
  clearTimeout(waitTimer)
  waitingOn = id
  if (id != null) waitTimer = setTimeout(() => emit('reveal', id), 600)
}
let startY = 0
let lastY = 0
let lastX = 0
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
  offsetX.value = current ? current.left - own.left : 0
  insideId.value = current?.holder ?? null
  wait(current?.inside ? current.move.parentId : null)
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
  place(locate(draggingId.value, lastY + scrollY, lastX + scrollX))
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
  lastX = event.clientX
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
  clearTimeout(waitTimer)
  waitingOn = null
  pending = null
  current = null
  draggingId.value = null
  offset.value = 0
  offsetX.value = 0
  insideId.value = null
  shifts.value = {}
}

function start(id: TreeDragId, event: PointerEvent) {
  if (event.button !== 0 || draggingId.value != null || pending) return
  pending = { id, x: event.clientX, y: event.clientY }
  lastY = event.clientY
  lastX = event.clientX
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
  offsetX,
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
