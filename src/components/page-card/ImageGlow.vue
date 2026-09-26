<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Internal: a ground glowing in an image's colours, as behind Apple Music's player: the image
 * itself, blurred past recognition, in a few copies turning slowly at their own paces, under a
 * veil of the page's colour and the Aurora's grain. Drawn small and scaled up to cover the box as
 * one layer, so it is cheap to show and to resize while a box grows.
 */
const props = defineProps<{ src: string; class?: HTMLAttributes['class'] }>()

const root = useTemplateRef<HTMLElement>('root')
const cover = ref(1)
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const { width, height } = entry!.contentRect
    cover.value = (Math.max(width, height) / 96) * 1.3
  })
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
// Each copy larger than the box and turning at its own pace, so no loop ever shows.
const copies = [
  { place: '-left-1/4 -top-1/4 w-[120%]', period: 70, reverse: false, opacity: 1 },
  { place: '-right-1/4 top-0 w-[110%]', period: 95, reverse: true, opacity: 0.8 },
  { place: '-bottom-1/3 left-0 w-[100%]', period: 120, reverse: false, opacity: 0.7 },
]
</script>

<template>
  <div ref="root" aria-hidden="true" :class="cn('pointer-events-none overflow-hidden', props.class)">
    <div
      class="absolute top-1/2 left-1/2 size-24 will-change-transform"
      :style="{ transform: `translate(-50%, -50%) scale(${cover})` }"
    >
      <img
        v-for="(copy, i) in copies"
        :key="i"
        :src="src"
        alt=""
        :class="['absolute aspect-square rounded-full object-cover motion-reduce:animate-none', copy.place]"
        :style="{
          opacity: copy.opacity,
          filter: 'blur(10px) saturate(1.3)',
          animation: `image-glow-turn ${copy.period}s linear infinite ${copy.reverse ? 'reverse' : 'normal'}`,
        }"
      />
    </div>
    <!-- A veil of the page's colour, so text reads on it. -->
    <div class="absolute inset-0 bg-[color:var(--color-bg)] opacity-45" />
    <div class="absolute inset-0 opacity-25 mix-blend-overlay" :style="{ backgroundImage: GRAIN }" />
  </div>
</template>

<style>
@keyframes image-glow-turn {
  to {
    rotate: 1turn;
  }
}
</style>
