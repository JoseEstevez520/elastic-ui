<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useEventListener } from '../../composables/useEventListener'
import { prefersReducedMotion } from '../../utils/motion'
import { provideMarqueeContext } from './marquee.context'
import type { MarqueeSize } from './marquee.variants'

/**
 * A band of short entries passing by in a loop, slowly, inside its column: results, clients, a
 * stack. For a few things worth seeing that a still row would undersell; what has to be read
 * carefully stays still. Taken from the Portfolio's achievements band.
 *
 * It moves at a steady speed whatever it holds: its duration is worked out from its length, so a
 * longer band is not a faster one. It repeats its entries until they span its width, so a short
 * list never leaves a gap, and its ends fade rather than cut a word off at the column's edge.
 *
 * Pointing at it stops it, and so does leaving the view. Screen readers hear the entries once, as
 * a list, not the band's repetitions; with reduced motion it is that list, still and wrapping.
 */
const props = withDefaults(
  defineProps<{
    /** What the entries are, for screen readers: the list's name. */
    label: string
    /** In pixels a second. */
    speed?: number
    size?: MarqueeSize
    class?: HTMLAttributes['class']
  }>(),
  { speed: 40, size: 'md' },
)

provideMarqueeContext({ size: toRef(props, 'size') })

const still = ref(false)
const inView = ref(true)

const viewport = useTemplateRef<HTMLElement>('viewport')
const copies = useTemplateRef<HTMLElement[]>('copies')

// How many times the entries repeat inside one copy, and how wide one round of them is.
const repeats = ref(1)
const roundWidth = ref(0)
const duration = computed(() => (roundWidth.value ? `${(roundWidth.value * repeats.value) / props.speed}s` : undefined))

function measure() {
  const box = viewport.value
  const copy = copies.value?.[0]
  if (!box || !copy) return
  const round = copy.getBoundingClientRect().width / repeats.value
  if (!round) return
  roundWidth.value = round
  // Enough rounds that one copy spans the band: the second then follows on without a gap.
  const needed = Math.max(1, Math.ceil(box.getBoundingClientRect().width / round))
  if (needed !== repeats.value) repeats.value = needed
}

// Both ends fade over `--marquee-fade`, so a word is never cut off at the column's edge.
const fadedEnds =
  'linear-gradient(to right, transparent, #000 var(--marquee-fade, 3rem), #000 calc(100% - var(--marquee-fade, 3rem)), transparent)'

let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
const reducedQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)')

onMounted(() => {
  still.value = prefersReducedMotion()
  measure()
  resizeObserver = new ResizeObserver(measure)
  if (viewport.value) resizeObserver.observe(viewport.value)
  intersectionObserver = new IntersectionObserver(([entry]) => {
    if (entry) inView.value = entry.isIntersecting
  })
  if (viewport.value) intersectionObserver.observe(viewport.value)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
})
useEventListener(reducedQuery, 'change', () => (still.value = prefersReducedMotion()))
</script>

<template>
  <!-- Still: the entries once, wrapping, for everyone. -->
  <ul v-if="still" :aria-label="label" :class="cn('flex flex-wrap gap-y-2', props.class)">
    <slot />
  </ul>

  <div v-else :class="cn('group/marquee relative', props.class)">
    <ul :aria-label="label" class="sr-only"><slot /></ul>

    <div
      ref="viewport"
      aria-hidden="true"
      class="overflow-hidden"
      :style="{ maskImage: fadedEnds }"
    >
      <!-- Waits for its length before it moves, so it never starts at a guessed speed. -->
      <div
        :style="{ '--marquee-duration': duration }"
        :class="[
          'flex w-max group-hover/marquee:[animation-play-state:paused]',
          duration && 'animate-marquee',
          !inView && '[animation-play-state:paused]',
        ]"
      >
        <ul v-for="copy in 2" :key="copy" ref="copies" class="flex shrink-0">
          <template v-for="round in repeats" :key="round"><slot /></template>
        </ul>
      </div>
    </div>
  </div>
</template>
