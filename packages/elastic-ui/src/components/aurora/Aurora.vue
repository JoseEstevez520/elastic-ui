<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

export type AuroraActivity = 'rest' | 'thinking' | 'answering'

/**
 * A soft glow of colour behind its content: a few blurred lights drifting slowly under a fine
 * grain, as behind the empty screen of an AI chat. Once `settled` (the conversation has started),
 * it calms down and sinks to a softer tint instead of vanishing.
 *
 * It follows what the work behind it is doing (`activity`): thinking, the lights gather in and
 * hurry; answering, they spread out and flow at an easier pace; at rest they drift slowly again.
 * The speed changes by easing the lights' own animations up and down, so they never jump.
 *
 * On a touch screen the lights hold still at rest and only drift while the work behind them moves
 * (thinking, answering). Drifting, they are redrawn on every frame for as long as they show, which
 * keeps a phone's graphics busy and warm for a movement too slow to see on its screen, and leaves
 * it no room for what the page does next (a card opening over it).
 *
 * Its colours are its own (blue, violet, peach, pink), not the accent: a project with a neutral
 * accent keeps a coloured aurora. Change them with `--aurora-1` to `--aurora-4`.
 */
const props = withDefaults(
  defineProps<{
    /** The conversation has started: calmer, sunk to a softer tint (while at rest). */
    settled?: boolean
    activity?: AuroraActivity
    class?: HTMLAttributes['class']
  }>(),
  { settled: false, activity: 'rest' },
)

// Each light: where it rests, how big it is, how far and how slowly it drifts. The periods don't
// share a factor, so the four never line up into a visible loop.
const lights = [
  { color: 'var(--aurora-1, light-dark(oklch(0.68 0.16 255 / 0.7), oklch(0.6 0.17 255 / 0.65)))', place: '-top-[15%] -left-[15%] w-[80%]', drift: '12% 10%', period: 23 },
  { color: 'var(--aurora-2, light-dark(oklch(0.72 0.17 295 / 0.7), oklch(0.55 0.22 295 / 0.65)))', place: '-top-[5%] -right-[20%] w-[75%]', drift: '-14% 12%', period: 29 },
  { color: 'var(--aurora-3, light-dark(oklch(0.84 0.11 60 / 0.75), oklch(0.66 0.15 45 / 0.5)))', place: 'top-[40%] -left-[10%] w-[70%]', drift: '10% -12%', period: 37 },
  { color: 'var(--aurora-4, light-dark(oklch(0.76 0.14 350 / 0.6), oklch(0.58 0.2 355 / 0.5)))', place: 'top-[55%] -right-[15%] w-[70%]', drift: '-10% -10%', period: 31 },
]

const WASH =
  'linear-gradient(160deg, color-mix(in oklab, var(--aurora-1, oklch(0.65 0.16 255)) 18%, transparent), color-mix(in oklab, var(--aurora-2, oklch(0.65 0.2 295)) 18%, transparent) 55%, color-mix(in oklab, var(--aurora-3, oklch(0.8 0.12 55)) 16%, transparent))'

// How much faster than at rest the lights drift in each activity.
const PACE: Record<AuroraActivity, number> = { rest: 1, thinking: 6, answering: 2.5 }

// Eases the lights' playback rate towards the activity's pace, a little every frame, so a change
// of pace reads as the lights speeding up or slowing down rather than jumping to a new place.
const field = useTemplateRef<HTMLElement>('field')
let rate = 1
let frame = 0
function ease() {
  const target = PACE[props.activity]
  rate += (target - rate) * 0.03
  if (Math.abs(target - rate) < 0.01) rate = target
  // Only the drift: the field's own transitions keep their pace.
  for (const animation of field.value?.getAnimations({ subtree: true }) ?? [])
    if (animation instanceof CSSAnimation) animation.playbackRate = rate
  frame = rate === target ? 0 : requestAnimationFrame(ease)
}
watch(
  () => props.activity,
  () => {
    if (!frame) frame = requestAnimationFrame(ease)
  },
)
onBeforeUnmount(() => cancelAnimationFrame(frame))

// Out of view the lights are paused: four large blurred layers drifting for nobody still cost a
// frame's work each. The animations keep their place, so they carry on from where they stopped.
// On a touch screen they are paused at rest too (see above).
const root = useTemplateRef<HTMLElement>('root')
const inView = ref(true)
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry) inView.value = entry.isIntersecting
  })
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

// Thinking draws the lights in and brightens them; answering spreads them a little; at rest a
// settled aurora sinks and dims.
const fieldClass = computed(() =>
  props.activity === 'thinking'
    ? 'scale-[0.85] opacity-100'
    : props.activity === 'answering'
      ? 'scale-110 opacity-100'
      : props.settled
        ? 'translate-y-[20%] opacity-60'
        : 'opacity-100',
)

// Fine grey noise over the lights, so the gradients don't band into steps and the colour reads
// as a surface, like paper under light rather than a flat screen.
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
</script>

<template>
  <div ref="root" :class="cn('relative isolate overflow-hidden', props.class)">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      <!-- A wash of the same colours under the lights, so no plain background shows between them. -->
      <div
        class="absolute inset-0 transition-opacity duration-[1.6s] ease-glide"
        :class="settled && activity === 'rest' ? 'opacity-50' : 'opacity-100'"
        :style="{ background: WASH }"
      />
      <div
        ref="field"
        :class="['absolute inset-0 transition-[opacity,translate,scale] duration-[1.6s] ease-glide motion-reduce:transition-none', fieldClass]"
      >
        <!-- The drift moves the outer box; the blur sits on a still child, so the compositor keeps
             the blurred light and only moves it, instead of blurring it again on every frame. -->
        <div
          v-for="(light, i) in lights"
          :key="i"
          :class="['absolute aspect-square will-change-transform', light.place, 'animate-[aurora-drift_var(--period)_var(--ease-in-out)_infinite_alternate] motion-reduce:animate-none', !inView && '[animation-play-state:paused]', activity === 'rest' && 'pointer-coarse:[animation-play-state:paused]']"
          :style="{ '--drift': light.drift, '--period': `${light.period}s` }"
        >
          <div class="size-full rounded-full blur-3xl" :style="{ background: `radial-gradient(closest-side, ${light.color}, transparent)` }" />
        </div>
      </div>
      <!-- On touch screens the grain is laid over the lights instead of blended into them: a blend
           reads what is behind it on every frame, which costs a phone about a fifth of its work. -->
      <div class="absolute inset-0 opacity-25 mix-blend-overlay pointer-coarse:opacity-[0.06] pointer-coarse:mix-blend-normal" :style="{ backgroundImage: GRAIN }" />
    </div>
    <slot />
  </div>
</template>
