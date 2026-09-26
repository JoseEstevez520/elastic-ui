<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from 'vue'
import Aurora from '../../components/aurora/Aurora.vue'
import { cn } from '../../utils/cn'
import { paletteOf } from './palette'

/**
 * Lab: an aurora made from an image, as behind Apple Music's player. Two ways to try:
 *   lights   the library's Aurora, its four lights taken from the image's own colours;
 *   artwork  the image itself, blurred past recognition, in a few copies turning slowly at
 *            different paces, under the same grain.
 * `vivid` lifts the colour; otherwise it stays a soft tint the text reads on.
 */
const props = withDefaults(
  defineProps<{
    src: string
    look?: 'lights' | 'artwork'
    vivid?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { look: 'lights' },
)

const palette = ref<string[]>([])
watch(
  () => props.src,
  async (src) => {
    try {
      palette.value = await paletteOf(src)
    } catch {
      palette.value = []
    }
  },
  { immediate: true },
)

// The image's colours as the Aurora's lights, lifted a little in chroma so a muted photo still
// glows, and see-through as the Aurora's own are.
const lights = computed(() =>
  Object.fromEntries(
    palette.value.map((c, i) => [
      `--aurora-${i + 1}`,
      `oklch(from ${c} clamp(0.45, l, 0.8) calc(c * ${props.vivid ? 1.6 : 1.25}) h / ${props.vivid ? 0.8 : 0.6})`,
    ]),
  ),
)

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
// Three copies, each larger than the box and turning at its own pace, so the colour keeps moving
// without any loop showing.
const copies = [
  { place: '-left-1/4 -top-1/4 w-[120%]', period: 70, reverse: false, opacity: 1 },
  { place: '-right-1/4 top-0 w-[110%]', period: 95, reverse: true, opacity: 0.8 },
  { place: '-bottom-1/3 left-0 w-[100%]', period: 120, reverse: false, opacity: 0.7 },
]
</script>

<template>
  <Aurora v-if="look === 'lights'" :class="props.class" :style="lights">
    <slot />
  </Aurora>
  <div v-else :class="cn('relative isolate overflow-hidden', props.class)">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      <!-- A new image fades in over the last one, as Apple Music's changes from track to track. -->
      <Transition
        enter-active-class="transition-opacity duration-[1.2s] ease-linear"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-[1.2s] ease-linear"
        leave-to-class="opacity-0"
      >
        <div :key="src" class="absolute inset-0">
          <img
            v-for="(copy, i) in copies"
            :key="i"
            :src="src"
            alt=""
            crossorigin="anonymous"
            :class="[
              'absolute aspect-square rounded-full object-cover blur-[64px] will-change-transform',
              copy.place,
              'motion-reduce:animate-none',
            ]"
            :style="{
              opacity: copy.opacity,
              filter: `blur(64px) saturate(${vivid ? 1.8 : 1.3})`,
              animation: `lab-turn ${copy.period}s linear infinite ${copy.reverse ? 'reverse' : 'normal'}`,
            }"
          />
        </div>
      </Transition>
      <!-- A veil of the page's colour, so text reads on it; lighter when vivid. -->
      <div class="absolute inset-0 bg-[color:var(--color-bg)]" :class="vivid ? 'opacity-20' : 'opacity-45'" />
      <div class="absolute inset-0 opacity-25 mix-blend-overlay" :style="{ backgroundImage: GRAIN }" />
    </div>
    <slot />
  </div>
</template>

<style>
@keyframes lab-turn {
  to {
    rotate: 1turn;
  }
}
</style>
