<script setup lang="ts">
import { TextMorph } from 'torph/vue'
import { bezier, EASE_EMPHASIZED } from '../../utils/motion'

/**
 * Text that turns into other text: the letters both share fly to their new places, rearranging
 * like an anagram, while the rest leave and arrive around them; numbers roll by place value.
 * Built on Torph (MIT), which splits the text with `Intl.Segmenter` and animates it with the
 * browser's own animations; this part only sets the library's pace and keeps text from scaling.
 */
withDefaults(defineProps<{ text: string; as?: string; class?: string }>(), { as: 'span' })

// Quick enough to read as the word simply becoming the other one, not as a show.
const DURATION = 350
const EASE = bezier(EASE_EMPHASIZED)
</script>

<template>
  <!-- `scale` off: letters leaving and arriving only move and fade; text never scales. -->
  <TextMorph :text="text" :as="as" :class="$props.class" :duration="DURATION" :ease="EASE" :scale="false" />
</template>
