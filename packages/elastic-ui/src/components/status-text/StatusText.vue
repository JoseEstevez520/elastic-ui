<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * A line that says what is going on. While `working` it shimmers ("Searching the web…"); every
 * new text morphs from the last, and once done it turns into what came of it ("Read 3 sources")
 * instead of being replaced. When it fails it turns the same way into what went wrong, and into
 * the danger colour: no icon, no box. The one way the library tells that something is under way,
 * as in ChatMessage and ChatTool; short text only, as TextMorph.
 *
 * With `delay` it waits that long before showing, and comes into focus then: a wait shorter than
 * that shows nothing at all, instead of a flash of "Loading…" that is gone before it can be read.
 */
const props = withDefaults(
  defineProps<{
    text: string
    working?: boolean
    /** Something went wrong: set with the text saying what. */
    error?: boolean
    /** Milliseconds to wait before showing, for a wait that is often too short to notice. */
    delay?: number
    as?: string
    class?: HTMLAttributes['class']
  }>(),
  { as: 'span', delay: 0 },
)

const shown = ref(!props.delay)
let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  if (props.delay) timer = setTimeout(() => (shown.value = true), props.delay)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <!-- Announced while it works, so each new step is read out, and at once when it fails. The
       colour at rest is the caller's; the danger colour comes in as the words morph. -->
  <component
    :is="as"
    v-if="shown"
    :role="error ? 'alert' : working ? 'status' : undefined"
    :class="
      cn(
        working && !error ? 'text-shimmer' : 'transition-colors duration-350 ease-emphasized',
        delay && 'animate-blur-in motion-reduce:animate-none',
        props.class,
        error && 'text-[color:var(--color-danger)]',
      )
    "
  >
    <TextMorph :text="text" />
  </component>
</template>
