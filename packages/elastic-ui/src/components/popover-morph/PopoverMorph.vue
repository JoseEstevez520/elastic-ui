<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { provideFieldRoom } from '../../composables/useFieldRoom'
import { RovingFocusGroup } from 'reka-ui'
import { cn } from '../../utils/cn'
import { providePopoverMorphContext } from './popover-morph.context'
import {
  popoverMorphLabelState,
  popoverMorphListClass,
  popoverMorphPanelVariants,
  popoverMorphSurfaceVariants,
  popoverMorphTriggerVariants,
  type PopoverMorphTriggerVariants,
} from './popover-morph.variants'

/**
 * A trigger that becomes its own panel: the button's box grows into the panel and folds back
 * into it, while the label blurs out and the content comes into focus. Text never scales; the
 * box takes its size and clips the content, which sits at its full size from the start.
 *
 * With `role="menu"` it is a menu: PopoverMorphItems are reached with the arrow keys and by
 * typing their first letter, and choosing one closes it.
 *
 * Near a screen's edge the panel keeps the screen's margin: it moves sideways as it grows,
 * still starting on the button's box, and opens upwards when there is no room below.
 */
const props = withDefaults(
  defineProps<{
    /** The edge the panel lines up with, and the corner it grows from, where there is room. */
    align?: 'start' | 'end'
    /** Where it opens, where there is room; otherwise it opens the other way. */
    side?: 'bottom' | 'top'
    /** The button's look at rest: `outline` (the default), or `ghost` for a quiet bar or row. */
    variant?: PopoverMorphTriggerVariants['variant']
    /** `sm` for a bar, `icon` for a square button holding only an icon, which then needs a name. */
    size?: PopoverMorphTriggerVariants['size']
    /** On a phone, the panel fills the screen's width, less its margin on each side. */
    fluid?: boolean
    /** A `dialog` holds any content; a `menu` holds PopoverMorphItems. */
    role?: 'dialog' | 'menu'
    /** Accessible name of the panel. */
    label?: string
    /** Applied to the panel. */
    class?: HTMLAttributes['class']
  }>(),
  { align: 'start', side: 'bottom', role: 'dialog' },
)

const open = defineModel<boolean>('open', { default: false })

// It stays above its neighbours until it has folded all the way back, not only while open: a
// panel still shrinking under the next button along would be drawn behind it.
const FOLD = 300
const folding = ref(false)
let foldTimer: ReturnType<typeof setTimeout> | undefined
watch(open, (isOpen) => {
  clearTimeout(foldTimer)
  folding.value = !isOpen
  if (!isOpen) foldTimer = setTimeout(() => (folding.value = false), FOLD)
})
onBeforeUnmount(() => clearTimeout(foldTimer))

const close = () => (open.value = false)
providePopoverMorphContext({ close })
const isMenu = computed(() => props.role === 'menu')

const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panel = useTemplateRef<HTMLElement>('panel')
const panelId = useId()

// The surface animates between two measured boxes; `auto` cannot be transitioned. Until the first
// measurement (and in server rendering) it simply covers the trigger.
const triggerSize = ref<{ width: number; height: number }>()
const panelSize = ref<{ width: number; height: number }>()
let observer: ResizeObserver | undefined

