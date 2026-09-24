<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { prefersReducedMotion } from '../../utils/motion'
import { ChatThreadReadyKey } from './chat.keys'

/**
 * Internal: an answer's text as it is written, the way AI chats now smooth it. A model sends its
 * text in bursts and pauses; shown as it lands it reads as jolts. Instead the text is revealed at
 * a steady pace, spreading each burst over the time the next one is expected to take (as
 * Streamdown and llm-ui do), a whole word at a time, and each word comes into focus as it
 * appears (as FlowToken does, with the library's blur-in). A word takes far longer to come into
 * focus than the next takes to appear, so many are coming in at once: a soft front of focus
 * travelling through the text, one wave rather than words landing one by one.
 */
const props = defineProps<{ text: string; streaming?: boolean }>()

// The pace follows how fast text arrives, averaged, and keeps a small cushion of it unshown, so
// the model's pauses are absorbed instead of showing as stops (as llm-ui does). Short of the
// cushion it slows, past it it speeds up, never halting while there is text left to show.
const CUSHION = 24 // characters
const CATCH_UP = 1500 // ms to close the gap to the cushion
const STARTING_RATE = 0.12 // characters a millisecond, before any has been measured
// A whole answer, or what is left once the model is done, comes in over about this long.
const FLUSH = 900

const threadReady = inject(ChatThreadReadyKey, ref(true))
// An answer there when the conversation opened just shows.
const shown = ref(threadReady.value && !prefersReducedMotion() ? 0 : props.text.length)
let exact = shown.value

let rate = STARTING_RATE
let lastArrival = 0
let lastLength = props.text.length
watch(
  () => props.text.length,
  (length) => {
    const now = performance.now()
    if (lastArrival && length > lastLength) {
      const measured = (length - lastLength) / Math.max(16, now - lastArrival)
      rate = 0.8 * rate + 0.2 * measured
    }
    lastArrival = now
    lastLength = length
    run()
  },
)

let frame = 0
let last = 0
function run() {
  // Without motion, or rendering on the server, the text simply shows.
  if (typeof requestAnimationFrame === 'undefined' || prefersReducedMotion()) {
    shown.value = props.text.length
    return
  }
  if (frame) return
  last = performance.now()
  const step = (now: number) => {
    const dt = now - last
    last = now
    const pending = props.text.length - exact
    if (pending <= 0) {
      frame = 0
      return
    }
    const speed = props.streaming
      ? Math.max(rate * 0.25, rate + (pending - CUSHION) / CATCH_UP)
      : Math.max(rate, pending / FLUSH)
    exact = Math.min(props.text.length, exact + speed * dt)
    shown.value = Math.floor(exact)
    frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}
run()
watch(() => props.streaming, run)
onBeforeUnmount(() => cancelAnimationFrame(frame))

// Whole words only: a word appears once it is complete, never a few letters of it. While the
// answer streams, the last word may still be growing (a model splits words across bursts), so it
// waits for the space after it; once done, whatever is revealed runs to the end of its word.
const visible = computed(() => {
  const text = props.text
  const revealed = text.slice(0, shown.value)
  if (props.streaming) {
    const lastSpace = revealed.search(/\s\S*$/)
    return lastSpace === -1 ? '' : revealed.slice(0, lastSpace)
  }
  const next = text.slice(shown.value).search(/\s/)
  return next === -1 ? text : text.slice(0, shown.value + next)
})
const pieces = computed(() => visible.value.split(/(\s+)/).filter(Boolean))
const animate = shown.value < props.text.length || props.streaming
</script>

<template>
  <template v-for="(piece, i) in pieces" :key="i">
    <template v-if="/^\s+$/.test(piece)">{{ piece }}</template>
    <!-- Each word comes into focus over 900ms, far longer than the gap to the next: at a model's
         pace the band of words coming in spans several lines, a front moving on a slant. -->
    <span v-else :class="animate && 'animate-[blur-in_900ms_var(--ease-soft)_both] motion-reduce:animate-none'">{{ piece }}</span>
  </template>
</template>
