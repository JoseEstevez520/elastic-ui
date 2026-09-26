<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Lab: liquid, the library's way for two shapes that belong together to meet or part, as the
 * send button pulls out of ChatComposer's pill. The shapes (the `shapes` slot: plain, positioned
 * blocks of any colour) are drawn on a layer of their own, blurred together and cut back to a hard
 * edge, so the gap between two that come close becomes a liquid neck, and one leaving another
 * pulls out as a drop. The result is filled with `fill`, which may be translucent, and only then
 * shadowed; the content (the default slot) sits above, never filtered.
 */
const props = withDefaults(
  defineProps<{
    /** The liquid's colour. */
    fill?: string
    /** How far apart two shapes still join: the blur, in pixels. */
    reach?: number
    class?: HTMLAttributes['class']
  }>(),
  { fill: 'var(--color-surface)', reach: 4 },
)
const goo = `${useId()}-liquid`
</script>

<template>
  <div :class="cn('relative', props.class)">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0" :style="{ filter: `url(#${goo})` }">
      <slot name="shapes" />
    </div>
    <slot />
    <svg aria-hidden="true" class="absolute size-0">
      <defs>
        <filter :id="goo">
          <feGaussianBlur in="SourceGraphic" :stdDeviation="reach" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -9" result="shape" />
          <feFlood :style="{ floodColor: fill }" result="fill" />
          <feComposite in="fill" in2="shape" operator="in" />
        </filter>
      </defs>
    </svg>
  </div>
</template>
