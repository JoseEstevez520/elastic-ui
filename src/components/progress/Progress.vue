<script setup lang="ts">
import { animate, motion } from 'motion-v'
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

// The amount on show counts up to each new value on the fill's own pace (as ProgressButton's), so
// the figure and the fill climb together instead of the number jumping.
const GLIDE = { duration: 0.5, ease: 'easeOut' } as const
const shownAmount = ref(Math.round(ratio.value * 100))
let counting: { stop: () => void } | undefined
watch(ratio, (to) => {
  counting?.stop()
  const target = Math.round(to * 100)
  if (target < shownAmount.value || prefersReducedMotion()) return void (shownAmount.value = target)
  counting = animate(shownAmount.value, target, { ...GLIDE, onUpdate: (v) => (shownAmount.value = Math.round(v)) })
})
onBeforeUnmount(() => counting?.stop())

// Only the move from the amount to "Complete" morphs; the amount itself just counts, in digits of
// one width, since a morph on every tick would be noise.
const amountText = computed(() => (complete.value ? props.completeLabel : `${shownAmount.value}%`))

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
        <TextMorph v-if="complete" :text="amountText" />
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
          <span :class="progressFillVariants({ tone })" :style="{ scale: `${ratio} 1` }" />
        </ProgressIndicator>
        <ProgressIndicator v-else as-child>
          <motion.span
            :class="[progressFillVariants({ tone }), 'w-1/3 right-auto transition-none']"
            :initial="{ x: '-100%' }"
            :animate="travel"
          />
        </ProgressIndicator>
      </ProgressRoot>
      <span :class="progressEndVariants({ shown: complete })" aria-hidden="true">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4 shrink-0"
        >
          <path d="m3.5 8.5 3 3 6-7" :class="progressCheckVariants({ shown: complete })" />
        </svg>
      </span>
    </div>
  </div>
</template>
