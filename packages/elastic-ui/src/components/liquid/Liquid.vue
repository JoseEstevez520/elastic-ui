<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Liquid, the library's way for shapes that belong together to meet or part (DECISIONS, "Morph or
 * liquid: count the objects"). The shapes (the `shapes` slot: plain, positioned blocks of any
 * colour) are drawn on a layer of their own, blurred together and cut back to a hard edge, so two
 * that come close join by a liquid neck and one leaving another pulls out as a drop. The result is
 * filled with `fill`, which may be translucent (over an Aurora), and only then shadowed; the
 * content (the default slot) sits above, never filtered. For small, rounded shapes that read as
 * drops: pills, circles, dots.
 *
 * The shapes may reach past the component's box (drops pulled out of it): `overflow` is how far,
 * in pixels, so the filter does not cut them off.
 */
const props = withDefaults(
  defineProps<{
    /** The liquid's colour. */
    fill?: string
    /** How far apart two shapes still join: the blur, in pixels. */
    reach?: number
    /** How far the shapes may reach past the box, in pixels. */
    overflow?: number
    /** A shadow under the liquid, as a CSS filter (`drop-shadow(...)`). */
    shadow?: string
    class?: HTMLAttributes['class']
  }>(),
  { fill: 'var(--color-surface)', reach: 4, overflow: 0 },
)
const goo = `${useId()}-liquid`
</script>

<template>
  <div :class="cn('relative', props.class)">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute"
      :style="{ inset: `-${overflow}px`, filter: `url(#${goo}) ${shadow ?? ''}` }"
    >
      <!-- The shapes' own box, where the component's is, inside the room left for them. -->
      <div class="absolute" :style="{ inset: `${overflow}px` }">
        <slot name="shapes" />
      </div>
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
