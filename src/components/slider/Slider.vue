<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, onBeforeUnmount, ref, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { useFieldGroup } from '../../utils/field'
import TextMorph from '../text-morph/TextMorph.vue'
import { sliderRangeClass, sliderRootClass, sliderThumbClass, sliderTrackClass } from './slider.variants'

/**
 * A value along a range, or two for a range between them (`v-model` as `[from, to]`). At rest the
 * thumb is a small knob; held or moved with the keys, it grows into a pill that shows the value,
 * its digits rolling as it changes (TextMorph), and shrinks back to the knob once let go. In a
 * Field, its label names it.
 */
const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    /** How the value reads in its pill: a unit, a currency, a time. */
    format?: (value: number) => string
    /** Its name for screen readers, when it is not in a Field. */
    label?: string
    disabled?: boolean
    name?: string
    class?: HTMLAttributes['class']
  }>(),
  { min: 0, max: 100, step: 1 },
)

const value = defineModel<number | number[]>({ default: 0 })
const values = computed({
  get: () => ([] as number[]).concat(value.value),
  set: (next: number[]) => (value.value = Array.isArray(value.value) ? next : next[0]!),
})
const text = (v: number) => (props.format ? props.format(v) : String(v))
const fieldAttrs = useFieldGroup()

// The thumb held: from a press until the pointer is let go, or while the keys move it and a moment
// after, so the value can be read before the pill folds back.
const held = ref<number>()
const LINGER = 900
let timer: ReturnType<typeof setTimeout> | undefined
const hold = (i: number) => {
  clearTimeout(timer)
  held.value = i
}
const release = (after = 0) => {
  clearTimeout(timer)
  timer = setTimeout(() => (held.value = undefined), after)
}
useEventListener<PointerEvent>(
  () => document,
  'pointerup',
  () => held.value !== undefined && release(),
)
onBeforeUnmount(() => clearTimeout(timer))

// Pressing the track moves the nearest thumb there, which is then the one held.
function onPress(event: PointerEvent) {
  const track = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const at = props.min + ((event.clientX - track.left) / track.width) * (props.max - props.min)
  const nearest = values.value.reduce(
    (best, v, i) => (Math.abs(v - at) < Math.abs(values.value[best]! - at) ? i : best),
    0,
  )
  hold(nearest)
}
function onKey(event: KeyboardEvent, i: number) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key))
    return
  hold(i)
  release(LINGER)
}

// The pill's width, measured from its text so it grows smoothly; the knob's is fixed.
const KNOB = 16
const widths = ref<number[]>([])
const measure = (el: Element | null, i: number) => {
  if (el) widths.value[i] = Math.max(36, (el as HTMLElement).offsetWidth + 20)
}
</script>

<template>
  <SliderRoot
    v-model="values"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :name="name"
    thumb-alignment="overflow"
    :class="cn(sliderRootClass, props.class)"
    @pointerdown.capture="onPress"
  >
    <SliderTrack :class="sliderTrackClass">
      <SliderRange :class="sliderRangeClass" />
    </SliderTrack>
    <SliderThumb
      v-for="(v, i) in values"
      :key="i"
      v-bind="fieldAttrs"
      :aria-label="label"
      :aria-valuetext="format ? text(v) : undefined"
      :data-active="held === i"
      :class="sliderThumbClass"
      :style="{ width: `${held === i ? (widths[i] ?? KNOB) : KNOB}px` }"
      @keydown="onKey($event, i)"
    >
      <!-- Measured at its full width, out of sight; the pill shows it once grown. -->
      <span
        :ref="(el) => measure(el as Element | null, i)"
        aria-hidden="true"
        class="invisible absolute whitespace-nowrap"
        >{{ text(v) }}</span
      >
      <span
        aria-hidden="true"
        :class="[
          'whitespace-nowrap transition-[opacity,filter] duration-200 motion-reduce:transition-none',
          held === i ? 'opacity-100 blur-0 delay-100' : 'opacity-0 blur-[2px]',
        ]"
      >
        <TextMorph :text="text(v)" />
      </span>
    </SliderThumb>
  </SliderRoot>
</template>
