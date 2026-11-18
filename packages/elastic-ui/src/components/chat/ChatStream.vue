<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { createStreamPace, wholeWords } from '../../utils/streamPace'
import { prefersReducedMotion } from '../../utils/motion'
import { ChatThreadReadyKey } from './chat.keys'

/**
 * Internal: an answer's text as it is written, the way AI chats now smooth it. A model sends its
 * text in bursts and pauses; shown as it lands it reads as jolts. Instead the text is revealed at
 * a steady pace, spreading each burst over the time the next one is expected to take (as
 * Streamdown and llm-ui do), a whole word at a time, and each word comes into focus as it
 * appears (as FlowToken does, with the library's blur-in). A word takes far longer to come into
 * focus than the next takes to appear, on an ease that starts and ends gently, so many are
 * coming in at once: a soft gradient of focus travelling through the text, one smooth wave
 * rather than words landing one by one.
 */
const props = defineProps<{ text: string; streaming?: boolean }>()
/** Everything that has come is on show; what comes after the answer can follow it in. */
const emit = defineEmits<{ caughtUp: [] }>()

// The pace (see createStreamPace): steady, following how fast text arrives, with a cushion that
// absorbs the model's pauses; whole words only (see wholeWords).
const threadReady = inject(ChatThreadReadyKey, ref(true))
const shown = ref(0)
const quiet = ref(false)
const pace = createStreamPace({
  onFrame: (n) => (shown.value = n),
  onCaughtUp: () => emit('caughtUp'),
  onQuiet: () => (quiet.value = true),
  // An answer there when the conversation opened just shows.
  startShown: !(threadReady.value && !prefersReducedMotion()),
})
shown.value = pace.shown
watch(
  [() => props.text, () => props.streaming],
  ([text, streaming]) => {
    pace.update(text, Boolean(streaming))
    quiet.value = pace.quiet
    shown.value = pace.shown
  },
  { immediate: true },
)
onBeforeUnmount(() => pace.stop())

const visible = computed(() => wholeWords(props.text, shown.value, Boolean(props.streaming), quiet.value))
const pieces = computed(() => visible.value.split(/(\s+)/).filter(Boolean))
const animate = shown.value < props.text.length || props.streaming
</script>

<template>
  <template v-for="(piece, i) in pieces" :key="i">
    <template v-if="/^\s+$/.test(piece)">{{ piece }}</template>
    <!-- Each word comes into focus over 1.2s, far longer than the gap to the next: at a model's
         pace the band of words coming in spans several lines, a soft front moving on a slant. -->
    <span v-else :class="animate && 'animate-[blur-in_1200ms_var(--ease-in-out)_both] motion-reduce:animate-none'">{{
      piece
    }}</span>
  </template>
</template>
