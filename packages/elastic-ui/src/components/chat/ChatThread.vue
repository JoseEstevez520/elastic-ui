<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, provide, ref, useId, useTemplateRef, type HTMLAttributes } from 'vue'
import { ArrowDownIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import ScrollIndicator from '../scroll-indicator/ScrollIndicator.vue'
import { ChatThreadReadyKey } from './chat.keys'

/**
 * The messages, scrolling. While the whole conversation fits, nothing moves. Once it no longer
 * does, sending glides your message to the top, once, leaving the room below for the answer to
 * grow into, and the view holds still while it does: the answer grows below without pulling the
 * view, so it is read at your own pace. Scrolling down to the end follows it again, gliding at the
 * pace the text comes rather than jumping to it; scrolling up to reread lets go of it, with a
 * button back to the end.
 */
const props = defineProps<{ label?: string; class?: HTMLAttributes['class'] }>()

const el = useTemplateRef<HTMLElement>('el')
// Found by the scroll line beside it.
const scrollId = useId()
const list = useTemplateRef<HTMLElement>('list')

// Answers there when the thread first shows just show; only new ones come in.
const ready = ref(false)
provide(ChatThreadReadyKey, ready)

// The room below the messages, so the newest can sit at the top however little follows it. It
// shrinks as the answer grows into it, keeping the height of the whole the same, so nothing moves.
const room = ref(0)
// The message the view was brought to, kept at the top until another is sent.
let anchor: HTMLElement | undefined
// Space kept above it, as the list keeps above the first message.
const TOP = 24

const end = () => (list.value ? list.value.offsetTop + list.value.offsetHeight : 0)

function fit() {
  if (!el.value || !anchor?.isConnected) return (room.value = 0)
  room.value = Math.max(0, el.value.clientHeight - (end() - anchor.offsetTop) - TOP)
}

// Following the end of the answer, until the reader scrolls up.
const following = ref(true)
// Where the view was last left, by this or by the reader: scrolling above it is the reader going up.
let lastTop = 0
let frame = 0

// Where the view is headed: the end while it follows the answer, and the message just sent at the
// top while it holds, so the answer grows below without pulling the view.
function goal() {
  if (!el.value) return 0
  const bottom = end() - el.value.clientHeight
  return following.value || !anchor?.isConnected ? bottom : anchor.offsetTop - TOP
}

// Each frame closes part of the way, so the view glides behind the text as it comes, never
// jumping, and catches up faster the further behind it is. Only ever down: it never pulls the
// reader back up.
function follow() {
  if (!el.value || frame) return
  const step = () => {
    frame = 0
    if (!el.value) return
    const gap = goal() - el.value.scrollTop
    if (gap <= 0.5) return
    el.value.scrollTop += prefersReducedMotion() ? gap : Math.max(1, gap * 0.12)
    lastTop = el.value.scrollTop
    frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

// Whether there is more below what shows, to offer the way down once the reader has let go.
const NEAR = 80
const below = ref(false)
function onScroll() {
  if (!el.value) return
  const top = el.value.scrollTop
  const down = top > lastTop
  if (top < lastTop - 4) following.value = false
  lastTop = top
  below.value = end() - top - el.value.clientHeight > NEAR
  // Scrolling down to the end follows again; only being near it, as right after letting go, does not.
  if (down && !below.value) {
    following.value = true
    // Following the end, the message kept at the top is let go, so the view reads naturally.
    anchor = undefined
  }
}
// The reader heading up lets go at once, before the view has moved: the glide would otherwise
// undo each small step of a wheel or a finger before it showed.
function letGo() {
  following.value = false
  cancelAnimationFrame(frame)
  frame = 0
}
const onWheel = (event: WheelEvent) => event.deltaY < 0 && letGo()
let touchY = 0
const onTouchStart = (event: TouchEvent) => (touchY = event.touches[0]?.clientY ?? 0)
const onTouchMove = (event: TouchEvent) => (event.touches[0]?.clientY ?? 0) > touchY + 4 && letGo()
const onKeydown = (event: KeyboardEvent) => ['ArrowUp', 'PageUp', 'Home'].includes(event.key) && letGo()

function toLatest() {
  following.value = true
  anchor = undefined
  follow()
}

// Created on mount: observers do not exist during server rendering. Sending adds your message
// (and the answer's place after it): the view glides to the first of them and holds there. Growing
// refits the room below, so the answer grows without moving the view; it follows again only once
// the reader is back at the end.
let resized: ResizeObserver | undefined
let added: MutationObserver | undefined
onMounted(() => {
  if (!el.value || !list.value) return
  el.value.scrollTop = el.value.scrollHeight
  lastTop = el.value.scrollTop
  resized = new ResizeObserver(() => {
    fit()
    onScroll()
    // Only while the reader is at the end: a held message lets the answer grow below without moving.
    if (following.value) follow()
  })
  resized.observe(list.value)
  resized.observe(el.value)
  added = new MutationObserver((records) => {
    const first = records.flatMap((r) => [...r.addedNodes]).find((n): n is HTMLElement => n instanceof HTMLElement)
    if (!first) return
    // A new message is brought to the top and the view holds there: the answer grows below without
    // pulling it, until the reader scrolls down.
    following.value = false
    // Everything still fits: nothing to bring up, and nothing moves.
    anchor = el.value && end() > el.value.clientHeight ? first : undefined
    fit()
    // Once the room is there to scroll into.
    nextTick(follow)
  })
  added.observe(list.value, { childList: true })
  requestAnimationFrame(() => (ready.value = true))
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resized?.disconnect()
  added?.disconnect()
})

const labels = useLabels()
</script>

<template>
  <div class="relative flex min-h-0 flex-1 flex-col">
    <!-- `relative`: the messages' offsets are measured against it. -->
    <div
      ref="el"
      :data-scroll-id="scrollId"
      role="log"
      :aria-label="label ?? labels.conversation"
      :class="cn('relative min-h-0 flex-1 overflow-y-auto', props.class)"
      @scroll.passive="onScroll"
      @wheel.passive="onWheel"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @keydown="onKeydown"
    >
      <div ref="list" class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        <slot />
      </div>
      <div aria-hidden="true" :style="{ height: `${room}px` }" />
    </div>

    <!-- A short line for a scrollbar, running only where the messages read: clear of the box's
         corners and of the fades a surface puts over its ends. It shows for the reader's own
         scrolling, not for the thread following its answer, nor as a chat first appears. -->
    <ScrollIndicator :target="`[data-scroll-id='${scrollId}']`" :length="32" :inset="40" :flash-on-mount="false" />

    <!-- Only once the reader has scrolled up with more below: it comes into focus, and fades as the
         end comes back into view. -->
    <Transition
      enter-active-class="animate-[blur-in_0.3s_var(--ease-soft)] motion-reduce:animate-none"
      leave-active-class="animate-content-out motion-reduce:animate-none"
    >
      <button
        v-if="below && !following"
        type="button"
        :aria-label="labels.jumpToLatest"
        :class="[
          'absolute bottom-3 left-1/2 flex size-9 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full',
          'border border-border text-fg-muted shadow-soft transition-colors hover:text-fg',
          'focus-ring',
          // The composer's surface, so over colour (ChatMorph's aurora) it turns to glass with it.
          'bg-[color:var(--chat-composer-bg,var(--color-bg))] backdrop-blur-md',
        ]"
        @click="toLatest"
      >
        <ArrowDownIcon class="size-4" />
      </button>
    </Transition>
  </div>
</template>