onMounted(() => {
  const measure = () => {
    if (trigger.value) triggerSize.value = { width: trigger.value.offsetWidth, height: trigger.value.offsetHeight }
    if (panel.value) panelSize.value = { width: panel.value.offsetWidth, height: panel.value.offsetHeight }
    fitSideways()
  }
  measure()
  observer = new ResizeObserver(measure)
  for (const el of [trigger.value, panel.value]) if (el) observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

// A field that opens inside (a Select's list) reaches past the content: the panel grows to hold it,
// up to its cap, and scrolls it into view past that.
const spacer = useTemplateRef<HTMLElement>('spacer')
const { room } = provideFieldRoom({
  spacer,
  scroller: () => panel.value,
  space: () => window.innerHeight * 0.7,
  settle: 350,
})

// Where the panel goes, as Popover's collision handling (Reka UI's) would put it: sideways by as
// much as keeps it off the screen's edges, and on the side asked unless the other has more room.
// The surface moves by `shift` as it grows, and the panel inside moves back by as much on the same
// curve, so it never leaves its place. `shift` is kept up to date while closed too, so the panel
// already stands there when it opens; the side depends on the scroll, so it is chosen on opening.
const MARGIN = 16
const shift = ref(0)
const flipped = ref(false)
const placedSide = computed(() => (flipped.value ? (props.side === 'bottom' ? 'top' : 'bottom') : props.side))

function fitSideways() {
  const box = root.value?.getBoundingClientRect()
  const size = panelSize.value
  if (!box || !size) return
  const room = document.documentElement.clientWidth
  const left = props.align === 'start' ? box.left : box.right - size.width
  shift.value = Math.round(Math.max(MARGIN, Math.min(left, room - MARGIN - size.width)) - left)
}

function chooseSide() {
  const box = root.value?.getBoundingClientRect()
  const size = panelSize.value
  if (!box || !size) return
  // It grows over the trigger: going down it starts at the trigger's top, going up at its bottom.
  const below = window.innerHeight - MARGIN - box.top
  const above = box.bottom - MARGIN
  const [asked, other] = props.side === 'bottom' ? [below, above] : [above, below]
  flipped.value = asked < size.height && other > asked
}

const surfaceStyle = computed(() => {
  const size = open.value ? panelSize.value : triggerSize.value
  const box = size ? { width: `${size.width}px`, height: `${size.height}px` } : { inset: 0 }
  return { ...box, translate: `${open.value ? shift.value : 0}px 0` }
})
const panelStyle = computed(() => ({ translate: `${open.value ? 0 : shift.value}px 0` }))

watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    fitSideways()
    chooseSide()
  },
  { flush: 'pre' },
)
useEventListener(() => window, 'resize', fitSideways, { passive: true })

useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (open.value && event.key === 'Escape') close()
})
// In a menu, typing a letter moves to the next item that starts with it, as native menus do.
function onTypeahead(event: KeyboardEvent) {
  if (!isMenu.value || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
  const items = [...(panel.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])]
  const from = items.indexOf(document.activeElement as HTMLElement)
  const letter = event.key.toLowerCase()
  const next = [...items.slice(from + 1), ...items.slice(0, from + 1)].find((item) =>
    item.textContent?.trim().toLowerCase().startsWith(letter),
  )
  next?.focus()
}

useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) close()
})

// Focus moves into the panel as it opens, and back to the trigger if it was inside on close. A
// close by clicking elsewhere leaves focus where that click put it.
watch(open, async (isOpen) => {
  const hadFocus = panel.value?.contains(document.activeElement)
  await nextTick()
  if (isOpen) {
    // The first stop Tab would reach: a row a tree takes out of the tab order is skipped.
    const first = panel.value?.querySelector<HTMLElement>(
      ':is(a[href], button, input, select, textarea, [tabindex]):not([tabindex="-1"], :disabled)',
    )
    ;(first ?? panel.value)?.focus({ preventScroll: true })
  } else if (hadFocus) {
    trigger.value?.focus({ preventScroll: true })
  }
})
</script>

<template>
  <div ref="root" :class="cn('relative inline-block align-top', (open || folding) && 'z-50')">
    <div :class="popoverMorphSurfaceVariants({ variant, align, side: placedSide, open })" :style="surfaceStyle">
      <div
        :id="panelId"
        ref="panel"
        :role="role"
        :aria-label="label"
        tabindex="-1"
        :inert="!open"
        :style="panelStyle"
        :class="cn(popoverMorphPanelVariants({ align, side: placedSide, open, menu: isMenu, fluid }), props.class)"
        @keydown="onTypeahead"
      >
        <!-- A menu's items take the arrow keys, looping round at the ends. -->
        <RovingFocusGroup v-if="isMenu" orientation="vertical" loop :class="open && popoverMorphListClass">
          <slot :close="close" />
        </RovingFocusGroup>
        <slot v-else :close="close" />
        <div ref="spacer" aria-hidden="true" :style="{ height: `${room}px` }" />
      </div>
    </div>

    <!-- Above the surface; while open it blurs out and lets clicks through to the panel. -->
    <button
      ref="trigger"
      type="button"
      :aria-haspopup="role"
      :aria-expanded="open"
      :aria-controls="panelId"
      :inert="open"
      :class="cn(popoverMorphTriggerVariants({ variant, size }), open ? popoverMorphLabelState.open : popoverMorphLabelState.closed)"
      @click="open = !open"
    >
      <slot name="trigger" />
    </button>
  </div>
</template>
