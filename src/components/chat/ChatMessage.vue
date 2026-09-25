<script setup lang="ts">
import { computed, provide, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
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
   * into it, in the danger colour. A step failing (ChatTool) is not this: the answer goes on.
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
        <StatusText
          v-if="error || (thinking && !steps)"
          as="p"
          :working="!error"
          :error="!!error"
          :text="error ?? thinking!"
          :class="
            cn(
              'w-fit',
              text ? 'mt-3' : '[grid-area:1/1]',
              error && (steps || text) && 'animate-[blur-in_0.45s_var(--ease-soft)_both] motion-reduce:animate-none',
            )
          "
        />
      </Transition>
      <div class="[grid-area:1/1]"><ChatStream :text="text" :streaming="streaming" /></div>
    </div>
    <slot v-else />
  </div>
</template>
