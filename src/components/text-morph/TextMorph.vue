<script setup lang="ts">
import { TextMorph } from 'torph/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { afterPaint, bezier, EASE_EMPHASIZED } from '../../utils/motion'

/**
 * Text that turns into other text: the letters both share fly to their new places, rearranging
 * like an anagram, while the rest leave and arrive around them; numbers roll by place value.
 * Built on Torph (MIT), which splits the text with `Intl.Segmenter` and animates it with the
 * browser's own animations; this part only sets the library's pace and keeps text from scaling.
 */
const props = withDefaults(defineProps<{ text: string; as?: string; class?: string }>(), { as: 'span' })

// Quick enough to read as the word simply becoming the other one, not as a show.
const DURATION = 350
const EASE = bezier(EASE_EMPHASIZED)

// At rest the text is just text. Torph sets each letter in a box of its own, which loses the
// kerning between them and lands each on its own fraction of a pixel, showing as uneven gaps
// ("Mo dules") that shift as it re-measures. So it only takes over while the text changes: it
// starts from the old words, is handed the new ones once it has painted them, and gives the text
// back once the morph is over. Timed rather than waiting for Torph's event, which never comes
// when there is nothing to animate. Kerning stays off in both, at rest as while it morphs: the
// letters' boxes have none, so with kerning on the hand-back itself would shift a letter by a
// fraction of a pixel at the end, a last little tremble.
const classes = computed(() =>
  ['[font-kerning:none] [font-variant-ligatures:none]', props.class].filter(Boolean).join(' '),
)
const morphing = ref(false)
const shown = ref(props.text)
let settle: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.text,
  (text, before) => {
    if (morphing.value) shown.value = text
    else {
      shown.value = before
      morphing.value = true
      afterPaint(() => (shown.value = props.text))
    }
    clearTimeout(settle)
    settle = setTimeout(() => (morphing.value = false), DURATION + 150)
  },
)
onBeforeUnmount(() => clearTimeout(settle))
</script>

<template>
  <!-- `scale` off: letters leaving and arriving only move and fade; text never scales. -->
  <TextMorph v-if="morphing" :text="shown" :as="as" :class="classes" :duration="DURATION" :ease="EASE" :scale="false" />
  <component :is="as" v-else :class="classes">{{ text }}</component>
</template>
