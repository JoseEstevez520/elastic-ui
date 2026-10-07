<script setup lang="ts">
import { animate, motion, useMotionValue } from 'motion-v'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { labelFor } from '../../utils/labels'
import { EASE_EMPHASIZED, EASE_SOFT, prefersReducedMotion } from '../../utils/motion'
import { useSidebarContext, useSidebarVariant } from '../sidebar/sidebar.context'
import { provideNavTreeContext } from './nav-tree.context'
import { navTreeIndicatorVariants } from './nav-tree.variants'

/**
 * Side navigation: items, and groups that fold open like a Collapsible. The active item's
 * background slides to the next one instead of jumping, and a group holding the active item
 * opens on its own. Bind `v-model` to the current route, or let a click set it.
 *
 * With `selectable` it is a tree to pick a place from, as a field's panel: items and groups with a
 * `value` are options instead of links, announced as a tree whose chosen row is selected, and
 * reached with the arrow keys. Every pick emits `select`, the moment to close what holds it.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    /** A tree to pick from: rows are options (`role="tree"`, `aria-selected`) rather than links. */
    selectable?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('sections') },
)
const emit = defineEmits<{
  /** A row was picked, even the one already chosen. */
  select: [value: string]
}>()

const active = defineModel<string>()
const selectable = computed(() => props.selectable)
let rows = 0

// The one row Tab reaches in a selectable tree: the last one focused, or else the chosen one, or
// else the first. Until the tree has mounted, it is worked out from the rows themselves.
const tabStop = ref<string>()
function tabIndex(rowId: string, isActive: boolean, index: number) {
  if (!props.selectable) return undefined
  if (tabStop.value !== undefined) return tabStop.value === rowId ? 0 : -1
  return isActive || (index === 0 && active.value === undefined) ? 0 : -1
}

provideNavTreeContext({
  active,
  select: (value) => {
    active.value = value
    emit('select', value)
  },
  nextIndex: () => rows++,
  selectable,
  tabIndex,
})

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
// On a phone the panel covers the page, so there is nothing to connect to: a pill.
const variant = useSidebarVariant()
const sidebarContext = useSidebarContext()
const tab = computed(() => variant === 'connected' && !sidebarContext?.mobile.value)

// The indicator sits outside the groups' clip, so it takes on the clip of the groups around its
// item: it folds away and grows back exactly like the item, and fades with the group's content
// once the group starts to close (Reka UI marks it `data-state="closed"` right away).
const clip = ref<string>()

function clipAround(row: HTMLElement, scale: number) {
  const box = row.getBoundingClientRect()
  let top = box.top
  let bottom = box.bottom
  let closing = false
  for (let el = row.parentElement; el && el !== list.value; el = el.parentElement) {
    // Only a group's content hides what is in it; a group's own header stays in view while the
    // group is closed.
    if (el.dataset.state === 'closed' && 'navTreeContent' in el.dataset) closing = true
    if (getComputedStyle(el).overflowY !== 'visible') {
      const rect = el.getBoundingClientRect()
      top = Math.max(top, rect.top)
      bottom = Math.min(bottom, rect.bottom)
    }
  }
  const hiddenTop = Math.max(0, top - box.top) / scale
  const hiddenBottom = Math.max(0, box.bottom - bottom) / scale
  return {
    visible: !closing && hiddenTop + hiddenBottom < box.height / scale,
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

// Boxes on screen are scaled with whatever holds the tree (a Popover grows in from 97%), while the
// indicator is drawn in the list's own units: measured mid-growth, it would land off and stay off.
// The ratio of the list's box on screen to its laid-out width undoes the scale.
function scaleOf(el: HTMLElement) {
  return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1
}

function place(slide: boolean) {
  const row = list.value?.querySelector<HTMLElement>('[data-nav-tree-active]')
  const scale = list.value ? scaleOf(list.value) : 1
  const around = row ? clipAround(row, scale) : { visible: false, clip: undefined }
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
  const edge = tab.value ? list.value.closest('aside')?.getBoundingClientRect().right : undefined
  const target = {
    x: (to.left - from.left) / scale,
    y: (to.top - from.top) / scale,
    width: ((edge ?? to.right) - to.left) / scale,
    height: to.height / scale,
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

// A selectable tree's rows in the order the arrow keys go through them: those in view, not those
// in a group folded or folding away.
function visibleRows() {
  const all = list.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []
  return [...all].filter((row) => !row.closest('[data-nav-tree-content][data-state="closed"]'))
}

// Keeps Tab's way into the tree on a row in view: one folded away hands it to the chosen row, or
// to the first.
function keepTabStop() {
  if (!props.selectable) return
  const rows = visibleRows()
  if (rows.some((row) => row.id === tabStop.value)) return
  tabStop.value = (rows.find((row) => row.getAttribute('aria-selected') === 'true') ?? rows[0])?.id
}

function onFocusin(event: FocusEvent) {
  const row = event.target as HTMLElement
  if (props.selectable && row.getAttribute('role') === 'treeitem') tabStop.value = row.id
}

// Up and down through the rows in view, Home and End to the ends, a letter to the next row
// starting with it. Left and right fold and unfold, on the rows themselves; Enter and Space pick.
function onKeydown(event: KeyboardEvent) {
  if (!props.selectable || event.ctrlKey || event.metaKey || event.altKey) return
  const rows = visibleRows()
  const from = rows.indexOf(document.activeElement as HTMLElement)
  if (from < 0) return
  let next: HTMLElement | undefined
  if (event.key === 'ArrowDown') next = rows[from + 1]
  else if (event.key === 'ArrowUp') next = rows[from - 1]
  else if (event.key === 'Home') next = rows[0]
  else if (event.key === 'End') next = rows.at(-1)
  else if (event.key.length === 1 && event.key !== ' ') {
    const letter = event.key.toLowerCase()
    next = [...rows.slice(from + 1), ...rows.slice(0, from)].find((row) =>
      row.textContent?.trim().toLowerCase().startsWith(letter),
    )
  } else return
  event.preventDefault()
  next?.focus()
}

watch(active, () =>
  nextTick(() => {
    place(true)
    keepTabStop()
  }),
)

// Created on mount: ResizeObserver does not exist during server rendering. The list's size
// changes on every frame of a group opening or closing, and of a sidebar folding.
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!list.value) return
  observer = new ResizeObserver(() => {
    place(false)
    keepTabStop()
  })
  observer.observe(list.value)
  place(false)
  keepTabStop()
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <!-- A tree to pick from is not navigation: the tree itself carries the name. -->
  <component :is="selectable ? 'div' : 'nav'" :aria-label="selectable ? undefined : label" :class="props.class">
    <!-- `isolate` keeps the indicator's negative z-index above whatever is behind the nav. -->
    <ul
      ref="list"
      :role="selectable ? 'tree' : 'list'"
      :aria-label="selectable ? label : undefined"
      class="relative isolate flex flex-col gap-0.5"
      @focusin="onFocusin"
      @keydown="onKeydown"
    >
      <motion.li
        aria-hidden="true"
        role="presentation"
        :style="{ x, y, width, height, opacity, clipPath: clip }"
        :class="navTreeIndicatorVariants({ shape: tab ? 'tab' : 'pill' })"
      />
      <slot />
    </ul>
  </component>
</template>
