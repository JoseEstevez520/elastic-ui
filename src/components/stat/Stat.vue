<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import IconMorph from '../icon-morph/IconMorph.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import StatSparkline from './StatSparkline.vue'
import { statValueVariants, trendColorVar, type StatSize, type StatTrendTone } from './stat.variants'

/**
 * A figure with its label, for a dashboard or a tool page: the label above in `text-meta`, the
 * value below it, its digits rolling to a new one by place value (TextMorph) rather than jumping.
 * An optional trend reads as a plain change; up is not always good, so its colour is the caller's
 * call (`trendTone`), never assumed from the arrow's direction. Given a `series`, the trend also
 * draws as a small sparkline under the value; the arrow steps aside then, since the shape of the
 * line already says which way things went and an arrow beside it would only repeat it.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    /** A number is formatted with `Intl.NumberFormat` (`locale`, `options`); a string shows as is. */
    value: number | string
    size?: StatSize
    /** A change since before, e.g. `+12` or `-4`; left out, no trend shows. */
    trend?: number
    /** Colours the trend and the sparkline; up is not always good, so the caller decides. */
    trendTone?: StatTrendTone
    /** Values behind the trend (e.g. one per week), drawn as a small line under it. */
    series?: number[]
    description?: string
    locale?: string
    options?: Intl.NumberFormatOptions
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md', trendTone: 'neutral' },
)
const labels = useLabels()

const formattedValue = computed(() =>
  typeof props.value === 'number'
    ? new Intl.NumberFormat(props.locale, props.options).format(props.value)
    : props.value,
)

const trendUp = computed(() => (props.trend ?? 0) >= 0)
const trendText = computed(() => (props.trend === undefined ? '' : `${props.trend > 0 ? '+' : ''}${props.trend}%`))
const trendColor = computed(() => trendColorVar(props.trendTone))
const hasSeries = computed(() => (props.series?.length ?? 0) > 0)
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <span v-if="label" class="text-meta text-fg-muted">{{ label }}</span>
    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <TextMorph :text="formattedValue" :class="statValueVariants({ size })" />
      <span
        v-if="trend !== undefined"
        class="inline-flex items-center gap-1 text-meta tabular-nums"
        :class="trendColor ? '' : 'text-fg-muted'"
        :style="trendColor ? { color: trendColor } : undefined"
      >
        <IconMorph
          v-if="!hasSeries"
          icon="arrowUp"
          class="size-3 transition-transform duration-[250ms] ease-emphasized motion-reduce:transition-none"
          :class="trendUp ? '' : 'rotate-180'"
        />
        <TextMorph :text="trendText" />
        <span class="sr-only">{{ trendUp ? labels.trendUp : labels.trendDown }}</span>
      </span>
    </div>
    <StatSparkline v-if="hasSeries" :series="series!" :tone="trendTone" />
    <p v-if="description" class="text-meta text-fg-muted">{{ description }}</p>
  </div>
</template>
