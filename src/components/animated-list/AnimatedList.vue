<script setup lang="ts" generic="T">
import { AnimatePresence, MotionConfig, motion } from 'motion-v'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentOut, EASE_EMPHASIZED, morphCloseTransition, prefersReducedMotion } from '../../utils/motion'

/**
 * A list whose items find their new place when it is filtered, sorted or changed, instead of
 * jumping, and never over one another. The items that go fade out first; then the rest move: along
 * one line, all the same way (a list closing a gap), they slide; where any would cut across another
 * (a reorder, cards reflowing in a grid), they fade out where they were and come into focus at their
 * new place, as a wave. Items render from `items` and a scoped slot, so the list can measure each
 * one before and after a change.
 */
const props = withDefaults(
  defineProps<{
    items: T[]
    /** A key per item that stays the same while the list changes. Defaults to the item itself. */
    itemKey?: (item: T) => string | number
    as?: 'ul' | 'ol' | 'div'
    /** Whether the items there on the first render come in as a wave, or just show. */
    appear?: boolean
    /** Fold items in this direction after they fade, keeping them in the flow while leaving. */
    collapse?: 'vertical' | 'horizontal'
    class?: HTMLAttributes['class']
    itemClass?: HTMLAttributes['class']
  }>(),
  { as: 'ul', appear: true },
)

// Two roots (the list and the empty state), so attributes go to the list.
defineOptions({ inheritAttrs: false })

defineSlots<{
  default?(props: { item: T; index: number }): unknown
  /** Shown instead of the list while it has no items. */
  empty?(): unknown
}>()

const keyOf = (item: T) => props.itemKey?.(item) ?? (item as string | number)
const itemComponent = computed(() => (props.as === 'div' ? motion.div : motion.li))
const presenceMode = computed(() => (props.collapse ? 'sync' : 'popLayout'))
const leave = computed(() =>
  props.collapse === 'vertical'
    ? {
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        transition: {
          opacity: contentOut,
          height: { ...morphCloseTransition, delay: contentOut.duration },
          paddingTop: { ...morphCloseTransition, delay: contentOut.duration },
          paddingBottom: { ...morphCloseTransition, delay: contentOut.duration },
        },
      }
    : props.collapse === 'horizontal'
      ? {
          opacity: 0,
          width: 0,
          transition: {
            opacity: contentOut,
            width: { ...morphCloseTransition, delay: contentOut.duration },
          },
        }
      : { opacity: 0, transition: contentOut },
)

// Nothing ever overlaps. Leaving items fade out first, and only then do the rest slide into the
// gap; items that arrive wait until the rest have mostly made room for them.
const EXIT = contentOut.duration
const MAKE_ROOM = 0.3
const moveDelay = ref(0)

// Enter delays in ms, set once per item: changing one mid-animation restarts it. The first items,
// or a whole new set, come in as one wave like the rest of the library (`stagger-items`).
const delays = new Map<string | number, number>()
let wave = true
onMounted(() => (wave = false))
// Without `appear`, what is there on the first render just shows, as anything open when a page
// loads does; an item only comes in once it arrives afterwards.
const quiet = new Set(props.appear ? [] : props.items.map(keyOf))

// Where each item was before a change, measured just before the list re-renders.
const els = new Map<string | number, HTMLElement>()
function setEl(key: string | number, el: unknown) {
  const node = (el as { $el?: unknown } | null)?.$el ?? el
  if (node instanceof HTMLElement) els.set(key, node)
  else els.delete(key)
}
let before = new Map<string | number, DOMRect>()
const moving = new Set<Animation>()

