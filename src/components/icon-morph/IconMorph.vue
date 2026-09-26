<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { glyphs, pathOf, type Glyph, type GlyphName } from './glyphs'

/**
 * An icon that becomes another, as TextMorph's text does: its strokes travel point by point
 * from one shape to the next (the menu's lines crossing into a close, play folding into pause), on
 * the library's ease, rather than one icon shrinking away as the next grows in (IconSwap). Strokes
 * an icon does not need fold onto one it keeps and fade, so nothing appears from nowhere.
 */
const props = defineProps<{ icon: GlyphName; class?: HTMLAttributes['class'] }>()
// A menu that closes, play that pauses, a send that is done: name the button, not the icon, which
// is only drawn (`aria-hidden`).
const strokes = computed<Glyph>(() => glyphs[props.icon])
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    :class="cn('size-4 shrink-0', props.class)"
  >
    <path
      v-for="(stroke, i) in strokes"
      :key="i"
      :style="{ d: `path('${pathOf(stroke)}')`, opacity: stroke.hidden ? 0 : 1 }"
      class="transition-[d,opacity] duration-[350ms] ease-emphasized motion-reduce:transition-none"
    />
  </svg>
</template>
