<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref, useId, useTemplateRef, type HTMLAttributes } from 'vue'
import { ArrowDownIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import ScrollIndicator from '../scroll-indicator/ScrollIndicator.vue'
import { ChatThreadReadyKey } from './chat.keys'

/**
 * The messages, scrolling. Sending glides your message to the top of the view, once, with room
 * below it for the answer to grow into, and the view holds still: the answer is never followed as
 * it streams, so it is read from its first line at your own pace, and a button takes you to the end
 * when there is more below. A message sent while it already sits in the upper half of the view
 * stays where it is, as the first one of a short conversation does. Whatever the reader does with
 * the scroll wins at once over any glide. Once the reader scrolls up, the room under a short
 * answer goes away out of sight, so there is no empty space to scroll back into, and nothing
 * moves when the answer ends. A conversation already there when it opens, or replaced whole,
 * shows from its end. Credit: after ChatGPT's and Claude's threads, and assistant-ui's top anchor.
 */
const props = defineProps<{ label?: string; class?: HTMLAttributes['class'] }>()

const el = useTemplateRef<HTMLElement>('el')
// Found by the scroll line beside it.
const scrollId = useId()
const list = useTemplateRef<HTMLElement>('list')

// Answers there when the thread first shows just show; only new ones come in.
const ready = ref(false)
provide(ChatThreadReadyKey, ready)

// Space kept above the message brought to the top, as the list keeps above the first one.
const TOP = 24
// How much of a long message of yours stays in view at the top, so the answer still has room.
const TALL = 1 / 3

// The message sent last, held at the top until the reader scrolls above it or sends another.
let anchor: HTMLElement | undefined
// How tall the messages are at least, so the one sent can reach the top however little follows
// it: a floor rather than a spacer, so the answer grows into it with nothing to update and nothing
// moving, and a status line giving way to the first words cannot make the scroll jump.
const floor = ref(0)

// Measured on screen (see DECISIONS, "a travelling image lands a pixel off"), in the scroller's
// own coordinates.
const offset = (node: HTMLElement) =>
  node.getBoundingClientRect().top - el.value!.getBoundingClientRect().top + el.value!.scrollTop
const end = () => (list.value ? offset(list.value) + list.value.offsetHeight : 0)

// Where the view goes to hold the message at the top; of a tall one, only its end shows.
function target() {
  if (!el.value || !anchor?.isConnected) return 0
  const tall = Math.max(0, anchor.offsetHeight - el.value.clientHeight * TALL)
  return Math.max(0, offset(anchor) - TOP + tall)
}

// Held, the floor lets the message reach the top. Let go, it is never more than what the view
// reaches, so the room under a short answer is taken away out of sight as the reader scrolls up,
// and is not there to scroll back into.
function fit() {
  if (!el.value) return
  // Held, it stays even once the answer is taller than it: an answer that shrinks back (its text
  // giving way to a step) then lands on it rather than pulling the scroll.
  let next = target() + el.value.clientHeight
  if (!anchor?.isConnected) {
    next = Math.min(floor.value, el.value.scrollTop + el.value.clientHeight)
    if (next <= end() + 0.5) next = 0
  }
  if (Math.abs(next - floor.value) > 0.5) floor.value = next
}

// The one glide: to the message just sent, or to the end when the button asks for it. Each frame
// closes part of the way, so it eases in however far it goes. `goal` is read each frame, so it
// lands where things are once it gets there.
let frame = 0
// Where this last put the scroll: a scroll event anywhere else is the reader's.
let written = -1
function glide(goal: () => number) {
  cancelAnimationFrame(frame)
  const step = () => {
    frame = 0
    if (!el.value) return
    const gap = goal() - el.value.scrollTop
    if (Math.abs(gap) <= 0.5) return
    el.value.scrollTop += prefersReducedMotion() ? gap : Math.sign(gap) * Math.max(1, Math.abs(gap) * 0.14)
    written = el.value.scrollTop
    frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

// A conversation as it opens sits at its end, and stays there as it lays itself out (inside a box
// still growing into place, say, or answers drawn a moment later), until the reader scrolls or
// sends something.
let fresh = true
function toEnd() {
  if (!el.value) return
  el.value.scrollTop = el.value.scrollHeight
  written = el.value.scrollTop
}

// The reader touching the scroll stops any glide where it is: theirs always wins.
function letGo() {
  fresh = false
  cancelAnimationFrame(frame)
  frame = 0
}

// Whether there is more below what shows, to offer the way down.
const NEAR = 80
const below = ref(false)
function onScroll() {
  if (!el.value) return
  const top = el.value.scrollTop
  const theirs = Math.abs(top - written) > 1
  // The reader leaving the end some other way (dragging a scrollbar) lets it go too.
  if (theirs && top < el.value.scrollHeight - el.value.clientHeight - 2) fresh = false
  // Scrolling above the message held at the top lets it go.
  if (theirs && anchor && top < target() - 2) anchor = undefined
  fit()
  below.value = end() - top - el.value.clientHeight > NEAR
}
const onKeydown = (event: KeyboardEvent) =>
  ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key) && letGo()

function toLatest() {
  fresh = false
  anchor = undefined
  glide(() => (el.value ? Math.max(0, end() - el.value.clientHeight) : 0))
}

const USER = '[data-chat-role="user"]'

// What was just added: your message, brought to the top; a whole new conversation, shown from its
// end as when the thread opens; anything else (an answer added on its own, older messages) moves
// nothing.
function onAdded(records: MutationRecord[]) {
  if (!el.value || !list.value) return
  const added = new Set(records.flatMap((r) => [...r.addedNodes]).filter((n): n is HTMLElement => n instanceof HTMLElement))
  if (!added.size) return
  const children = [...list.value.children] as HTMLElement[]
  if (children.every((c) => added.has(c))) {
    anchor = undefined
    floor.value = 0
    fresh = true
    return toEnd()
  }
  const sent = children
    .filter((c) => added.has(c))
    .map((c) => (c.matches(USER) ? c : c.querySelector<HTMLElement>(USER)))
    .find((c) => c)
  if (!sent) return fresh ? toEnd() : fit()
  fresh = false
  // Already in the upper half of the view: the answer has room enough, and nothing moves.
  const at = offset(sent) - el.value.scrollTop
  if (at >= 0 && at <= el.value.clientHeight / 2) {
    anchor = undefined
    return fit()
  }
  anchor = sent
  fit()
  glide(target)
}

// Created on mount: observers do not exist during server rendering. A conversation there when the
// thread opens shows from its end.
let resized: ResizeObserver | undefined
let added: MutationObserver | undefined
onMounted(() => {
  if (!el.value || !list.value) return
  toEnd()
  resized = new ResizeObserver(() => (fresh ? toEnd() : onScroll()))
  resized.observe(list.value)
  resized.observe(el.value)
  added = new MutationObserver(onAdded)
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
    <div
      ref="el"
      :data-scroll-id="scrollId"
      role="log"
      :aria-label="label ?? labels.conversation"
      :class="cn('relative min-h-0 flex-1 overflow-y-auto', props.class)"
      @scroll.passive="onScroll"
      @wheel.passive="letGo"
      @touchstart.passive="letGo"
      @keydown="onKeydown"
    >
      <div :style="floor ? { minHeight: `${floor}px` } : undefined">
        <div ref="list" class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
          <slot />
        </div>
      </div>
    </div>

    <!-- A short line for a scrollbar, running only where the messages read: clear of the box's
         corners and of the fades a surface puts over its ends. It shows for the reader's own
         scrolling, not for the glide to a message sent, nor as a chat first appears. -->
    <ScrollIndicator :target="`[data-scroll-id='${scrollId}']`" :length="32" :inset="40" :flash-on-mount="false" />

    <!-- Whenever there is more below what shows, the answer still coming included: it comes into
         focus, and fades as the end comes into view. -->
    <Transition
      enter-active-class="animate-[blur-in_0.3s_var(--ease-soft)] motion-reduce:animate-none"
      leave-active-class="animate-content-out motion-reduce:animate-none"
    >
      <button
        v-if="below"
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
