<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import TextMorph from '../text-morph/TextMorph.vue'
import TruncatedText from '../truncated-text/TruncatedText.vue'
import { pathOf, type Glyph, type Stroke } from '../icon-morph/glyphs'

/**
 * A thing's state in a list (a note pending, processed or discarded; a run going, done or failed),
 * in place of a coloured Badge. One ring for every state; what is inside it changes in place, and
 * the label stays grey: only the icon carries colour, and only an outcome has one (done, needs a
 * look, failed). Discarded is a normal decision, so it is grey and not the danger colour. Working
 * is an arc that turns, the one thing here that moves on its own (it stops under reduced motion). Every
 * other state is at rest; a state that changes while you watch turns into the next one,
 * the icon's strokes travelling (as IconMorph) and the label morphing (TextMorph).
 *
 * `reason` says why, on hover and focus, and to screen readers. The phases are the library's
 * (`idle`, `working`, `done`, `error`) plus the two a list needs: `discarded` and `flagged`.
 */
const props = defineProps<{
  state: State
  /** Overrides the text of the state, in the app's own words. */
  label?: string
  /** Why it is in this state: shown on hover and focus. */
  reason?: string
  class?: HTMLAttributes['class']
}>()

type State = 'idle' | 'working' | 'done' | 'discarded' | 'flagged' | 'error'

const at = (x: number, y: number): Stroke => ({ points: [[x, y], [x, y], [x, y], [x, y]], hidden: true })
const line = (a: [number, number], b: [number, number]): Stroke => ({
  points: [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b, b],
})
// Three strokes for every state, so any can travel into any other; the ones a state does not
// need are folded onto a point and hidden.
const inside: Record<State, Glyph> = {
  idle: [line([12, 7], [12, 12]), line([12, 12], [15.5, 14]), at(12, 12)],
  working: [line([12, 7], [12, 12]), line([12, 12], [15.5, 14]), at(12, 12)],
  done: [{ points: [[8, 12.5], [10.8, 15.2], [16, 9], [16, 9]] }, at(10.8, 15.2), at(10.8, 15.2)],
  discarded: [line([8, 12], [16, 12]), at(12, 12), at(12, 12)],
  flagged: [line([12, 7.5], [12, 13]), line([12, 16.5], [12, 16.6]), at(12, 12)],
  error: [line([8.5, 8.5], [15.5, 15.5]), line([15.5, 8.5], [8.5, 15.5]), at(12, 12)],
}
const tones: Record<State, string> = {
  idle: 'text-fg-muted',
  working: 'text-fg-muted',
  done: 'text-success',
  discarded: 'text-fg-faint',
  flagged: 'text-warning',
  error: 'text-danger',
}

const labels = useLabels()
const defaults = computed<Record<State, string>>(() => ({
  idle: labels.statusIdle,
  working: labels.statusWorking,
  done: labels.statusDone,
  discarded: labels.statusDiscarded,
  flagged: labels.statusFlagged,
  error: labels.statusError,
}))
const text = computed(() => props.label ?? defaults.value[props.state])

// Working draws most of the ring; every other state closes it.
const CIRCUMFERENCE = 2 * Math.PI * 10
const dash = computed(() => (props.state === 'working' ? `${CIRCUMFERENCE * 0.72} ${CIRCUMFERENCE}` : `${CIRCUMFERENCE} 0`))
</script>

<template>
  <!-- Focusable only when there is a reason to read: the reason is its description. -->
  <span
    :title="reason"
    :tabindex="reason ? 0 : undefined"
    :aria-description="reason"
    :class="cn('inline-flex max-w-full items-center gap-2 align-middle text-label text-fg-secondary', props.class)"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      :class="['size-4 shrink-0 transition-colors duration-350 ease-emphasized motion-reduce:transition-none', tones[state]]"
    >
      <!-- Only the arc turns, so it reads as under way; the hands inside stay put. -->
      <g :class="state === 'working' && 'origin-center animate-[spin_1.1s_linear_infinite] motion-reduce:animate-none'">
        <circle
          cx="12"
          cy="12"
          r="10"
          :stroke-dasharray="dash"
          class="origin-center -rotate-90 transition-[stroke-dasharray] duration-[350ms] ease-emphasized motion-reduce:transition-none"
        />
      </g>
      <path
        v-for="(stroke, i) in inside[state]"
        :key="i"
        :style="{ d: `path('${pathOf(stroke)}')`, opacity: stroke.hidden ? 0 : 1 }"
        class="transition-[d,opacity] duration-[350ms] ease-emphasized motion-reduce:transition-none"
      />
    </svg>
    <TruncatedText class="min-w-0"><TextMorph :text="text" /></TruncatedText>
  </span>
</template>
