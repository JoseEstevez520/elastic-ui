<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TextMorph from '../text-morph/TextMorph.vue'
import ChatStream from './ChatStream.vue'
import { chatMessageVariants } from './chat.variants'
import { useLabels } from '../../utils/labels'

/**
 * One message. Yours sits on the right in a soft, round bubble and just shows: you wrote it,
 * there is nothing to reveal. The answer reads as plain text on the left, with no box. Until its
 * first words arrive it says what it is doing ("Thinking…", "Searching…"), each new status
 * morphing into the next under a soft sheen; then it flows in as a wave (see ChatStream).
 */
const props = defineProps<{
  role: 'user' | 'assistant'
  /** The answer's text, so it can flow in as a wave. Without it, the slot shows as is. */
  text?: string
  /** The answer is still being written. */
  streaming?: boolean
  /** What it is doing before its first words, such as "Thinking" or "Searching the web". */
  status?: string
  class?: HTMLAttributes['class']
}>()
const labels = useLabels()
</script>

<template>
  <div :class="cn(chatMessageVariants({ role }), props.class)">
    <!-- Above the answer: what it used to get there, such as the tools it ran. -->
    <slot name="before" />
    <!-- The status and the answer share one cell, so the status fades out where it stood as the
         first words fade in, with nothing jumping. -->
    <div v-if="role === 'assistant' && text !== undefined" class="grid">
      <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
        <!-- What it is doing, until its first words; anything above it already says so. -->
        <p v-if="streaming && !text && !$slots.before" role="status" class="text-shimmer w-fit [grid-area:1/1]">
          <TextMorph :text="`${status ?? labels.thinking}…`" />
        </p>
      </Transition>
      <div class="[grid-area:1/1]"><ChatStream :text="text" :streaming="streaming" /></div>
    </div>
    <slot v-else />
  </div>
</template>
