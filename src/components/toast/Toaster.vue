<script setup lang="ts">
import { AnimatePresence, MotionConfig, motion } from 'motion-v'
import { computed, onBeforeUnmount, ref, shallowRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentOut, morphCloseTransition, morphTransition } from '../../utils/motion'
import { dismissToast, useToasts, type Toast } from './toast.store'
import { toastClass, toasterVariants, type ToasterPosition } from './toast.variants'

/**
 * Where toasts show up: one per app. Each toast arrives from the screen's edge while the others
 * slide aside, and leaves by fading out and folding its place away. They stack up one at a time
 * and never overlap. Call `toast()` from anywhere to show one.
 */
const props = withDefaults(
  defineProps<{
    position?: ToasterPosition
    /** Milliseconds a toast stays, unless it sets its own. */
    duration?: number
    /** Caps the toasts on screen; a new one past it retires the oldest. None by default: they
        stack up, each leaving when its time is up. */
    max?: number
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { position: 'bottom-right', duration: 5000, max: Infinity, label: 'Notifications' },
)

const { toasts } = useToasts()
const atTop = computed(() => props.position?.startsWith('top'))

watch(toasts, (all) => {
  if (all.length > props.max) all.slice(0, all.length - props.max).forEach((t) => dismissToast(t.id))
})

// Nothing ever overlaps. Toasts come in one at a time, each once the one before has nearly
// arrived, and never while one is fading out: sliding in over a toast still on its way, or over
// one leaving, is exactly an overlap. `displayed` is the queue as it reaches the screen.
const ENTRY_GAP = 300
const EXIT = (contentOut.duration + morphCloseTransition.duration) * 1000
const displayed = shallowRef<Toast[]>([])
let nextEntryAt = 0
let entryTimer: ReturnType<typeof setTimeout> | undefined

function sync() {
  clearTimeout(entryTimer)
  const queued = toasts.value
  const ids = new Set(queued.map((t) => t.id))
  const kept = displayed.value.filter((t) => ids.has(t.id))
  const now = Date.now()
  if (kept.length < displayed.value.length) nextEntryAt = Math.max(nextEntryAt, now + EXIT)

  const onScreen = new Set(kept.map((t) => t.id))
  const waiting = queued.filter((t) => !onScreen.has(t.id))
  if (waiting.length && now >= nextEntryAt) {
    onScreen.add(waiting[0]!.id)
    waiting.shift()
    nextEntryAt = now + ENTRY_GAP
  }
  displayed.value = queued.filter((t) => onScreen.has(t.id))
  if (waiting.length) entryTimer = setTimeout(sync, nextEntryAt - now)
}
watch(toasts, sync, { immediate: true })

// The newest toast sits nearest the edge it came from.
const shown = computed(() => (atTop.value ? [...displayed.value].reverse() : displayed.value))

// Each toast has its own clock, stopped while the pointer or focus is on the toasts, so one being
// read or acted on never disappears under the reader.
const remaining = new Map<number, number>()
const startedAt = new Map<number, number>()
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const hovered = ref(false)
const focused = ref(false)
const paused = computed(() => hovered.value || focused.value)

function start(t: Toast) {
  const left = remaining.get(t.id) ?? t.duration ?? props.duration
  remaining.set(t.id, left)
  if (paused.value || left === Infinity || timers.has(t.id)) return
  startedAt.set(t.id, Date.now())
  timers.set(t.id, setTimeout(() => dismissToast(t.id), left))
}

watch(paused, (isPaused) => {
  if (!isPaused) return displayed.value.forEach(start)
  const now = Date.now()
  for (const [id, timer] of timers) {
    clearTimeout(timer)
    remaining.set(id, Math.max(0, (remaining.get(id) ?? 0) - (now - (startedAt.get(id) ?? now))))
  }
  timers.clear()
})

// A toast's clock starts once it is on screen, not while it waits in the queue.
watch(
  displayed,
  (all) => {
    const ids = new Set(all.map((t) => t.id))
    for (const id of remaining.keys()) {
      if (ids.has(id)) continue
      clearTimeout(timers.get(id))
      timers.delete(id)
      remaining.delete(id)
      startedAt.delete(id)
    }
    all.forEach(start)
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  clearTimeout(entryTimer)
})

// Focus moving from one toast to another is still focus on the toasts.
function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  focused.value = next instanceof Node && (event.currentTarget as HTMLElement).contains(next)
}

// A leaving toast fades out, then folds its height away. It stays in the flow the whole time, so
// the others follow it as it folds and can never slide over it; taken out of the flow instead,
// it would drift over its neighbour as a stack anchored to the bottom shrinks.
const FOLD = { ...morphCloseTransition, delay: contentOut.duration }
const leave = {
  opacity: 0,
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  transition: { opacity: contentOut, height: FOLD, paddingTop: FOLD, paddingBottom: FOLD },
}

// Arrives from past the edge: a little more than its own height away, clearing the gutter.
const fromEdge = computed(() => ({ opacity: 0, y: atTop.value ? '-120%' : '120%' }))

function onKeydown(event: KeyboardEvent, id: number) {
  if (event.key === 'Escape') dismissToast(id)
}
</script>

<template>
  <section
    :aria-label="label"
    :class="cn(toasterVariants({ position }), props.class)"
    @pointerenter="hovered = true"
    @pointerleave="hovered = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
  >
    <MotionConfig :transition="morphTransition" reduced-motion="user">
      <!-- Present from the start, so screen readers announce every toast added to it. -->
      <ol aria-live="polite" class="flex w-full flex-col">
        <AnimatePresence :initial="false">
          <!-- The space between toasts is each one's own padding, on the side away from the edge,
               so it folds away with the toast instead of lingering as a gap. -->
          <motion.li
            v-for="t in shown"
            :key="t.id"
            layout="position"
            :initial="fromEdge"
            :animate="{ opacity: 1, y: 0, transition: morphTransition }"
            :exit="leave"
            :class="atTop ? 'pb-2' : 'pt-2'"
            @keydown="onKeydown($event, t.id)"
          >
            <div :class="toastClass">
              <div class="min-w-0 flex-1">
                <p class="font-medium">{{ t.title }}</p>
                <p v-if="t.description" class="mt-1 text-fg-secondary">{{ t.description }}</p>
                <button
                  v-if="t.action"
                  type="button"
                  class="mt-2 cursor-pointer text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                  @click="t.action.onClick(); dismissToast(t.id)"
                >
                  {{ t.action.label }}
                </button>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                class="-m-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-fg-faint transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
                @click="dismissToast(t.id)"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="size-3.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.li>
        </AnimatePresence>
      </ol>
    </MotionConfig>
  </section>
</template>
