<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * A line that says what is going on. While `working` it shimmers ("Searching the web…"); every
 * new text morphs from the last, and once done it turns into what came of it ("Read 3 sources")
 * instead of being replaced. When it fails it turns the same way into what went wrong, and into
 * the danger colour: no icon, no box. The one way the library tells that something is under way,
 * as in ChatMessage and ChatTool; short text only, as TextMorph.
 */
const props = withDefaults(
  defineProps<{
    text: string
    working?: boolean
    /** Something went wrong: set with the text saying what. */
    error?: boolean
    as?: string
    class?: HTMLAttributes['class']
  }>(),
  { as: 'span' },
)
</script>

<template>
  <!-- Announced while it works, so each new step is read out, and at once when it fails. The
       colour at rest is the caller's; the danger colour comes in as the words morph. -->
  <component
    :is="as"
    :role="error ? 'alert' : working ? 'status' : undefined"
    :class="
      cn(
        working && !error ? 'text-shimmer' : 'transition-colors duration-350 ease-emphasized',
        props.class,
        error && 'text-[color:var(--color-danger)]',
      )
    "
  >
    <TextMorph :text="text" />
  </component>
</template>