// After a change, the items that stayed but moved find their new place. When they all go the same
// way along one line, as a list closing a gap, they slide there. When any would cut across another
// (in opposite directions, as in a reorder, or diagonally, as cards reflowing in a grid), sliding
// would cross them over one another: those fade out where they were and come into focus at their
// new place instead, as a wave.
const SLIDE = { duration: 450, easing: `cubic-bezier(${EASE_EMPHASIZED.join(',')})` }
function settle() {
  if (prefersReducedMotion()) return
  for (const animation of moving) animation.cancel()
  moving.clear()
  const movers: { el: HTMLElement; dx: number; dy: number; top: number; left: number }[] = []
  for (const [key, was] of before) {
    const el = els.get(key)
    if (!el || !el.isConnected) continue
    const now = el.getBoundingClientRect()
    const dx = was.left - now.left
    const dy = was.top - now.top
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) movers.push({ el, dx, dy, top: now.top, left: now.left })
  }
  const diagonal = movers.some((m) => Math.abs(m.dx) > 0.5 && Math.abs(m.dy) > 0.5)
  const opposite = (axis: 'dx' | 'dy') => movers.some((m) => m[axis] > 0.5) && movers.some((m) => m[axis] < -0.5)
  const crossing = diagonal || opposite('dx') || opposite('dy')
  const delay = moveDelay.value * 1000
  if (!crossing) {
    for (const { el, dx, dy } of movers)
      moving.add(el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0px 0px' }], { ...SLIDE, delay, fill: 'backwards' }))
    return
  }
  // In reading order of where they land, 40ms apart and none past the eighth.
  movers.sort((a, b) => a.top - b.top || a.left - b.left)
  movers.forEach(({ el, dx, dy }, i) => {
    const from = `${dx}px ${dy}px`
    moving.add(
      el.animate(
        [
          { translate: from, opacity: 1, filter: 'blur(0px)' },
          { translate: from, opacity: 0, filter: 'blur(0px)', offset: 0.25 },
          { translate: '0px 0px', opacity: 0, filter: 'blur(2px)', offset: 0.25 },
          { translate: '0px 0px', opacity: 1, filter: 'blur(0px)' },
        ],
        { duration: 600, delay: delay + Math.min(i, 7) * 40, easing: 'ease-out', fill: 'backwards' },
      ),
    )
  })
}
watch(() => props.items.map(keyOf), () => nextTick(settle), { flush: 'post' })

// Folding items (`collapse`) stay in the flow until they have folded away, and only then do the
// rest reflow: measured just before one goes, and settled once it has.
function onExitDone(key: string | number) {
  if (!props.collapse || props.items.some((item) => keyOf(item) === key)) return
  before = new Map([...els].filter(([k, el]) => k !== key && el.isConnected).map(([k, el]) => [k, el.getBoundingClientRect()]))
  requestAnimationFrame(settle)
}

// The empty state waits for the last items to be gone.
const emptyShown = ref(!props.items.length)
let emptyTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.items.length === 0,
  (empty) => {
    clearTimeout(emptyTimer)
    if (!empty) return (emptyShown.value = false)
    const gone = props.collapse ? (EXIT + morphCloseTransition.duration) * 1000 : EXIT * 1000
    emptyTimer = setTimeout(() => (emptyShown.value = true), gone)
  },
)
onBeforeUnmount(() => clearTimeout(emptyTimer))
onBeforeUnmount(() => moving.forEach((animation) => animation.cancel()))

// Runs before the list re-renders, so the delays are in place for the change that triggers them.
// Watching the keys, not the array, also catches changes made in place (`push`, `splice`).
watch(
  () => props.items.map(keyOf),
  (keys, previous) => {
    before = new Map([...els].filter(([, el]) => el.isConnected).map(([key, el]) => [key, el.getBoundingClientRect()]))
    const current = new Set(keys)
    const removed = previous.some((key) => !current.has(key))
    for (const key of delays.keys()) if (!current.has(key)) delays.delete(key)
    for (const key of quiet) if (!current.has(key)) quiet.delete(key)
    moveDelay.value = removed && !props.collapse ? EXIT : 0
    wave = !keys.some((key) => delays.has(key))
  },
)

function enterDelay(item: T, index: number) {
  const key = keyOf(item)
  if (!delays.has(key)) delays.set(key, wave ? Math.min(index, 7) * 40 : (moveDelay.value + MAKE_ROOM) * 1000)
  return `${delays.get(key)}ms`
}
</script>

<template>
  <MotionConfig reduced-motion="user">
    <!-- `relative` anchors items taken out of the flow by the default `popLayout` mode. Collapse
         mode keeps the leaving item in the flow while its size folds away. -->
    <component :is="as" v-bind="$attrs" :class="cn('relative', props.class)">
      <AnimatePresence :mode="presenceMode" :initial="false">
        <!-- The fade-in fills backwards only: a fill that lasted would override the opacity Motion
             sets on the way out. -->
        <component
          :is="itemComponent"
          v-for="(item, index) in items"
          :key="keyOf(item)"
          :ref="(el: unknown) => setEl(keyOf(item), el)"
          :exit="leave"
          @animation-complete="onExitDone(keyOf(item))"
          :style="{ animationDelay: enterDelay(item, index) }"
          :class="
            cn(
              props.collapse && 'overflow-hidden',
              !quiet.has(keyOf(item)) && 'animate-[blur-in_0.45s_var(--ease-soft)_backwards] motion-reduce:animate-none',
              itemClass,
            )
          "
        >
          <slot :item="item" :index="index" />
        </component>
      </AnimatePresence>
    </component>
  </MotionConfig>
  <!-- Beside the list rather than instead of it, and only once the last items have faded out, so
       it never shows over them. -->
  <Transition enter-active-class="animate-blur-in motion-reduce:animate-none">
    <div v-if="emptyShown"><slot name="empty" /></div>
  </Transition>
</template>
