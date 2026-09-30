<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import IconMorph from '../icon-morph/IconMorph.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import StatSparkline from './StatSparkline.vue'
import {
  statValueVariants,
  trendColorVar,
  type StatChartVariant,
  type StatSize,
  type StatTrendTone,
} from './stat.variants'

/**
 * A figure with its label, for a dashboard or a tool page: the label above in `text-meta`, the
 * value below it, its digits rolling to a new one by place value (TextMorph) rather than jumping.
 * An optional trend reads as a plain change; up is not always good, so its colour is the caller's
 * call (`trendTone`), never assumed from the arrow's direction. Given a `series`, the trend also
 * draws as a sparkline; the arrow steps aside then, since the shape already says which way things
 * went and an arrow beside it would only repeat it. `variant` picks the sparkline's own look
 * (`line`, a smooth curve; `bars`, for a value that comes one period at a time); `foot` sends it to
 * the bottom edge to edge instead of sitting small under the trend — meant for a Stat placed
 * directly inside a Card (not `CardContent`) of the same `size`: `foot` then pads its own text by
 * the Card's own gutter (as `CardContent` would) and leaves the chart unpadded, so it reaches the
 * sides on its own, and cancels only the Card's bottom padding (`-mb-4`/`-mb-6`) so it reaches the
 * bottom edge too; the Card's own `overflow-hidden` clips its corners. Hovering, dragging or the
 * arrow keys move a mark to the nearest point and the value and description morph into it
 * (`labels`, one per point); leaving, they morph back.
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
    /** Values behind the trend (e.g. one per week), drawn as a sparkline under it. */
    series?: number[]
    /** One name per `series` point (e.g. `"Week 3"`), shown while scrubbing that point. */
    labels?: string[]
    /** The sparkline's look: a smooth curve, or bars for a value that comes one period at a time. */
    variant?: StatChartVariant
    /** The sparkline fills its container edge to edge at the bottom, instead of sitting small under the trend. */
    foot?: boolean
    description?: string
    locale?: string
    options?: Intl.NumberFormatOptions
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md', trendTone: 'neutral', variant: 'line', foot: false },
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

// While a point is scrubbed (pointer or arrow keys, from StatSparkline), the figure and its
// description morph into that point's own value and name; leaving, they morph back (TextMorph).
const scrubIndex = ref<number | null>(null)
function onScrub(index: number | null) {
  scrubIndex.value = index
}
const scrubbedRaw = computed(() => (scrubIndex.value !== null ? props.series?.[scrubIndex.value] : undefined))
const shownValue = computed(() => {
  if (scrubbedRaw.value === undefined) return formattedValue.value
  return typeof props.value === 'number'
    ? new Intl.NumberFormat(props.locale, props.options).format(scrubbedRaw.value)
    : String(scrubbedRaw.value)
})
const shownDescription = computed(() => {
  const label = scrubIndex.value !== null ? props.labels?.[scrubIndex.value] : undefined
  return label ?? props.description ?? ''
})
// The row stays mounted whenever a description or labels are possible, so scrubbing rolls the
// text between them (TextMorph) instead of the row appearing and disappearing as it goes.
const hasDescriptionRow = computed(() => props.description !== undefined || (props.labels?.length ?? 0) > 0)

// `foot` pads its own text as a Card section would (Card gives no horizontal padding itself; each
// section adds its own, "How a component adapts" in DECISIONS.md) and cancels only the Card's
// bottom padding on the chart, so the text stays inset while the chart reaches every edge.
const footPadX = computed(() => (props.size === 'sm' ? 'px-4' : 'px-6'))
const footBleedBottom = computed(() => (props.size === 'sm' ? '-mb-4' : '-mb-6'))
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <span v-if="label" :class="cn('text-meta text-fg-muted', foot ? footPadX : '')">{{ label }}</span>
    <div :class="cn('flex flex-col gap-1', foot ? footPadX : '')" aria-live="polite" aria-atomic="true">
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <TextMorph :text="shownValue" :class="statValueVariants({ size })" />
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
      <StatSparkline
        v-if="hasSeries && !foot"
        :series="series!"
        :labels="props.labels"
        :tone="trendTone"
        :variant="variant"
        @scrub="onScrub"
      />
      <TextMorph v-if="hasDescriptionRow" as="p" :text="shownDescription" class="text-meta text-fg-muted" />
    </div>
    <StatSparkline
      v-if="hasSeries && foot"
      :series="series!"
      :labels="props.labels"
      :tone="trendTone"
      :variant="variant"
      foot
      :class="footBleedBottom"
      @scrub="onScrub"
    />
  </div>
</template>
