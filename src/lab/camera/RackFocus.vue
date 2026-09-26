<script setup lang="ts">
import { prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: PageTransition as a change of focus. The page that goes drifts out of focus as it fades,
 * the next comes into focus as it appears, as a camera pulling focus from one shot to the next.
 * Still light, as it plays at every click: 150ms out, 280ms in, a 3px blur, no movement.
 */
defineProps<{ page: string }>()

const OUT = 150
const IN = 280

function leave(el: Element, done: () => void) {
  if (prefersReducedMotion() || !(el instanceof HTMLElement)) return done()
  el.animate(
    [
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0, filter: 'blur(3px)' },
    ],
    {
      duration: OUT,
      easing: 'ease-in',
      fill: 'forwards',
    },
  ).finished.then(done, done)
}
function enter(el: Element, done: () => void) {
  window.scrollTo({ top: 0, behavior: 'instant' })
  if (prefersReducedMotion() || !(el instanceof HTMLElement)) return done()
  el.animate(
    [
      { opacity: 0, filter: 'blur(3px)' },
      { opacity: 1, filter: 'blur(0px)' },
    ],
    {
      duration: IN,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  ).finished.then(done, done)
}
</script>

<template>
  <Transition mode="out-in" :css="false" @leave="leave" @enter="enter">
    <div :key="page"><slot /></div>
  </Transition>
</template>
