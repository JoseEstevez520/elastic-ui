<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

/**
 * Internal: a sidebar label written in and erased letter by letter, as SkillNet does. Folding,
 * the letters go from the end; unfolding, they are written from the start, each row a touch after
 * the one above. The one exception to "one way of appearing" in the library (see DECISIONS.md).
 * Screen readers get the whole text.
 */
const props = defineProps<{ text: string; shown: boolean; index?: number }>()

// SkillNet's timings, in ms.
const WRITE_START = 60
const PER_ROW = 15
const PER_LETTER_IN = 15
const PER_LETTER_OUT = 16

const letters = computed(() => Array.from(props.text))

// A label too long for its row hides its end past the fading edge. Erasing starts from the last
// letter that can be seen, and the hidden ones go at once, so the erase is never a pause spent on
// letters no one sees. Measured as folding starts, before the letters change.
const root = useTemplateRef<HTMLElement>('root')
const letterEls = useTemplateRef<HTMLElement[]>('letter')
const seen = ref(Infinity)
watch(
  () => props.shown,
  (shown) => {
    if (shown) return
    const right = root.value?.parentElement?.getBoundingClientRect().right
    const els = letterEls.value
    if (right === undefined || !els) return
    const firstHidden = els.findIndex((el) => el.getBoundingClientRect().left >= right)
    seen.value = firstHidden === -1 ? els.length : firstHidden
  },
  { flush: 'pre' },
)

function delay(i: number) {
  if (props.shown) return WRITE_START + (props.index ?? 0) * PER_ROW + i * PER_LETTER_IN
  const last = Math.min(seen.value, letters.value.length) - 1
  return i > last ? 0 : (last - i) * PER_LETTER_OUT
}
</script>

<template>
  <span class="sr-only">{{ text }}</span>
  <span ref="root" aria-hidden="true">
    <span
      v-for="(letter, i) in letters"
      :key="i"
      ref="letter"
      :style="{ transitionDelay: `${delay(i)}ms` }"
      :class="['whitespace-pre transition-opacity duration-[20ms] motion-reduce:transition-none', !shown && 'opacity-0']"
    >{{ letter }}</span>
  </span>
</template>
