<script setup lang="ts">
import { computed, provide, ref, watch, type HTMLAttributes } from 'vue'
import { AlertIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { afterPaint } from '../../utils/motion'
import StatusText from '../status-text/StatusText.vue'
import ChatStream from './ChatStream.vue'
import { ChatMessageKey } from './chat.keys'
import { chatMessageVariants } from './chat.variants'

/**
 * One message. Yours sits on the right in a soft, round bubble and just shows: you wrote it,
 * there is nothing to reveal. The answer reads as plain text on the left, with no box. Until its
 * first words arrive it says what it is doing ("Thinking…", "Searching…"), each new status
 * morphing into the next under a soft sheen; then it flows in as a wave (see ChatStream). If the
 * answer fails, that line turns into what went wrong, in the danger colour.
 */
const props = defineProps<{
  role: 'user' | 'assistant'
  /** The answer's text, so it can flow in as a wave. Without it, the slot shows as is. */
  text?: string
  /** The answer is still being written. */
  streaming?: boolean
  /** What it is doing before its first words, such as "Thinking" or "Searching the web". */
  status?: string
  /**
   * The answer failed and will not come: what went wrong. The line saying what it was doing turns
   * into it, in the danger colour and with the alert beside it. A step failing (ChatTool) is not
   * this: the answer goes on.
   */
  error?: string
  class?: HTMLAttributes['class']
}>()
const labels = useLabels()

const steps = ref(0)
const thinking = computed(() => (props.streaming && !props.text ? `${props.status ?? labels.thinking}…` : undefined))
provide(ChatMessageKey, { steps, thinking })

// The thinking line fades as the first words come in. A first step takes it over instead, becoming
// it where it stood (see ChatTool), so it goes at once. Decided as it leaves: a Transition keeps the
// classes it had when the line appeared, and the shimmer's endless animation would hold it there.
function onLeave(el: Element, done: () => void) {
  if (steps.value) return done()
  // Done either way: a fade cut short must still let the line go.
  el.animate({ opacity: [1, 0] }, { duration: 300, easing: 'linear' }).finished.then(done, done)
}

// The text is revealed at its own pace, after the model has sent it (see ChatStream). What went
// wrong waits until all of it is on show, and follows it in: shown at once, it would come in below
// words still appearing, pushed down line by line as they did.
const caughtUp = ref(true)
watch(
  () => props.text,
  () => (caughtUp.value = false),
)

// Failing where the thinking line stands, its words start where they were and slide over to make
// room for the alert as it comes into focus, as a first step's do (see ChatTool).
const shifting = ref(false)
watch(
  () => props.error,
  (error, before) => {
    if (!error || before || steps.value || props.text) return
    shifting.value = true
    afterPaint(() => (shifting.value = false))
  },
)
</script>

<template>
  <div :class="cn(chatMessageVariants({ role }), props.class)">
    <!-- Above the answer: what it used to get there, such as the tools it ran. -->
    <slot name="before" />
    <!-- The status and the answer share one cell, so the status fades out where it stood as the
         first words fade in, with nothing jumping. -->
    <div v-if="role === 'assistant' && text !== undefined" class="grid">
      <Transition :css="false" @leave="onLeave">
        <!-- What it is doing, until its first words or its first step. Failing, it turns into what
             went wrong. Where it no longer stood, after steps took its place or below words already
             come, it comes back as that, into focus, and below the words rather than over them. -->
        <p
          v-if="(error && (!text || caughtUp)) || (thinking && !steps)"
          :class="
            cn(
              'flex w-fit items-center gap-2',
              text ? 'mt-3' : '[grid-area:1/1]',
              error && (steps || text) && 'animate-blur-in motion-reduce:animate-none',
            )
          "
        >
          <AlertIcon
            v-if="error"
            aria-hidden="true"
            class="size-4 shrink-0 animate-[blur-in_0.35s_var(--ease-soft)_both] text-[color:var(--color-danger)] motion-reduce:animate-none"
          />
          <span
            :class="[
              'flex min-w-0 transition-[translate] duration-350 ease-emphasized motion-reduce:transition-none',
              shifting && '-translate-x-6',
            ]"
          >
            <StatusText :working="!error" :error="!!error" :text="error ?? thinking!" />
          </span>
        </p>
      </Transition>
      <div class="[grid-area:1/1]"><ChatStream :text="text" :streaming="streaming" @caught-up="caughtUp = true" /></div>
    </div>
    <slot v-else />
  </div>
</template>
