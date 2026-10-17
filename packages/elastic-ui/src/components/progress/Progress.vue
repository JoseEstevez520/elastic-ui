<script setup lang="ts">
import { motion, useSpring } from 'motion-v'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed, onBeforeUnmount, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import TextMorph from '../text-morph/TextMorph.vue'
import {
  progressCheckVariants,
  progressEndVariants,
  progressFillVariants,
  progressTrackClass,
  type ProgressTone,
} from './progress.variants'

/**
 * How much of something is done: a groove set into the page, filling from its start on the
 * library's ease, gliding to each new amount so steps run together rather than jump. With no
 * amount (`value` left out or `null`), a short length travels along it, calmly, until there is one.
 * Complete, the object says so itself: the track steps aside at its end and a check is drawn there,
 * while the amount above, if shown, morphs into "Complete". Behavior and ARIA come from Reka UI.
 */
// Attributes such as an `aria-label` name the bar itself, not the block round it.
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** How much is done, from 0 to `max`; `null` or left out while it is not known. */
    value?: number | null
    max?: number
    /** Named above the track, with the amount beside it. Without one, give the bar an `aria-label`. */
    label?: string
    /** Shows the amount (as a percentage) beside the label. */
    showValue?: boolean
    tone?: ProgressTone
    completeLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { value: null, max: 100, showValue: false, tone: 'default', completeLabel: labelFor('complete') },
)

const known = computed(() => props.value !== null && props.value !== undefined)
const ratio = computed(() => (known.value ? Math.min(1, Math.max(0, props.value! / props.max)) : 0))
const complete = computed(() => known.value && ratio.value >= 1)

// The fill and the amount follow the value on a spring, which keeps its speed from one update to
// the next: a tween restarted on every update slows to a stop before each new one and moves in
// jerks. Damped past critical, so it never overshoots (no bounce). Reduced motion jumps.
const follow = useSpring(ratio.value, { stiffness: 22, damping: 12 })
const shown = ref(ratio.value)
const unfollow = follow.on('change', (v) => (shown.value = v))
watch(ratio, (to) => (prefersReducedMotion() ? follow.jump(to) : follow.set(to)))
onBeforeUnmount(unfollow)
const shownAmount = computed(() => Math.round(shown.value * 100))
// Told complete once the fill has got there, not as the value does: the fill trails a little.
const landed = computed(() => complete.value && shown.value > 0.995)
// Cut back from its end rather than scaled, so its round end keeps its shape at any length.
const fillStyle = computed(() => ({ clipPath: `inset(0 ${((1 - shown.value) * 100).toFixed(3)}% 0 0 round 999px)` }))

// Only the move from the amount to "Complete" morphs; the amount itself just counts, in digits of
// one width, since a morph on every tick would be noise.
const amountText = computed(() => (landed.value ? props.completeLabel : `${shownAmount.value}%`))

// The travelling length: a third of the track, from before its start to past its end, easing in
// and out so it never snaps round. Still, and centred, for reduced motion.
const travel = computed(() =>
  prefersReducedMotion()
    ? { x: '100%' }
    : { x: ['-100%', '300%'], transition: { duration: 1.6, ease: 'easeInOut', repeat: Infinity } },
)
</script>

<template>
  <div :class="cn('flex w-full flex-col gap-2', props.class)">
    <div v-if="label || showValue" class="flex items-baseline justify-between gap-4">
      <span v-if="label" class="text-label text-fg">{{ label }}</span>
      <span v-if="showValue && known" class="text-meta tabular-nums text-fg-muted" aria-hidden="true">
        <TextMorph v-if="landed" :text="amountText" />
        <template v-else>{{ amountText }}</template>
      </span>
    </div>
    <div class="flex items-center">
      <ProgressRoot
        :model-value="known ? Math.min(props.value!, max) : null"
        :max="max"
        :aria-label="label"
        v-bind="$attrs"
        :class="progressTrackClass"
      >
        <ProgressIndicator v-if="known" as-child>
          <span :class="progressFillVariants({ tone })" :style="fillStyle" />
        </ProgressIndicator>
        <ProgressIndicator v-else as-child>
          <motion.span
            :class="[progressFillVariants({ tone }), 'w-1/3 right-auto transition-none']"
            :initial="{ x: '-100%' }"
            :animate="travel"
          />
        </ProgressIndicator>
      </ProgressRoot>
      <span :class="progressEndVariants({ shown: landed })" aria-hidden="true">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4 shrink-0"
        >
          <path d="m3.5 8.5 3 3 6-7" :class="progressCheckVariants({ shown: landed })" />
        </svg>
      </span>
    </div>
  </div>
</template>
