<script setup lang="ts">
import { prefersReducedMotion } from '../../utils/motion'

/**
 * Going from one page to another, only the content changes (USAGE 12), and lightly, since it
 * happens at every click: the page that goes fades where it is, the scroll is back at the top, and
 * the next fades in, whole: 100ms out and 200ms in, as Material's fade through, but without its
 * scaling, since text never scales here. No wave, no blur, no movement.
 * Everything outside it (the Sidebar, the page's header, the breadcrumbs) stays still and changes
 * in its own way. The first page just shows.
 *
 * Wrap what changes, keyed by the page: with Vue Router,
 * `<RouterView v-slot="{ Component, route }"><PageTransition :page="route.path"><component :is="Component" /></PageTransition></RouterView>`.
 */
const props = defineProps<{
  /** Which page it is; a new one plays the change. */
  page: string
  /** What scrolls, when it is not the page: an element, or a selector for it. */
  scroller?: HTMLElement | string
}>()
const emit = defineEmits<{ changed: [] }>()

const OUT = 100
const IN = 200

function leave(el: Element, done: () => void) {
  if (prefersReducedMotion() || !(el instanceof HTMLElement)) return done()
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT, easing: 'linear', fill: 'forwards' }).finished.then(done, done)
}

// Back to the top, at once, before the new page shows.
function toTop() {
  const el = typeof props.scroller === 'string' ? document.querySelector(props.scroller) : props.scroller
  if (el) el.scrollTop = 0
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

function enter(el: Element, done: () => void) {
  toTop()
  emit('changed')
  if (prefersReducedMotion() || !(el instanceof HTMLElement)) return done()
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN, easing: 'ease-out' }).finished.then(done, done)
}
</script>

<template>
  <Transition mode="out-in" :css="false" @leave="leave" @enter="enter">
    <!-- A plain block, not `display: contents`, which could not fade. -->
    <div :key="page">
      <slot />
    </div>
  </Transition>
</template>
